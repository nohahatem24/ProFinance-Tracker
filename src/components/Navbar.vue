<script setup lang="ts">
import { useThemeStore } from "../stores/themeStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { SunIcon, MoonIcon } from "@heroicons/vue/24/outline";
import CurrencySelector from "./CurrencySelector.vue";
import { watch } from "vue"; // **1. استيراد watch**

const themeStore = useThemeStore();
const currencyStore = useCurrencyStore();

defineProps<{
  user: { email: string } | null;
}>();

const emit = defineEmits(["logout"]);

// **2. مراقبة التغييرات في العملة المختارة**
// عندما تتغير قيمة currencyStore.selectedCurrency (من خلال v-model في CurrencySelector)،
// نقوم باستدعاء دالة setCurrency لتحديث الحالة وحفظها في localStorage.
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
    class="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300"
  >
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <!-- يمكنك وضع شعار هنا -->
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              ProFinance Tracker
            </h1>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div v-if="user" class="text-sm text-gray-500 dark:text-gray-300">
            Welcome, {{ user.email }}
          </div>

          <!-- 
            --- الإصلاح الرئيسي هنا ---
            لقد قمنا بربط v-model مباشرة بـ currencyStore.selectedCurrency.
            الآن، أي تغيير في هذا المكون سيقوم بتحديث الحالة المركزية في currencyStore،
            والـ watch الذي أضفناه في الأعلى سيقوم بالباقي.
          -->
          <div class="w-32 z-20">
            <CurrencySelector v-model="currencyStore.selectedCurrency" />
          </div>

          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <SunIcon v-if="themeStore.theme === 'dark'" class="h-6 w-6" />
            <MoonIcon v-else class="h-6 w-6" />
          </button>
          <button
            v-if="user"
            @click="emit('logout')"
            class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>
