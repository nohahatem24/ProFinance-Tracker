<script setup lang="ts">
import { useThemeStore } from "../stores/themeStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { SunIcon, MoonIcon } from "@heroicons/vue/24/outline";
import CurrencySelector from "./CurrencySelector.vue";
import { watch } from "vue";

const themeStore = useThemeStore();
const currencyStore = useCurrencyStore();

defineProps<{
  user: { email: string } | null;
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
    class="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300 sticky top-0 z-50"
  >
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <!-- الجزء الأيسر: اسم التطبيق (نص متجاوب) -->
        <div class="flex-shrink-0">
          <h1
            class="text-2xl font-bold text-indigo-700 dark:text-indigo-200 leading-tight"
          >
            <span class="block sm:inline">ProFinance</span>
            <span class="block sm:inline sm:ml-1">Tracker</span>
          </h1>
        </div>

        <!-- الجزء الأيمن: عناصر التحكم -->
        <div class="flex items-center gap-2 sm:gap-4">
          <div class="w-40 sm:w-80">
            <CurrencySelector v-model="currencyStore.selectedCurrency" />
          </div>

          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            <SunIcon v-if="themeStore.theme === 'dark'" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
          </button>

          <button
            v-if="user"
            @click="emit('logout')"
            class="p-2 text-lg font-semibold text-red-600 dark:text-red-400 hover:underline"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- رسالة الترحيب في سطر منفصل -->
      <div
        v-if="user"
        class="pb-2 px-1 text-md font-semibold text-gray-500 dark:text-gray-400"
      >
        Welcome, {{ user.email }}
      </div>
    </div>
  </header>
</template>

<style scoped>
/* No custom CSS needed */
</style>
