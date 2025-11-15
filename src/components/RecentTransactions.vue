<script setup lang="ts">
import "../styles/recent-transactions.css";
import { computed } from "vue";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import type { Transaction } from "../types";
import { useI18n } from "vue-i18n";
import ExportOptions from "./ExportOptions.vue";

const { t, locale } = useI18n();
const transactionStore = useTransactionStore();
const currencyStore = useCurrencyStore();

const rtlLocales = ["ar", "he", "fa", "ur", "ps", "yi", "sd"];
const isRtl = computed(() => rtlLocales.includes(locale.value));

const emit = defineEmits<{
  (e: "edit-transaction", transaction: Transaction): void;
}>();

const setTransactionToEdit = (transaction: Transaction) => {
  emit("edit-transaction", transaction);
};

const deleteTransaction = async (id: number) => {
  if (confirm(t("confirm_delete_transaction"))) {
    await transactionStore.deleteTransaction(id);
  }
};

const filteredTransactions = computed(() => {
  return transactionStore.globallyFilteredTransactions
    .filter((t) => {
      const { singleDate, type, category, priority } =
        transactionStore.localFilters;

      const singleDateMatch =
        !singleDate ||
        new Date(t.created_at).toISOString().split("T")[0] === singleDate;
      const typeMatch = !type || t.type === type;
      const categoryMatch = !category || t.category_id === category;
      const priorityMatch = !priority || t.priority === priority;

      return singleDateMatch && typeMatch && categoryMatch && priorityMatch;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
});

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    datePart: date.toLocaleDateString(),
    timePart: date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const getCategoryName = (id: number | null) => {
  if (!id) return t("n_a");
  const category = transactionStore.categories.find((c) => c.id === id);
  return category ? t(category.name.toLowerCase()) : t("n_a");
};

const getPriorityColor = (priority: string | null) => {
  switch (priority?.toLowerCase()) {
    case "low":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "high":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

const getTypeColorClass = (type: string) => {
  if (type === "income") {
    return "text-green-600 dark:text-green-400";
  } else if (type === "expense") {
    return "text-red-500 dark:text-red-400";
  }
  return "";
};
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <h3
      class="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-start"
    >
      {{ t("transaction_history") }}
    </h3>
    <!-- Filters Section -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4"
    >
      <!-- Date Filter -->
      <div>
        <label
          for="single-date"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("filter_by_date") }}</label
        >
        <input
          v-model="transactionStore.localFilters.singleDate"
          id="single-date"
          type="date"
          class="mt-1 filter-input"
        />
      </div>
      <!-- Type Filter -->
      <div>
        <label
          for="type-filter"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("filter_by_type") }}</label
        >
        <select
          v-model="transactionStore.localFilters.type"
          id="type-filter"
          class="mt-1 filter-input select-input"
        >
          <option :value="null">{{ t("all_types") }}</option>
          <option value="income">{{ t("transaction.type.income") }}</option>
          <option value="expense">{{ t("transaction.type.expense") }}</option>
        </select>
      </div>
      <!-- Category Filter -->
      <div>
        <label
          for="category-filter"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("filter_by_category") }}</label
        >
        <select
          v-model="transactionStore.localFilters.category"
          id="category-filter"
          class="mt-1 filter-input select-input"
        >
          <option :value="null">{{ t("all_categories") }}</option>
          <option
            v-for="category in transactionStore.categories"
            :key="category.id"
            :value="category.id"
          >
            {{ t(category.name.toLowerCase()) }}
          </option>
        </select>
      </div>
      <!-- Priority Filter -->
      <div>
        <label
          for="priority-filter"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("filter_by_priority") }}</label
        >
        <select
          v-model="transactionStore.localFilters.priority"
          id="priority-filter"
          class="mt-1 filter-input select-input"
        >
          <option :value="null">{{ t("all_priorities") }}</option>
          <option value="high">{{ t("priority_levels.high") }}</option>
          <option value="medium">{{ t("priority_levels.medium") }}</option>
          <option value="low">{{ t("priority_levels.low") }}</option>
        </select>
      </div>
      <!-- Reset Button -->
      <div class="flex items-end">
        <button
          @click="transactionStore.resetLocalFilters"
          class="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {{ t("reset") }}
        </button>
      </div>
    </div>

    <!-- Export Options -->
    <div class="my-6"><ExportOptions /></div>

    <!-- Transactions Table -->
    <div class="overflow-x-auto max-h-96">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-indigo-50 dark:bg-gray-700 sticky top-0">
          <tr>
            <!-- ✨ إصلاح 1: ترجمة عناوين الجدول في الإكسل -->
            <th scope="col" class="table-header">
              {{ t("excel.header.date") }}
            </th>
            <th scope="col" class="table-header">
              {{ t("excel.header.description") }}
            </th>
            <th scope="col" class="table-header">
              {{ t("excel.header.type") }}
            </th>
            <th scope="col" class="table-header">
              {{ t("excel.header.amount") }}
            </th>
            <th scope="col" class="table-header">
              {{ t("excel.header.category") }}
            </th>
            <th scope="col" class="table-header">
              {{ t("excel.header.priority") }}
            </th>
            <th scope="col" class="table-header">{{ t("actions") }}</th>
          </tr>
        </thead>
        <tbody
          class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <tr v-if="transactionStore.loading">
            <td
              colspan="7"
              class="text-center py-4 text-gray-500 dark:text-gray-400"
            >
              Loading...
            </td>
          </tr>
          <tr v-else-if="filteredTransactions.length === 0">
            <td
              colspan="7"
              class="text-center py-4 text-gray-500 dark:text-gray-400"
            >
              {{ t("no_transactions_found") }}
            </td>
          </tr>
          <tr
            v-else
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
          >
            <td class="table-cell">
              <div class="flex flex-col">
                <span class="font-bold">{{
                  formatDateTime(transaction.created_at).datePart
                }}</span>
                <span class="text-xs text-gray-500">{{
                  formatDateTime(transaction.created_at).timePart
                }}</span>
              </div>
            </td>
            <td class="table-cell">{{ transaction.description }}</td>
            <!-- ✨ إصلاح 2: ترجمة النوع في الجدول -->
            <td
              class="table-cell font-medium"
              :class="getTypeColorClass(transaction.type)"
            >
              {{ t(`transaction.type.${transaction.type}`) }}
            </td>
            <td
              class="table-cell font-medium"
              :class="getTypeColorClass(transaction.type)"
            >
              <span v-if="transaction.type === 'income'">+</span>
              <span v-else>-</span>
              {{ currencyStore.selectedCurrency }}
              {{ transaction.amount.toFixed(2) }}
            </td>
            <td class="table-cell">
              {{ getCategoryName(transaction.category_id) }}
            </td>
            <td class="table-cell">
              <span
                :class="getPriorityColor(transaction.priority)"
                class="priority-badge"
              >
                <!-- ✨ إصلاح 3: ترجمة الأولوية في الجدول -->
                {{
                  transaction.priority
                    ? t(`priority_levels.${transaction.priority.toLowerCase()}`)
                    : t("n_a")
                }}
              </span>
            </td>
            <td class="table-cell">
              <div class="flex items-center justify-center space-x-2">
                <button
                  @click="setTransactionToEdit(transaction)"
                  class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                >
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button
                  @click="deleteTransaction(transaction.id)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
