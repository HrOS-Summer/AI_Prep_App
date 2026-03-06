import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// 1. Remove the import: import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  // 2. Simplify the plugins array
  plugins: [react()], 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));