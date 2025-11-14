// vite.config.ts

import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      // تأكدي من أن قسم manifest موجود هنا
      manifest: {
        name: "ProFinance Tracker",
        short_name: "ProFinance",
        description: "A personal finance tracking application",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: ".",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      // --- ✨ هذا هو القسم المهم الذي يحل المشكلة ✨ ---
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // زيادة الحد إلى 5 ميجابايت
      },
      // ---------------------------------------------
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
