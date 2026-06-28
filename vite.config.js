import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage"],
          tiptap: ["@tiptap/react", "@tiptap/starter-kit"],
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
