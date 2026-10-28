import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "zekit-ts": new URL(
        "../../packages/zekit-ts/src/ts/index.ts",
        import.meta.url
      ).pathname,
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  optimizeDeps: {
    exclude: ["zekit-ts"],
  },
});
