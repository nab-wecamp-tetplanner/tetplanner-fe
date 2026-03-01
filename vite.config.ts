import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["lucide-react", "framer-motion"],
          "vendor-charts": ["recharts"],
          "vendor-gantt": ["gantt-task-react"],
          "vendor-utils": ["date-fns", "axios", "zustand"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
