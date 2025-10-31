<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useTransactionStore } from "../stores/transactionStore";
import { useRouter } from "vue-router";
import type { Transaction } from '../types';

// استيراد المكونات
import Navbar from "../components/Navbar.vue";
import SummaryCards from "../components/SummaryCards.vue";
import TransactionForm from "../components/TransactionForm.vue";
import CategoryChart from "../components/CategoryChart.vue";
import PriorityChart from "../components/PriorityChart.vue";
import RecentTransactions from "../components/RecentTransactions.vue";

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const router = useRouter();

const transactionToEdit = ref<Transaction | null>(null);

const setTransactionToEdit = (transaction: Transaction) => {
  transactionToEdit.value = transaction;
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
    <!-- 
      --- إصلاح: التحقق من وجود user و email قبل التمرير ---
      نمرر كائنًا جديدًا فقط إذا كان authStore.user و authStore.user.email موجودين.
      هذا يضمن أن النوع الذي نمرره يطابق ما يتوقعه Navbar.
    -->
    <Navbar 
      :user="authStore.user && authStore.user.email ? { email: authStore.user.email } : null" 
      @logout="handleLogout" 
    />

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0 space-y-8">
        
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg transition-colors duration-300">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white md:col-span-3">Filter Dashboard by Date Range</h3>
            <div>
              <label for="global-start-date" class="block text-sm font-medium text-gray-600 dark:text-gray-300">From</label>
              <input v-model="transactionStore.globalFilters.startDate" id="global-start-date" type="date" class="mt-1 filter-input">
            </div>
            <div>
              <label for="global-end-date" class="block text-sm font-medium text-gray-600 dark:text-gray-300">To</label>
              <input v-model="transactionStore.globalFilters.endDate" id="global-end-date" type="date" class="mt-1 filter-input">
            </div>
            <div>
              <button @click="transactionStore.resetAllFilters" class="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Reset All Filters
              </button>
            </div>
          </div>
        </div>

        <SummaryCards 
          :income="transactionStore.totalIncome"
          :expenses="transactionStore.totalExpenses"
          :balance="transactionStore.balance"
        />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        <div>
          <RecentTransactions @edit-transaction="setTransactionToEdit" />
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
