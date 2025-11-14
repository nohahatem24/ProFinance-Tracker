// scripts/translate.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- الإعدادات ---
const SOURCE_LANG = "en";
const TARGET_LANGS = [
  "ar",
  "fr",
  "de",
  "it",
  "es",
  "pl",
  "nl",
  "ko",
  "tr",
  "zh",
  "hi",
  "bn",
  "pt",
  "ru",
  "ja",
  "jv",
  "vi",
  "th",
  "id",
  "sv",
  "uk",
  "ro",
  "el",
  "cs",
  "hu",
  "fi",
  "da",
  "no",
  "ms",
  "sr",
  "hr",
  "sk",
  "bg",
  "lt",
  "sl",
  "et",
  "lv",
  "is",
  "mt",
  "ga",
  "cy",
  "eu",
  "gl",
  "af",
  "sw",
  "zu",
  "xh",
  "st",
  "tn",
  "sn",
  "yo",
  "ig",
  "lb",
  "sq",
  "hy",
  "az",
  "ka",
  "mk",
  "mn",
  "ne",
  "si",
  "ta",
  "te",
  "kn",
  "ml",
  "pa",
  "gu",
  "or",
  "as",
  "mr",
  "fa",
  "he",
  "ur",
  "ku",
  "ps",
  "sd",
  "ug",
  "yi",
  "dv",
];
const LOCALES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/locales"
);
const SOURCE_FILE = path.join(LOCALES_DIR, `${SOURCE_LANG}.json`);
const RETRY_COUNT = 3; // عدد محاولات الإعادة
const RETRY_DELAY = 1000; // التأخير بين المحاولات بالمللي ثانية

// --- دالة التأخير ---
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- دالة الترجمة مع إعادة المحاولة ---
async function translateText(text, targetLang) {
  if (!text || typeof text !== "string") return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${SOURCE_LANG}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
  };

  for (let i = 0; i < RETRY_COUNT; i++) {
    try {
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = await response.json();
        if (!data || !data[0])
          throw new Error(`Invalid API response for lang ${targetLang}`);
        return data[0].map((item) => item[0]).join("");
      }
      // إذا كان الخطأ يمكن إعادة المحاولة فيه (مثل خطأ سيرفر أو ضغط)
      if (response.status === 429 || response.status >= 500) {
        console.warn(
          `  ⚠️ Retrying for ${targetLang} (attempt ${i + 1}/${RETRY_COUNT}) due to status ${response.status}`
        );
        await delay(RETRY_DELAY * (i + 1)); // زيادة التأخير مع كل محاولة
        continue;
      }
      // إذا كان الخطأ لا يمكن إصلاحه (مثل 400 Bad Request)، لا تعيد المحاولة
      throw new Error(
        `API request failed with status ${response.status} for lang ${targetLang}`
      );
    } catch (error) {
      if (i === RETRY_COUNT - 1) {
        // إذا كانت هذه آخر محاولة
        throw error; // إلقاء الخطأ النهائي
      }
    }
  }
  // لن يصل الكود إلى هنا إلا إذا فشلت كل المحاولات
  throw new Error(`All retries failed for lang ${targetLang}`);
}

// --- الدالة الرئيسية ---
async function run() {
  console.log("🚀 Starting pre-build translation script...");
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Source language file not found: ${SOURCE_FILE}`);
    process.exit(1);
  }

  const sourceMessages = JSON.parse(fs.readFileSync(SOURCE_FILE, "utf-8"));

  for (const lang of TARGET_LANGS) {
    if (
      lang === SOURCE_LANG ||
      fs.existsSync(path.join(LOCALES_DIR, `${lang}.json`))
    ) {
      console.log(`- Skipping existing language: ${lang}`);
      continue;
    }

    console.log(`- Translating to ${lang}...`);
    const targetPath = path.join(LOCALES_DIR, `${lang}.json`);
    const newMessages = {};

    try {
      const translationPromises = Object.entries(sourceMessages).map(
        async ([key, value]) => {
          if (typeof value === "string") {
            newMessages[key] = await translateText(value, lang);
          } else if (typeof value === "object" && value !== null) {
            newMessages[key] = {};
            await Promise.all(
              Object.entries(value).map(async ([subKey, subValue]) => {
                newMessages[key][subKey] = {};
                await Promise.all(
                  Object.entries(subValue).map(
                    async ([nestedKey, nestedValue]) => {
                      newMessages[key][subKey][nestedKey] = await translateText(
                        nestedValue,
                        lang
                      );
                    }
                  )
                );
              })
            );
          }
        }
      );
      await Promise.all(translationPromises);
      fs.writeFileSync(targetPath, JSON.stringify(newMessages, null, 2));
      console.log(`  ✅ Saved ${lang}.json`);
    } catch (error) {
      // ✨ تعديل: تسجيل الخطأ وتخطي اللغة بدلاً من إيقاف كل شيء ✨
      console.error(
        `\n❌ FAILED to translate to ${lang} after all retries. Skipping this language.`
      );
      console.error(`  Reason: ${error.message}`);
      // لا نستخدم process.exit(1) هنا للسماح للبناء بالاستمرار
    }
  }
  console.log("🎉 Translation script finished. Continuing with build...");
}

run();
