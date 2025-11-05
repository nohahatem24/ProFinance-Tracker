<script setup lang="ts">
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

const rtlLocales = ["ar", "he", "fa", "ur"];
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
  switch (priority) {
    case "Low":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "High":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

// --- الدالة الجديدة ---
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
    <!-- ... باقي الفلاتر ... -->
    <h3
      class="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-start"
    >
      {{ t("transaction_history") }}
    </h3>
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4"
    >
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
          <option value="income">{{ t("income") }}</option>
          <option value="expense">{{ t("expense") }}</option>
        </select>
      </div>
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
          <option value="High">{{ t("high") }}</option>
          <option value="Medium">{{ t("medium") }}</option>
          <option value="Low">{{ t("low") }}</option>
        </select>
      </div>
      <div class="flex items-end">
        <button
          @click="transactionStore.resetLocalFilters"
          class="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {{ t("reset") }}
        </button>
      </div>
    </div>
    <div class="my-6"><ExportOptions /></div>
    <div class="overflow-x-auto max-h-96">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-indigo-50 dark:bg-gray-700 sticky top-0">
          <tr>
            <th scope="col" class="table-header">{{ t("date") }}</th>
            <th scope="col" class="table-header">{{ t("description") }}</th>
            <th scope="col" class="table-header">{{ t("type") }}</th>
            <th scope="col" class="table-header">{{ t("amount") }}</th>
            <th scope="col" class="table-header">{{ t("category") }}</th>
            <th scope="col" class="table-header">{{ t("priority") }}</th>
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
            <!-- **التعديل الجديد هنا** -->
            <td
              class="table-cell font-medium"
              :class="getTypeColorClass(transaction.type)"
            >
              {{ t(transaction.type) }}
            </td>
            <!-- **التعديل الجديد هنا** -->
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
                >{{
                  transaction.priority
                    ? t(transaction.priority.toLowerCase())
                    : t("n_a")
                }}</span
              >
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

<style scoped lang="postcss">
.filter-input {
  @apply block w-full rounded-md border-gray-300 dark:border-gray-600 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6;
}

.select-input {
  @apply appearance-none bg-no-repeat;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-size: 1.5em 1.5em;
}

[dir="ltr"] .select-input {
  background-position: right 0.5rem center;
  @apply pr-10 pl-3;
}

[dir="rtl"] .select-input {
  background-position: left 0.5rem center;
  @apply pl-10 pr-3;
}

.table-header {
  @apply px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider;
}
.table-cell {
  @apply px-4 py-4 whitespace-nowrap text-sm;
}
.priority-badge {
  @apply px-2 inline-flex text-xs leading-5 font-semibold rounded-full;
}

[dir="rtl"] .table-header,
[dir="rtl"] .table-cell,
[dir="rtl"] h3,
[dir="rtl"] label {
  @apply text-right;
}

[dir="rtl"] .flex.space-x-2 {
  @apply space-x-reverse;
}
</style>
