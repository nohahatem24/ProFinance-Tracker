// src/stores/themeStore.ts

import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', () => {
  // 1. جلب القيمة المحفوظة من localStorage أو استخدام 'dark' كقيمة افتراضية
  const theme = ref(localStorage.getItem('theme') || 'dark');

  // 2. دالة لتطبيق الكلاس على عنصر <html>
  const applyTheme = (newTheme: string) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // 3. حفظ الاختيار الجديد في localStorage
    localStorage.setItem('theme', newTheme);
  };

  // 4. دالة لتبديل المظهر
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  };

  // 5. مراقبة التغييرات على `theme` وتطبيقها تلقائيًا
  // immediate: true تضمن تشغيل الكود فورًا عند بدء التطبيق
  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  }, { immediate: true });

  return { theme, toggleTheme };
});
