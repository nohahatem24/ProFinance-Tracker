<script setup lang="ts">
import { useCurrencyStore } from '../stores/currencyStore';

// 1. استخدام currencyStore
const currencyStore = useCurrencyStore();

// 2. تعريف الـ props كما هو
defineProps<{
  income: number;
  expenses: number;
  balance: number;
}>();

// 3. لا توجد دالة formatCurrency محلية هنا
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Total Income Card -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
        Total Income
      </h3>
      <p class="mt-2 text-3xl font-bold tracking-tight text-green-500 dark:text-green-400">
        <!-- استخدام الدالة المركزية -->
        {{ currencyStore.formatCurrency(income) }}
      </p>
    </div>
    <!-- Total Expenses Card -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
        Total Expenses
      </h3>
      <p class="mt-2 text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
        <!-- استخدام الدالة المركزية -->
        {{ currencyStore.formatCurrency(expenses) }}
      </p>
    </div>
    <!-- Balance Card -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">Balance</h3>
      <p
        class="mt-2 text-3xl font-bold"
        :class="
          balance >= 0
            ? 'text-gray-900 dark:text-white'
            : 'text-red-600 dark:text-red-400'
        "
      >
        <!-- استخدام الدالة المركزية -->
        {{ currencyStore.formatCurrency(balance) }}
      </p>
    </div>
  </div>
</template>
