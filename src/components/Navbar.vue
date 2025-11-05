<script setup lang="ts">
import { useThemeStore } from "../stores/themeStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { SunIcon, MoonIcon } from "@heroicons/vue/24/outline";
import CurrencySelector from "./CurrencySelector.vue";
import { watch } from "vue";
import type { User } from "@supabase/supabase-js";

// --- **جديد: استيراد أدوات الترجمة** ---
import { useI18n } from "vue-i18n";
import { loadLanguageAsync } from "../i18n"; // دالة تحميل اللغات الديناميكية
import LanguageSwitcher from "../components/LanguageSwitcher.vue"; // استيراد المكون الجديد

const { t } = useI18n(); // دالة الترجمة `t`

const themeStore = useThemeStore();
const currencyStore = useCurrencyStore();

defineProps<{
  user: User | null;
}>();

const emit = defineEmits(["logout"]);

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
  <header
    class="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300 sticky top-0 z-50 "
  >
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <!-- **تعديل: استخدام مفتاح الترجمة لاسم التطبيق** -->
        <div class="flex-shrink-50 flex items-center">
          <h1
            class="text-2xl font-bold text-indigo-700 dark:text-indigo-200 leading-tight"
          >
            {{ t("app_name") }}
          </h1>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <!-- **جديد: إضافة مكون تبديل اللغة** -->
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

          <!-- **تعديل: استخدام مفتاح الترجمة لزر الخروج** -->
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

      <!-- **تعديل: استخدام مفتاح الترجمة لرسالة الترحيب** -->
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
/* No custom CSS needed */
</style>
