<script setup lang="ts">
import { useCurrencyStore } from "../stores/currencyStore";
import { useTransactionStore } from "../stores/transactionStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const currencyStore = useCurrencyStore();
const transactionStore = useTransactionStore();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Total Income Card -->
    <div
      class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300"
    >
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
        {{ t("total_income") }}
      </h3>
      <div class="mt-2">
        <span
          class="text-3xl font-bold tracking-tight text-green-500 dark:text-green-400"
        >
          {{ currencyStore.formatCurrency(transactionStore.totalIncome) }}
        </span>
        <span
          v-if="transactionStore.targetCurrency"
          class="text-lg font-medium text-gray-500 dark:text-gray-400 ltr:ml-2 rtl:mr-2"
        >
          (~{{
            currencyStore.formatCurrency(
              transactionStore.convertAmount(transactionStore.totalIncome),
              transactionStore.targetCurrency
            )
          }})
        </span>
      </div>
    </div>

    <!-- Total Expenses Card -->
    <div
      class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300"
    >
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
        {{ t("total_expenses") }}
      </h3>
      <div class="mt-2">
        <span
          class="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400"
        >
          {{ currencyStore.formatCurrency(transactionStore.totalExpenses) }}
        </span>
        <span
          v-if="transactionStore.targetCurrency"
          class="text-lg font-medium text-gray-500 dark:text-gray-400 ltr:ml-2 rtl:mr-2"
        >
          (~{{
            currencyStore.formatCurrency(
              transactionStore.convertAmount(transactionStore.totalExpenses),
              transactionStore.targetCurrency
            )
          }})
        </span>
      </div>
    </div>

    <!-- Final Balance Card -->
    <div
      class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300"
    >
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">
        {{ t("balance") }}
      </h3>
      <div class="mt-2">
        <span
          class="text-3xl font-bold"
          :class="
            transactionStore.balance >= 0
              ? 'text-gray-900 dark:text-white'
              : 'text-red-600 dark:text-red-400'
          "
        >
          {{ currencyStore.formatCurrency(transactionStore.balance) }}
        </span>
        <span
          v-if="transactionStore.targetCurrency"
          class="text-lg font-medium text-gray-500 dark:text-gray-400 ltr:ml-2 rtl:mr-2"
        >
          (~{{
            currencyStore.formatCurrency(
              transactionStore.convertAmount(transactionStore.balance),
              transactionStore.targetCurrency
            )
          }})
        </span>
      </div>
    </div>
  </div>
</template>
