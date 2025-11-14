// src/i18n.ts
import { createI18n, type I18nOptions } from "vue-i18n";
import enMessages from "./locales/en.json";
import arMessages from "./locales/ar.json";

const options: I18nOptions = {
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en: enMessages,
    ar: arMessages,
  },
};

const i18n = createI18n(options);

export async function loadLanguageAsync(lang: string): Promise<void> {
  const i18nInstance = i18n.global;

  if (i18nInstance.locale.value === lang) {
    return;
  }

  const available = Array.isArray(i18nInstance.availableLocales)
    ? i18nInstance.availableLocales
    : i18nInstance.availableLocales.value;

  if (!available.includes(lang)) {
    try {
      // --- ✨ التعديل الحاسم والنهائي هنا ✨ ---
      // هذا النمط يخبر Vite بالبحث عن كل ملفات .json داخل مجلد locales
      const messages = await import(`../locales/${lang}.json`);
      // -----------------------------------------

      (i18nInstance.setLocaleMessage as any)(lang, messages.default);
    } catch (error) {
      console.error(
        `Failed to load language '${lang}'. Falling back to English.`,
        error
      );
      (i18nInstance.locale as any).value = "en";
      return;
    }
  }

  if (
    typeof i18nInstance.locale === "object" &&
    "value" in i18nInstance.locale
  ) {
    i18nInstance.locale.value = lang;
  } else {
    (i18nInstance.locale as any) = lang;
  }

  const rtlLanguages = ["ar", "fa", "ur", "ps", "yi", "sd", "he", "dv"];
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute(
    "dir",
    rtlLanguages.includes(lang) ? "rtl" : "ltr"
  );
}

export default i18n;
