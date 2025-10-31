<script setup lang="ts">
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from '../stores/currencyStore';
import type { Category } from '../types';

const transactionStore = useTransactionStore();
const currencyStore = useCurrencyStore();
const emit = defineEmits(["edit-transaction"]);

const handleDelete = async (id: number) => {
  if (confirm("Are you sure you want to delete this transaction?")) {
    await transactionStore.deleteTransaction(id);
  }
};

const getPriorityClass = (priority: string | null) => {
  if (priority === "High") return "bg-red-500/20 text-red-500 dark:text-red-400";
  if (priority === "Medium") return "bg-yellow-500/20 text-yellow-500 dark:text-yellow-400";
  if (priority === "Low") return "bg-green-500/20 text-green-500 dark:text-green-400";
  return "bg-gray-500/20 text-gray-400";
};
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Transactions History</h3>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div class="col-span-2 lg:col-span-1">
        <label for="filter-text" class="block text-sm font-medium text-gray-600 dark:text-gray-300">Search</label>
        <input v-model="transactionStore.localFilters.text" id="filter-text" type="text" placeholder="Filter by description..." class="mt-1 filter-input"/>
      </div>
      <div>
        <label for="filter-type" class="block text-sm font-medium text-gray-600 dark:text-gray-300">Type</label>
        <select v-model="transactionStore.localFilters.type" id="filter-type" class="mt-1 filter-input">
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <div>
        <label for="filter-category" class="block text-sm font-medium text-gray-600 dark:text-gray-300">Category</label>
        <select v-model="transactionStore.localFilters.category" id="filter-category" class="mt-1 filter-input">
          <option value="all">All</option>
          <option v-for="cat in transactionStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div>
        <label for="filter-priority" class="block text-sm font-medium text-gray-600 dark:text-gray-300">Priority</label>
        <select v-model="transactionStore.localFilters.priority" id="filter-priority" class="mt-1 filter-input">
          <option value="all">All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <div>
        <label for="filter-single-date" class="block text-sm font-medium text-gray-600 dark:text-gray-300">By Day</label>
        <input v-model="transactionStore.localFilters.singleDate" id="filter-single-date" type="date" class="mt-1 filter-input"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-transparent">Reset</label>
        <button @click="transactionStore.resetLocalFilters" class="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Reset</button>
      </div>
    </div>
    <div v-if="transactionStore.locallyFilteredTransactions.length" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 sm:pl-0">Transaction</th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Amount</th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Priority</th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Date</th>
            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="t in transactionStore.locallyFilteredTransactions" :key="t.id">
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
              <div class="flex items-center">
                <div class="ml-4">
                  <div class="font-medium text-gray-900 dark:text-white">{{ t.description }}</div>
                  <div class="text-gray-500 dark:text-gray-400">{{ transactionStore.categories.find((c: Category) => c.id === t.category_id)?.name || (t.type === 'income' ? 'Income' : 'Uncategorized') }}</div>
                </div>
              </div>
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm" :class="t.type === 'income' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'">
              {{ t.type === "income" ? "+" : "-" }}
              <!-- استخدام الدالة المركزية -->
              {{ currencyStore.formatCurrency(t.amount) }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
              <span v-if="t.priority" class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset" :class="getPriorityClass(t.priority)">{{ t.priority }}</span>
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{{ new Date(t.created_at).toLocaleDateString() }}</td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
              <div class="flex items-center justify-end gap-4">
                <button @click="emit('edit-transaction', t)" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300" title="Edit">Edit</button>
                <button @click="handleDelete(t.id)" class="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center py-8">
      <p class="text-gray-500 dark:text-gray-400">No transactions match your filters.</p>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.filter-input {
  @apply block w-full rounded-md border-gray-300 dark:border-gray-600 py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6;
}
</style>
