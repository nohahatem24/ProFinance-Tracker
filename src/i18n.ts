// src/i18n.ts
import { createI18n, type I18n } from 'vue-i18n';
import { getLanguageMessages } from './services/translationService';

import enMessages from './locales/en.json';

const i18n: I18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: enMessages,
  },
});

export async function loadLanguageAsync(lang: string): Promise<void> {
  const i18nInstance = i18n.global;

  if (i18nInstance.locale.value === lang) {
    return;
  }

  // --- **الإصلاح هنا: استخدام .value للوصول إلى المصفوفة** ---
  if (i18nInstance.availableLocales.value.includes(lang)) {
    i18nInstance.locale.value = lang;
  } else {
    try {
      const messages = await getLanguageMessages(lang);
      i18nInstance.setLocaleMessage(lang, messages);
      i18nInstance.locale.value = lang;
    } catch (error) {
      console.error(`Failed to load language '${lang}'. Falling back to English.`, error);
      i18nInstance.locale.value = 'en';
    }
  }
  
  const rtlLanguages = ['ar', 'fa', 'ur', 'ps', 'yi'];
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', rtlLanguages.includes(lang) ? 'rtl' : 'ltr');
}

export default i18n;
