<script setup lang="ts">
import { computed } from "vue";
import { useTransactionStore } from "../stores/transactionStore";
// --- **الإصلاح هنا: استيراد TooltipItem** ---
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { Doughnut } from "vue-chartjs";
import type { Transaction, Category } from "../types";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const rtlLocales = ["ar", "he", "fa", "ur"];
const isRtl = computed(() => rtlLocales.includes(locale.value));

ChartJS.register(ArcElement, Tooltip, Legend);
const transactionStore = useTransactionStore();

const categoryColors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#2ecc71",
  "#e74c3c",
  "#f1c40f",
  "#3498db",
  "#8e44ad",
  "#d35400",
];

const chartDetails = computed(() => {
  const expenses = transactionStore.globallyFilteredTransactions.filter(
    (t: Transaction) => t.type === "expense"
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

  // --- ✨ 2. تعديل هنا: استخدام مفتاح ترجمة صغير (lowercase) ---
  const expensesByCategory = expenses.reduce(
    (acc: Record<string, number>, t_transaction: Transaction) => {
      const category = transactionStore.categories.find(
        (c: Category) => c.id === t_transaction.category_id
      );
      // نستخدم اسم الفئة بحروف صغيرة كمفتاح، أو "n_a"
      const categoryKey = category ? category.name.toLowerCase() : "n_a";
      acc[categoryKey] = (acc[categoryKey] || 0) + t_transaction.amount;
      return acc;
    },
    {}
  );

  const sortedCategories = Object.entries(expensesByCategory).sort(
    ([, a], [, b]) => b - a
  );

  const labels = sortedCategories.map(([key]) => key);
  const data = sortedCategories.map(([, amount]) => amount);
  const percentages = sortedCategories.map(([, amount]) =>
    ((amount / totalExpenses) * 100).toFixed(1)
  );
  const backgroundColors = labels.map(
    (_, index) => categoryColors[index % categoryColors.length]
  );

  const chartData = {
    labels: labels.map((label) => t(label)),
    datasets: [{ backgroundColor: backgroundColors, data }],
  };

  const legendItems = labels.map((label, index) => ({
    color: backgroundColors[index],
    label: label,
    percentage: percentages[index],
  }));

  return { hasData: expenses.length > 0, chartData, legendItems };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        // --- **الإصلاح هنا: تحديد نوع context** ---
        label: function (context: TooltipItem<"doughnut">) {
          let label = context.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed !== null) {
            label += new Intl.NumberFormat().format(context.parsed);
          }
          return label;
        },
      },
    },
  },
  cutout: "70%",
};
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300"
  >
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
      {{ t("category_distribution") }}
    </h3>
    <div
      v-if="chartDetails.hasData"
      class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
    >
      <div class="h-56 md:h-64">
        <Doughnut
          id="category-chart-canvas"
          :data="chartDetails.chartData"
          :options="chartOptions"
        />
      </div>
      <div class="flex flex-col justify-center space-y-2">
        <div
          v-for="item in chartDetails.legendItems"
          :key="item.label"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center">
            <span
              class="h-3 w-3 rounded-full shrink-0 ltr:mr-2 rtl:ml-2"
              :style="{ backgroundColor: item.color }"
            ></span>
            <span class="text-gray-600 dark:text-gray-300">{{
              t(item.label)
            }}</span>
          </div>
          <span class="font-semibold text-gray-800 dark:text-white"
            >{{ item.percentage }}%</span
          >
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center h-64 text-gray-500">
      {{ t("no_data_to_export") }}
    </div>
  </div>
</template>
