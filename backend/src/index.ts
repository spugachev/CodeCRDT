import { createServer, type IncomingMessage } from "node:http";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import type { Socket } from "node:net";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import type WebSocket from "ws";
import compression from "compression";
import { Hocuspocus } from "@hocuspocus/server";
import type { onConnectPayload } from "@hocuspocus/server";
import { SQLite } from "@hocuspocus/extension-sqlite";
import express, { Application, Request, Response, NextFunction } from "express";
import v1Routes from "./api/routes/v1";

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

app.disable("x-powered-by");
app.use(helmet());

const CORS_ORIGIN = process.env.CORS_ORIGIN;
app.use(
  CORS_ORIGIN ? cors({ origin: CORS_ORIGIN, credentials: true }) : cors()
);

app.use(compression());

const JSON_LIMIT = process.env.JSON_LIMIT || "10mb";
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

app.use("/api/v1", v1Routes);

app.use((_: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Express error handler for invalid JSON and other errors
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  console.error("Unhandled application error:", err);

  return res.status(500).json({ error: "Internal server error" });
});

const server = createServer(app);
const sqlitePath = resolve(process.cwd(), "./data/crdt.sqlite");
const sqliteDir = dirname(sqlitePath);
if (!existsSync(sqliteDir)) {
  mkdirSync(sqliteDir, { recursive: true });
  console.log(`Created CRDT database directory: ${sqliteDir}`);
}

let hocuspocus: Hocuspocus;
try {
  hocuspocus = new Hocuspocus({
    extensions: [new SQLite({ database: sqlitePath })],
    async onConnect(_: onConnectPayload) {
      // console.log(`Client connecting to document: "${documentName}"`);
    },
  });
  console.log(`CRDT database initialized at: ${sqlitePath}`);
} catch (error) {
  console.error("Failed to initialize Hocuspocus CRDT server:", error);
  throw error;
}

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (websocket: WebSocket, request: IncomingMessage) => {
  hocuspocus.handleConnection(websocket, request);
});

server.on(
  "upgrade",
  (request: IncomingMessage, socket: Socket, head: Buffer) => {
    if (request.url?.startsWith("/crdt")) {
      wss.handleUpgrade(request, socket, head, (websocket) => {
        wss.emit("connection", websocket, request);
      });
    } else {
      socket.destroy();
    }
  }
);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${NODE_ENV})`);
  console.log(`AI Provider: ${process.env.AI_PROVIDER || 'bedrock (default)'}`);
  console.log(`Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`WS: ws://localhost:${PORT}/crdt`);
});

let isShuttingDown = false;
const shutdown = (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received. Shutting down...`);

  try {
    hocuspocus.closeConnections();
  } catch (e) {
    console.error("Error closing hocuspocus connections", e);
  }

  wss.close(() => {
    server.close(() => {
      console.log("HTTP and WebSocket servers closed.");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.warn("Force exit after timeout");
    process.exit(1);
  }, 5000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
