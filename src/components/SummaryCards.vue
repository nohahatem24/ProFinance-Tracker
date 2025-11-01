<script setup lang="ts">
import { useCurrencyStore } from '../stores/currencyStore';
import { useTransactionStore } from '../stores/transactionStore';

const currencyStore = useCurrencyStore();
const transactionStore = useTransactionStore();

defineProps<{
  income: number;
  expenses: number;
  balance: number;
}>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Total Income Card -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
        Total Income
      </h3>
      <div class="mt-2">
        <span class="text-3xl font-bold tracking-tight text-green-500 dark:text-green-400">
          {{ currencyStore.formatCurrency(income) }}
        </span>
        <!-- جديد: عرض المبلغ المحول إذا كان موجودًا -->
        <span v-if="transactionStore.targetCurrency" class="ml-2 text-lg font-medium text-gray-500 dark:text-gray-400">
          (~{{ currencyStore.formatCurrency(transactionStore.convertAmount(income), transactionStore.targetCurrency) }})
        </span>
      </div>
    </div>
    <!-- Total Expenses Card -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
        Total Expenses
      </h3>
      <div class="mt-2">
        <span class="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
          {{ currencyStore.formatCurrency(expenses) }}
        </span>
        <span v-if="transactionStore.targetCurrency" class="ml-2 text-lg font-medium text-gray-500 dark:text-gray-400">
          (~{{ currencyStore.formatCurrency(transactionStore.convertAmount(expenses), transactionStore.targetCurrency) }})
        </span>
      </div>
    </div>
    <!-- Final Balance Card -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">Final Balance</h3>
      <div class="mt-2">
        <span class="text-3xl font-bold" :class="balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'">
          {{ currencyStore.formatCurrency(balance) }}
        </span>
        <span v-if="transactionStore.targetCurrency" class="ml-2 text-lg font-medium text-gray-500 dark:text-gray-400">
          (~{{ currencyStore.formatCurrency(transactionStore.convertAmount(balance), transactionStore.targetCurrency) }})
        </span>
      </div>
    </div>
  </div>
</template>
