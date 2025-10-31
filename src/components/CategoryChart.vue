<script setup lang="ts">
import { computed } from 'vue';
import { useTransactionStore } from '../stores/transactionStore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import type { Transaction, Category } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);
const transactionStore = useTransactionStore();

const categoryColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#2ecc71', '#e74c3c', '#f1c40f', '#3498db', '#8e44ad', '#d35400'
];

const chartDetails = computed(() => {
  const expenses = transactionStore.globallyFilteredTransactions.filter(
    (t: Transaction) => t.type === 'expense'
  );
  const totalExpenses = expenses.reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  if (totalExpenses === 0) {
    return { hasData: false, chartData: { labels: [], datasets: [] }, legendItems: [] };
  }

  const expensesByCategory = expenses.reduce((acc: Record<string, number>, t: Transaction) => {
    const categoryName = transactionStore.categories.find((c: Category) => c.id === t.category_id)?.name || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + t.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a);

  const labels = sortedCategories.map(([name]) => name);
  const data = sortedCategories.map(([, amount]) => amount);
  const percentages = sortedCategories.map(([, amount]) => ((amount / totalExpenses) * 100).toFixed(1));
  const backgroundColors = labels.map((_, index) => categoryColors[index % categoryColors.length]);

  const chartData = {
    labels,
    datasets: [{ backgroundColor: backgroundColors, data }],
  };

  const legendItems = labels.map((label, index) => ({
    color: backgroundColors[index],
    label,
    percentage: percentages[index],
  }));

  return { hasData: expenses.length > 0, chartData, legendItems };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  cutout: '70%',
};
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Expenses by Category</h3>
    <div v-if="chartDetails.hasData" class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div class="h-56 md:h-64">
        <Doughnut :data="chartDetails.chartData" :options="chartOptions" />
      </div>
      <div class="flex flex-col justify-center space-y-2">
        <div v-for="item in chartDetails.legendItems" :key="item.label" class="flex items-center justify-between text-sm">
          <div class="flex items-center">
            <span class="h-3 w-3 rounded-full mr-2" :style="{ backgroundColor: item.color }"></span>
            <span class="text-gray-600 dark:text-gray-300">{{ item.label }}</span>
          </div>
          <span class="font-semibold text-gray-800 dark:text-white">{{ item.percentage }}%</span>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center h-64 text-gray-500">
      No expense data to display chart.
    </div>
  </div>
</template>
