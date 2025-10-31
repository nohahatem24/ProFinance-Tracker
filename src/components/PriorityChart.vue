<script setup lang="ts">
import { computed } from "vue";
import { useTransactionStore } from "../stores/transactionStore";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";
import type { Transaction } from "../types";

ChartJS.register(ArcElement, Tooltip, Legend);
const transactionStore = useTransactionStore();

// ألوان ثابتة لكل أولوية
const priorityColors = {
  High: "#19CC0F",
  Medium: "#EBDC0A",
  Low: "#D92632",
};

const chartDetails = computed(() => {
  const expenses = transactionStore.globallyFilteredTransactions.filter(
    (t: Transaction) => t.type === "expense" && t.priority
  );
  const totalExpenses = expenses.reduce(
    (sum: number, t: Transaction) => sum + t.amount,
    0
  );

  if (totalExpenses === 0) {
    return {
      hasData: false,
      chartData: { labels: [], datasets: [] },
      legendItems: [],
    };
  }

  // --- إصلاح: إضافة `return acc;` ---
  const expensesByPriority = expenses.reduce(
    (acc: Record<string, number>, t: Transaction) => {
      if (t.priority) {
        acc[t.priority] = (acc[t.priority] || 0) + t.amount;
      }
      return acc; // هذا السطر كان مفقودًا
    },
    {}
  );

  // --- إصلاح: استخدام `expensesByPriority` بشكل صحيح ---
  const priorityOrder = ["High", "Medium", "Low"];
  const sortedPriorities = priorityOrder.filter((p) => expensesByPriority[p]);

  const labels = sortedPriorities;
  const data = sortedPriorities.map((p) => expensesByPriority[p]);

  const percentages = sortedPriorities.map((p) =>
    ((expensesByPriority[p] / totalExpenses) * 100).toFixed(1)
  );

  const backgroundColors = sortedPriorities.map(
    (p) => priorityColors[p as keyof typeof priorityColors]
  );

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
  cutout: "70%",
};
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300"
  >
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
      Expenses by Priority
    </h3>
    <div
      v-if="chartDetails.hasData"
      class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
    >
      <div class="h-56 md:h-64">
        <Doughnut :data="chartDetails.chartData" :options="chartOptions" />
      </div>
      <div class="flex flex-col justify-center space-y-2">
        <div
          v-for="item in chartDetails.legendItems"
          :key="item.label"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center">
            <span
              class="h-3 w-3 rounded-full mr-2"
              :style="{ backgroundColor: item.color }"
            ></span>
            <span class="text-gray-600 dark:text-gray-300">{{
              item.label
            }}</span>
          </div>
          <span class="font-semibold text-gray-800 dark:text-white"
            >{{ item.percentage }}%</span
          >
        </div>
      </div>
    </div>
    <div
      v-else
      class="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400"
    >
      No expense data to display chart.
    </div>
  </div>
</template>
