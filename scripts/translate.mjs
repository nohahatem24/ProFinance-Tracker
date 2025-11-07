// scripts/translate.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- الإعدادات ---
const SOURCE_LANG = 'en';
const TARGET_LANGS = [
  'ar', 'fr', 'de', 'it', 'es', 'pl', 'nl', 'ko', 'tr', 'zh', 'hi',
  'bn', 'pt', 'ru', 'ja', 'jv', 'vi', 'th', 'id', 'sv', 'uk', 'ro',
  'el', 'cs', 'hu', 'fi', 'da', 'no', 'nn', 'ms', 'sr', 'hr', 'sk',
  'bg', 'lt', 'sl', 'et', 'lv', 'is', 'mt', 'ga', 'cy', 'eu', 'gl',
  'af', 'sw', 'zu', 'xh', 'st', 'tn', 'sn', 'yo', 'ig', 'lb', 'fo',
  'sq', 'hy', 'az', 'ka', 'mk', 'mn', 'ne', 'si', 'ta', 'te', 'kn',
  'ml', 'pa', 'gu', 'or', 'as', 'mr', 'fa', 'he', 'ur', 'ku', 'ps',
  'sd', 'ug', 'yi', 'dv'
];
const LOCALES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/locales');
const SOURCE_FILE = path.join(LOCALES_DIR, `${SOURCE_LANG}.json`);

// --- دالة الترجمة (نفس دالتك ولكن مع تعديل بسيط) ---
async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string') return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${SOURCE_LANG}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text )}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    const data = await response.json();
    return data[0].map(item => item[0]).join('');
  } catch (error) {
    console.error(`  ❌ Failed to translate "${text}" to ${targetLang}:`, error.message);
    return text; // إرجاع النص الأصلي عند الفشل
  }
}

// --- الدالة الرئيسية ---
async function run() {
  console.log('🚀 Starting pre-build translation script...');
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Source language file not found: ${SOURCE_FILE}`);
    return;
  }

  const sourceMessages = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));

  for (const lang of TARGET_LANGS) {
    // تخطي اللغات الموجودة يدوياً (الإنجليزية والعربية)
    if (lang === SOURCE_LANG || lang === 'ar') {
      console.log(`- Skipping manual language: ${lang}`);
      continue;
    }

    console.log(`- Translating to ${lang}...`);
    const targetPath = path.join(LOCALES_DIR, `${lang}.json`);
    const newMessages = {};

    // استخدام Promise.all لترجمة كل المفاتيح بالتوازي
    await Promise.all(
      Object.entries(sourceMessages).map(async ([key, value]) => {
        if (typeof value === 'string') {
          newMessages[key] = await translateText(value, lang);
        } else if (typeof value === 'object' && value !== null) {
          // التعامل مع الكائنات المتداخلة (nested objects)
          newMessages[key] = {};
          await Promise.all(
            Object.entries(value).map(async ([subKey, subValue]) => {
              newMessages[key][subKey] = {};
               await Promise.all(
                 Object.entries(subValue).map(async ([nestedKey, nestedValue]) => {
                    newMessages[key][subKey][nestedKey] = await translateText(nestedValue, lang);
                 })
               )
            })
          );
        }
      })
    );

    fs.writeFileSync(targetPath, JSON.stringify(newMessages, null, 2));
    console.log(`  ✅ Saved ${lang}.json`);
  }

  console.log('🎉 Translation script finished successfully!');
}

run();
