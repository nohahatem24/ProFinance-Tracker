// src/services/translationService.ts

import enMessages from "../locales/en.json";
import arMessages from "../locales/ar.json";

// اللغات التي لديك ملفات كاملة لها
const manualTranslations: Record<string, any> = {
  en: enMessages,
  ar: arMessages,
};

// ذاكرة مؤقتة لتخزين اللغات المترجمة آلياً
const cache: Record<string, any> = {};

/**
 * دالة مساعدة لتحويل كائن متداخل إلى كائن مسطح
 * {"a": {"b": "c"}}  =>  {"a.b": "c"}
 */
function flattenObject(obj: any, parentKey = ""): Record<string, string> {
  let result: Record<string, string> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const propName = parentKey ? `${parentKey}.${key}` : key;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        result = { ...result, ...flattenObject(obj[key], propName) };
      } else {
        result[propName] = obj[key];
      }
    }
  }
  return result;
}

/**
 * دالة مساعدة لإعادة بناء الكائن المسطح إلى كائن متداخل
 * {"a.b": "c"}  =>  {"a": {"b": "c"}}
 */
function unflattenObject(data: Record<string, string>): any {
  const result: any = {};
  for (const key in data) {
    const keys = key.split(".");
    keys.reduce((acc, currentKey, index) => {
      return (
        acc[currentKey] ||
        (acc[currentKey] = keys.length - 1 === index ? data[key] : {})
      );
    }, result);
  }
  return result;
}

/**
 * يترجم نصًا واحدًا باستخدام Google Translate API غير الرسمي.
 */
async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  // لا تترجم إلى الإنجليزية أو إذا كان النص فارغًا
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
    // استخراج النص المترجم من الاستجابة المعقدة
    const translatedText = data[0].map((item: any) => item[0]).join("");
    return translatedText || text; // أرجع النص الأصلي إذا كانت الترجمة فارغة
  } catch (error) {
    console.error(
      `Translation failed for text: "${text}" to lang: "${targetLang}"`,
      error
    );
    return text; // أرجع النص الأصلي في حالة حدوث خطأ
  }
}

/**
 * يحصل على رسائل الترجمة للغة معينة، إما من الملفات اليدوية أو عبر الترجمة الآلية.
 */
export async function getLanguageMessages(
  lang: string
): Promise<Record<string, any>> {
  // 1. تحقق من وجود ترجمة يدوية
  if (manualTranslations[lang]) {
    return manualTranslations[lang];
  }

  // 2. تحقق من وجود ترجمة في الذاكرة المؤقتة
  if (cache[lang]) {
    return cache[lang];
  }

  console.log(`Automated translation for '${lang}'...`);

  // 3. تسطيح ملف اللغة الإنجليزية كقالب
  const sourceMessagesFlat = flattenObject(manualTranslations.en);
  const translatedMessagesFlat: Record<string, string> = {};

  // 4. إنشاء مصفوفة من وعود الترجمة لكل قيمة
  const translationPromises = Object.entries(sourceMessagesFlat).map(
    async ([key, value]) => {
      const translatedValue = await translateText(value, lang);
      translatedMessagesFlat[key] = translatedValue;
    }
  );

  // 5. انتظار اكتمال جميع الترجمات
  await Promise.all(translationPromises);

  // 6. إعادة بناء الكائن المترجم إلى هيكله المتداخل الأصلي
  const newMessagesNested = unflattenObject(translatedMessagesFlat);

  // 7. تخزين النتيجة في الذاكرة المؤقتة وإرجاعها
  cache[lang] = newMessagesNested;
  console.log(`Translation for '${lang}' cached.`);

  return newMessagesNested;
}
