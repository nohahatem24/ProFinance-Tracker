// src/main.ts

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css' // ملف Tailwind الرئيسي

// 1. استيراد الـ Store
import { useThemeStore } from './stores/themeStore'

const app = createApp(App)
const pinia = createPinia()

// 2. استخدام Pinia أولاً
app.use(pinia)

// 3. تفعيل themeStore بعد Pinia وقبل تحميل أي مكونات
// هذا يضمن أن الكلاس 'dark' يتم تطبيقه قبل عرض أي شيء
useThemeStore();

app.use(router)
app.mount('#app')
