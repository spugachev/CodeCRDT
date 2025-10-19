# Multi-stage build for frontend, backend, and nginx

# Stage 1: Build backend TypeScript
FROM node:24-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build
## Prune dev dependencies after build to produce production node_modules
RUN npm prune --omit=dev

# Stage 2: Build frontend
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

## Stage 3: Provide Node runtime matching builder version
FROM node:24-alpine AS node-runtime

# Stage 4: Production image with nginx and backend
FROM nginx:alpine

ENV NODE_ENV=production

# Install only what we need at runtime
RUN apk add --no-cache supervisor curl

# Create unprivileged user for backend process
RUN addgroup -S app && adduser -S -G app app

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Setup backend
WORKDIR /app/backend
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist

# Create data directory for SQLite database and set permissions
RUN mkdir -p /app/backend/data && \
    touch /app/backend/data/crdt.sqlite && \
    chown -R app:app /app/backend

# Copy frontend build to nginx directory
COPY --from=frontend-builder /app/frontend/build/client /usr/share/nginx/html

# Copy Node runtime from node:24-alpine image
COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node-runtime /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm || true

# Create supervisord configuration
RUN mkdir -p /etc/supervisor.d /var/log && \
    touch /var/log/backend.err.log /var/log/backend.out.log /var/log/nginx.err.log /var/log/nginx.out.log
RUN echo "[supervisord]" > /etc/supervisord.conf && \
    echo "nodaemon=true" >> /etc/supervisord.conf && \
    echo "" >> /etc/supervisord.conf && \
    echo "[program:backend]" >> /etc/supervisord.conf && \
    echo "command=node /app/backend/dist/index.js" >> /etc/supervisord.conf && \
    echo "directory=/app/backend" >> /etc/supervisord.conf && \
    echo "user=app" >> /etc/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisord.conf && \
    echo "stderr_logfile=/var/log/backend.err.log" >> /etc/supervisord.conf && \
    echo "stdout_logfile=/var/log/backend.out.log" >> /etc/supervisord.conf && \
    echo "" >> /etc/supervisord.conf && \
    echo "[program:nginx]" >> /etc/supervisord.conf && \
    echo "command=nginx -g 'daemon off;'" >> /etc/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisord.conf && \
    echo "stderr_logfile=/var/log/nginx.err.log" >> /etc/supervisord.conf && \
    echo "stdout_logfile=/var/log/nginx.out.log" >> /etc/supervisord.conf

VOLUME ["/app/backend/data"]

# Expose port 80 for nginx
EXPOSE 80

# Healthcheck for backend API through nginx
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -fsS http://localhost/api/v1/health || exit 1

# Start both services with supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
