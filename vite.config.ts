// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  includeAssets: ["squarelogo.png"],
  manifest: {
    name: "ProFinance Tracker",
    short_name: "ProFinance",
    description: "A personal finance tracking application",
    theme_color: "#1f2937",
    background_color: "#ffffff",
    display: "standalone",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "squarelogo-192x192.png", // <-- استخدام الاسم الصحيح
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "squarelogo-512x512.png", // <-- استخدام الاسم الصحيح
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "squarelogo-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  },
  workbox: {
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  },
};

export default defineConfig({
  plugins: [vue(), VitePWA(pwaOptions)],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
