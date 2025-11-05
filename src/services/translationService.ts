// src/services/translationService.ts
import enMessages from "../locales/en.json";
import arMessages from "../locales/ar.json";

const manualTranslations: Record<string, any> = {
  en: enMessages,
  ar: arMessages,
};

const cache: Record<string, any> = {};

async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  if (targetLang === "en" || !text) {
    return text;
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Translation API request failed");
    }
    const data = await response.json();
    const translatedText = data[0].map((item: any) => item[0]).join("");
    return translatedText || text;
  } catch (error) {
    console.error(
      `Translation failed for text: "${text}" to lang: "${targetLang}"`,
      error
    );
    return text;
  }
}

export async function getLanguageMessages(
  lang: string
): Promise<Record<string, string>> {
  if (manualTranslations[lang]) {
    return manualTranslations[lang];
  }

  if (cache[lang]) {
    return cache[lang];
  }

  console.log(`Automated translation for '${lang}'...`);
  const newMessages: Record<string, string> = {};
  const sourceMessages = manualTranslations.en;

  const translationPromises = Object.entries(sourceMessages).map(
    async ([key, value]) => {
      // --- **الإصلاح هنا: تأكيد أن value هو string** ---
      const translatedValue = await translateText(value as string, lang);
      newMessages[key] = translatedValue;
    }
  );

  await Promise.all(translationPromises);

  cache[lang] = newMessages;
  console.log(`Translation for '${lang}' cached.`);

  return newMessages;
}
