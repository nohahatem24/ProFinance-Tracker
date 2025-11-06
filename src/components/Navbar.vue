<script setup lang="ts">
import { useThemeStore } from "../stores/themeStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { SunIcon, MoonIcon } from "@heroicons/vue/24/outline";
import CurrencySelector from "./CurrencySelector.vue";
import { watch, computed } from "vue"; // ✨ استيراد computed
import type { User } from "@supabase/supabase-js";
import { useI18n } from "vue-i18n";
import { loadLanguageAsync } from "../i18n";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";

// --- ✨ 1. استيراد الصور ---
import lightLogo from "../assets/Plightmodelogo.png";
import darkLogo from "../assets/Pnightmodelogo.png";

const { t, locale } = useI18n(); // ✨ استيراد locale
const themeStore = useThemeStore();
const currencyStore = useCurrencyStore();

defineProps<{
  user: User | null;
}>();

const emit = defineEmits(["logout"]);

// --- ✨ 2. تحديد اتجاه اللغة (RTL/LTR) ---
const rtlLocales = ["ar", "he", "fa", "ur"];
const isRtl = computed(() => rtlLocales.includes(locale.value));

watch(
  () => currencyStore.selectedCurrency,
  (newCurrency) => {
    if (newCurrency) {
      currencyStore.setCurrency(newCurrency);
    }
  }
);
</script>

<template>
  <!-- ✨ 3. إضافة dir للتحكم في اتجاه الهيدر بالكامل -->
  <header
    class="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300 sticky top-0 z-50"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <!-- ✨ 4. استبدال النص باللوجو الديناميكي -->
        <div class="flex-shrink-0 flex items-center">
          <img
            :src="themeStore.theme === 'dark' ? darkLogo : lightLogo"
            alt="ProFinance Tracker Logo"
            class="h-auto w-32 mr-2 rtl:ml-2 rtl:mr-0"
          />
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher />

          <div class="w-40 sm:w-80">
            <CurrencySelector v-model="currencyStore.selectedCurrency" />
          </div>

          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            :aria-label="t('toggle_theme')"
          >
            <SunIcon v-if="themeStore.theme === 'dark'" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
          </button>

          <button
            v-if="user"
            @click="emit('logout')"
            class="p-2 text-lg font-semibold text-red-600 dark:text-red-400 hover:underline"
            :aria-label="t('logout')"
          >
            {{ t("logout") }}
          </button>
        </div>
      </div>

      <div
        v-if="user"
        class="pb-2 px-1 text-md font-semibold text-gray-500 dark:text-gray-400"
      >
        {{ t("welcome") }}, {{ user.email }}
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ✨ 5. إضافة تنسيقات خاصة بـ RTL */
[dir="rtl"] .pb-2 {
  text-align: right;
}
</style>
