import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  define: {
    global: "window",
  },
  server: {
    allowedHosts: ["4220f2ecc37a.ngrok-free.app", "localhost"],
    proxy: {
      "/api": {
        target: "https://chat-h80l.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/chat": {
        target: "https://chat-h80l.onrender.com",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
