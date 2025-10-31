<script setup lang="ts">
import { useThemeStore } from "../stores/themeStore";
import CurrencySelector from "./CurrencySelector.vue"; // 1. استيراد المكون الجديد

defineProps<{
  user: { email: string } | null;
}>();

const emit = defineEmits(["logout"]);
const themeStore = useThemeStore();
</script>

<template>
  <nav
    class="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-200"
            >ProFinance Tracker</span
          >
        </div>
        <div class="flex items-center gap-4">
          <span v-if="user" class="text-md font-semibold text-gray-600 dark:text-gray-300">
            Welcome, {{ user.email }}
          </span>

          <!-- 2. استخدام المكون الجديد هنا -->
          <CurrencySelector />

          <!-- زر تبديل المظهر -->
          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            <svg
              v-if="themeStore.theme === 'light'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </button>

          <button
            @click="emit('logout')"
            class="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
