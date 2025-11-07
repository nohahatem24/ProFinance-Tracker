// scripts/translate.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
  "nn",
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
  "fo",
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

async function translateText(text, targetLang) {
  if (!text || typeof text !== "string") return text;
  // ✨ تعديل: إضافة User-Agent لتجنب الحظر
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${SOURCE_LANG}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
  };

  const response = await fetch(url, { headers });
  if (!response.ok) {
    // ✨ تعديل: إلقاء خطأ صريح
    throw new Error(
      `API request failed with status ${response.status} for lang ${targetLang}`
    );
  }
  const data = await response.json();
  if (!data || !data[0]) {
    throw new Error(`Invalid API response for lang ${targetLang}`);
  }
  return data[0].map((item) => item[0]).join("");
}

async function run() {
  console.log("🚀 Starting pre-build translation script...");
  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Source language file not found: ${SOURCE_FILE}`);
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
      await Promise.all(
        Object.entries(sourceMessages).map(async ([key, value]) => {
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
        })
      );
      fs.writeFileSync(targetPath, JSON.stringify(newMessages, null, 2));
      console.log(`  ✅ Saved ${lang}.json`);
    } catch (error) {
      // ✨ تعديل: إيقاف العملية بالكامل عند حدوث خطأ
      console.error(
        `\n❌ CRITICAL ERROR while translating to ${lang}. Halting script.`
      );
      console.error(error);
      process.exit(1); // هذا هو السطر الأهم، يوقف كل شيء
    }
  }
  console.log("🎉 Translation script finished successfully!");
}

run();
