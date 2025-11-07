import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa"; // 1. استيراد الأداة

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 2. إضافة إعدادات الـ PWA
    VitePWA({
      registerType: "autoUpdate", // يقوم بتحديث التطبيق تلقائياً عند وجود نسخة جديدة
      injectRegister: "auto",
      workbox: {
        // 3. تحديد الملفات التي يجب تخزينها للعمل offline
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}"],
      },
      // 4. استخدام نفس إعدادات ملف manifest.json
      manifest: {
        name: "ProFinance Tracker",
        short_name: "ProFinance",
        description: "Take control of your finances. Track, analyze, and grow.",
        theme_color: "#4f46e5", // لون شريط الحالة
        background_color: "#ffffff", // لون شاشة التحميل
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "squarelogo-192x192.png", // سنقوم بإنشاء هذه الصور
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "squarelogo-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "squarelogo-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable", // مهم جداً لتحسين شكل الأيقونة على Android
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // ... (إذا كان لديك أي aliases، تبقى كما هي)
    },
  },
});
