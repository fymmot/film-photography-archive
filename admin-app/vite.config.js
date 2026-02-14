import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/admin/",
  root: ".",
  build: {
    outDir: "../public/admin",
    emptyOutDir: false,
    rollupOptions: {
      input: "index.html",
    },
  },
});
