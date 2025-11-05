<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { loadLanguageAsync } from "../i18n";

const { locale } = useI18n();

// القائمة النهائية والمنقحة للغات المدعومة
const supportedLanguages = [
  // LTR Language
  { code: "en", name: "English" },
  //RTL Language
  { code: "ar", name: "العربية" }, // Arabic

  // LTR Languages
  { code: "fr", name: "Français" }, // French
  { code: "de", name: "Deutsch" }, // German
  { code: "it", name: "Italiano" }, // Italian
  { code: "es", name: "Español" }, // Spanish
  { code: "pl", name: "Polski" }, // Polish
  { code: "nl", name: "Nederlands" }, // Dutch
  { code: "ko", name: "한국어" }, // Korean
  { code: "tr", name: "Türkçe" }, // Turkish
  { code: "zh", name: "中文" }, // Chinese
  { code: "hi", name: "हिन्दी" }, // Hindi

  { code: "bn", name: "বাংলা" }, // Bengali
  { code: "pt", name: "Português" }, // Portuguese
  { code: "ru", name: "Русский" }, // Russian
  { code: "ja", name: "日本語" }, // Japanese

  { code: "jv", name: "Basa Jawa" }, // Javanese

  { code: "vi", name: "Tiếng Việt" }, // Vietnamese
  { code: "th", name: "ไทย" }, // Thai

  { code: "id", name: "Bahasa Indonesia" }, // Indonesian
  { code: "sv", name: "Svenska" }, // Swedish
  { code: "uk", name: "Українська" }, // Ukrainian
  { code: "ro", name: "Română" }, // Romanian
  { code: "el", name: "Ελληνικά" }, // Greek
  { code: "cs", name: "Čeština" }, // Czech
  { code: "hu", name: "Magyar" }, // Hungarian
  { code: "fi", name: "Suomi" }, // Finnish
  { code: "da", name: "Dansk" }, // Danish
  { code: "no", name: "Norsk" }, // Norwegian (Bokmål)
  { code: "nn", name: "Nynorsk" }, // Norwegian Nynorsk
  { code: "ms", name: "Bahasa Melayu" }, // Malay
  { code: "sr", name: "Српски" }, // Serbian
  { code: "hr", name: "Hrvatski" }, // Croatian
  { code: "sk", name: "Slovenčina" }, // Slovak
  { code: "bg", name: "Български" }, // Bulgarian
  { code: "lt", name: "Lietuvių" }, // Lithuanian
  { code: "sl", name: "Slovenščina" }, // Slovenian
  { code: "et", name: "Eesti" }, // Estonian
  { code: "lv", name: "Latviešu" }, // Latvian
  { code: "is", name: "Íslenska" }, // Icelandic
  { code: "mt", name: "Malti" }, // Maltese
  { code: "ga", name: "Gaeilge" }, // Irish
  { code: "cy", name: "Cymraeg" }, // Welsh
  { code: "eu", name: "Euskara" }, // Basque
  { code: "gl", name: "Galego" }, // Galician
  { code: "af", name: "Afrikaans" }, // Afrikaans
  { code: "sw", name: "Kiswahili" }, // Swahili
  { code: "zu", name: "isiZulu" }, // Zulu
  { code: "xh", name: "isiXhosa" }, // Xhosa
  { code: "st", name: "Sesotho" }, // Sotho
  { code: "tn", name: "Setswana" }, // Tswana
  { code: "sn", name: "ChiShona" }, // Shona
  { code: "yo", name: "Yorùbá" }, // Yoruba
  { code: "ig", name: "Igbo" }, // Igbo
  { code: "lb", name: "Lëtzebuergesch" }, // Luxembourgish
  { code: "fo", name: "Føroyskt" }, // Faroese
  { code: "sq", name: "Shqip" }, // Albanian
  { code: "hy", name: "Հայերեն" }, // Armenian
  { code: "az", name: "Azərbaycanca" }, // Azerbaijani
  { code: "ka", name: "ქართული" }, // Georgian
  { code: "mk", name: "Македонски" }, // Macedonian
  { code: "mn", name: "Монгол" }, // Mongolian
  { code: "ne", name: "नेपाली" }, // Nepali
  { code: "si", name: "සිංහල" }, // Sinhala
  { code: "ta", name: "தமிழ்" }, // Tamil
  { code: "te", name: "తెలుగు" }, // Telugu
  { code: "kn", name: "ಕನ್ನಡ" }, // Kannada
  { code: "ml", name: "മലയാളം" }, // Malayalam
  { code: "pa", name: "ਪੰਜਾਬੀ" }, // Punjabi
  { code_name: "gu", name: "ગુજરાતી" }, // Gujarati
  { code: "or", name: "ଓଡ଼ିଆ" }, // Odia
  { code: "as", name: "অসমীয়া" }, // Assamese
  { code: "mr", name: "मराठी" }, // Marathi

  // RTL Languages

  { code: "fa", name: "فارسی" }, // Persian
  { code: "he", name: "עברית" }, // Hebrew
  { code: "ur", name: "اردو" }, // Urdu
  { code: "ku", name: "Kurdî" }, // Kurdish
  { code: "ps", name: "پښتو" }, // Pashto
  { code: "sd", name: "سنڌي" }, // Sindhi
  { code: "ug", name: "ئۇيغۇرچە" }, // Uyghur
  { code: "yi", name: "ייִדיש" }, // Yiddish
  { code: "dv", name: "ދިވެހި" }, // Divehi
];

const changeLanguage = async (event: Event) => {
  const newLocale = (event.target as HTMLSelectElement).value;
  await loadLanguageAsync(newLocale);
};
</script>

<template>
  <div class="relative">
    <select
      @change="changeLanguage"
      :value="locale"
      class="appearance-none bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-1.5 px-8 rounded-md text-sm cursor-pointer"
      aria-label="Select language"
    >
      <option
        v-for="lang in supportedLanguages"
        :key="lang.code"
        :value="lang.code"
      >
        {{ lang.name }}
      </option>
    </select>
  </div>
</template>
