<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { useRouter } from "vue-router";
import type { Transaction } from "../types";
import { useI18n } from "vue-i18n";

import Navbar from "../components/Navbar.vue";
import SummaryCards from "../components/SummaryCards.vue";
import TransactionForm from "../components/TransactionForm.vue";
import CategoryChart from "../components/CategoryChart.vue";
import PriorityChart from "../components/PriorityChart.vue";
import RecentTransactions from "../components/RecentTransactions.vue";
import CurrencySelector from "../components/CurrencySelector.vue";

const { t } = useI18n();

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const currencyStore = useCurrencyStore();
const router = useRouter();

const transactionToEdit = ref<Transaction | null>(null);
const dateErrorMessage = ref<string | null>(null);

watch(
  () => transactionStore.globalFilters,
  (newFilters) => {
    if (newFilters.startDate && newFilters.endDate) {
      if (newFilters.endDate < newFilters.startDate) {
        dateErrorMessage.value = t("date_error_end_before_start");
      } else {
        dateErrorMessage.value = null;
      }
    }
  },
  { deep: true }
);

const hasDateError = computed(() => !!dateErrorMessage.value);

const setTransactionToEdit = (transaction: Transaction) => {
  transactionToEdit.value = transaction;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const clearTransactionToEdit = () => {
  transactionToEdit.value = null;
};

const handleLogout = () => {
  authStore.logout(router);
};

onMounted(() => {
  transactionStore.fetchTransactions();
  transactionStore.fetchCategories();
});
</script>

<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300"
  >
    <Navbar :user="authStore.user" @logout="handleLogout" />

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0 space-y-8">
        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg transition-colors duration-300"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <h3
              class="text-lg font-medium text-gray-900 dark:text-white md:col-span-3"
            >
              {{ t("filter_dashboard_by_date") }}
            </h3>
            <div>
              <label
                for="global-start-date"
                class="block text-sm font-medium text-gray-600 dark:text-gray-300"
                >{{ t("from") }}</label
              >
              <input
                v-model="transactionStore.globalFilters.startDate"
                id="global-start-date"
                type="date"
                class="mt-1 filter-input"
              />
            </div>
            <div>
              <label
                for="global-end-date"
                class="block text-sm font-medium text-gray-600 dark:text-gray-300"
                >{{ t("to") }}</label
              >
              <input
                v-model="transactionStore.globalFilters.endDate"
                id="global-end-date"
                type="date"
                class="mt-1 filter-input"
              />
            </div>
            <div>
              <button
                @click="transactionStore.resetAllFilters"
                class="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {{ t("reset_filters") }}
              </button>
            </div>
          </div>
          <div
            v-if="dateErrorMessage"
            class="mt-3 p-3 bg-red-500/10 rounded-md"
          >
            <p class="text-sm text-red-500 dark:text-red-400">
              {{ dateErrorMessage }}
            </p>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg transition-colors duration-300"
        >
          <h3
            class="text-lg font-medium text-gray-900 dark:text-white mb-3 md:col-span-3"
          >
            {{ t("manual_currency_converter") }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label
                class="block text-sm font-medium text-gray-600 dark:text-gray-300"
                >{{ t("convert_to_currency") }}</label
              >
              <CurrencySelector v-model="transactionStore.targetCurrency" />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                {{
                  t("target_currency_rate", {
                    targetCurrency: transactionStore.targetCurrency || "Target",
                  })
                }}
              </label>
              <input
                v-model.number="transactionStore.conversionRate"
                type="number"
                step="any"
                :placeholder="
                  t('rate_in_currency', {
                    selectedCurrency: currencyStore.selectedCurrency,
                  })
                "
                class="mt-1 filter-input"
              />
            </div>

            <div>
              <button
                @click="transactionStore.resetConversion"
                class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {{ t("reset_conversion") }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="!hasDateError">
          <SummaryCards />

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div class="lg:col-span-1">
              <TransactionForm
                :transaction-to-edit="transactionToEdit"
                @clear-edit="clearTransactionToEdit"
              />
            </div>
            <div class="lg:col-span-2 space-y-8">
              <CategoryChart />
              <PriorityChart />
            </div>
          </div>

          <div class="mt-8">
            <RecentTransactions @edit-transaction="setTransactionToEdit" />
          </div>
        </div>

        <div
          v-else
          class="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md"
        >
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">
            {{ t("invalid_date_range") }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t("invalid_date_message") }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss">
.filter-input {
  @apply block w-full rounded-md border-gray-300 dark:border-gray-600 py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6;
}
</style>
