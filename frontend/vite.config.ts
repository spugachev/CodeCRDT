import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/crdt": {
        target: "ws://localhost:3001",
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _, res) => {
            console.error("[WebSocket Proxy Error]", err);

            res.end("WebSocket Proxy Error");
          });
        },
      },
    },
  },
});
