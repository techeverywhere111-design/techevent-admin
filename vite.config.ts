import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@styles": path.resolve(__dirname, "./src/styles"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (!normalizedId.includes("node_modules")) return;

          if (normalizedId.includes("node_modules/@tanstack/")) {
            return "vendor-query";
          }

          if (normalizedId.includes("node_modules/lucide-react/")) {
            return "vendor-icons";
          }

          if (
            normalizedId.includes("node_modules/react/") ||
            normalizedId.includes("node_modules/react-dom/") ||
            normalizedId.includes("node_modules/react-router/") ||
            normalizedId.includes("node_modules/react-router-dom/") ||
            normalizedId.includes("node_modules/react-is/") ||
            normalizedId.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          if (
            normalizedId.includes("node_modules/recharts/") ||
            normalizedId.includes("node_modules/d3-") ||
            normalizedId.includes("node_modules/victory-vendor/")
          ) {
            return "vendor-charts";
          }

          if (
            normalizedId.includes("node_modules/xlsx/") ||
            normalizedId.includes("node_modules/file-saver/")
          ) {
            return "vendor-export";
          }

          if (
            normalizedId.includes("node_modules/axios/") ||
            normalizedId.includes("node_modules/js-cookie/") ||
            normalizedId.includes("node_modules/zod/") ||
            normalizedId.includes("node_modules/zustand/") ||
            normalizedId.includes("node_modules/immer/")
          ) {
            return "vendor-data";
          }

          return "vendor-misc";
        },
      },
    },
  },
});
