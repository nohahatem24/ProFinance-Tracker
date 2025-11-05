// src/main.ts

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n"; // <-- **جديد: استيراد إعدادات الترجمة**
import "./style.css"; // ملف Tailwind الرئيسي

// استيراد الـ Store
import { useThemeStore } from "./stores/themeStore";

const app = createApp(App);
const pinia = createPinia();

// استخدام Pinia أولاً
app.use(pinia);

// تفعيل themeStore بعد Pinia وقبل تحميل أي مكونات
// هذا يضمن أن الكلاس 'dark' يتم تطبيقه قبل عرض أي شيء
useThemeStore();

// استخدام الراوتر
app.use(router);

// **جديد: استخدام مكتبة الترجمة i18n**
// يجب أن يتم هذا قبل تحميل التطبيق (app.mount)
app.use(i18n);

// تحميل التطبيق
app.mount("#app");
