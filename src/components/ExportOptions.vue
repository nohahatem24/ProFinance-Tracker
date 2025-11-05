<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { exportToExcel, exportToPDF } from "../services/exportService";
import { computed } from "vue";
import { Chart as ChartJS } from "chart.js";

const { t } = useI18n();
const transactionStore = useTransactionStore();
const currencyStore = useCurrencyStore();

const transactionsToExport = computed(() => {
  return transactionStore.globallyFilteredTransactions;
});

const handleExportExcel = () => {
  if (transactionsToExport.value.length === 0) {
    alert(t("no_data_to_export"));
    return;
  }
  exportToExcel(
    transactionsToExport.value,
    transactionStore.categories,
    "ProFinance_Report"
  );
};

const handleExportPDF = async () => {
  if (transactionsToExport.value.length === 0) {
    alert(t("no_data_to_export"));
    return;
  }

  let categoryChartImage = "";
  let priorityChartImage = "";

  // --- **الإصلاح هنا: استخدام try...catch لضمان عدم توقف الكود** ---
  try {
    const getChartAsBase64 = (chartId: string): string => {
      const chart = ChartJS.getChart(chartId);
      // التأكد من وجود الرسم البياني قبل محاولة تحويله
      if (chart) {
        return chart.toBase64Image();
      }
      console.warn(`Chart with id '${chartId}' not found.`);
      return "";
    };

    categoryChartImage = getChartAsBase64("category-chart-canvas");
    priorityChartImage = getChartAsBase64("priority-chart-canvas");
  } catch (error) {
    console.error("Failed to capture chart images:", error);
    // نترك الصور فارغة ونكمل العملية بدلاً من إيقافها
  }

  const reportData = {
    transactions: transactionsToExport.value,
    categories: transactionStore.categories,
    totalIncome: transactionStore.totalIncome,
    totalExpenses: transactionStore.totalExpenses,
    balance: transactionStore.balance,
    currency: transactionStore.targetCurrency || currencyStore.selectedCurrency,
    dateRange: {
      start: transactionStore.globalFilters.startDate || "N/A",
      end: transactionStore.globalFilters.endDate || "N/A",
    },
    categoryChartImage,
    priorityChartImage,
  };

  // استدعاء دالة التصدير النهائية
  await exportToPDF(reportData);
};
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
      {{ t("export_options") }}
    </h3>
    <div class="flex gap-4">
      <button
        @click="handleExportExcel"
        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        {{ t("export_to_excel") }}
      </button>
      <button
        @click="handleExportPDF"
        class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        {{ t("export_to_pdf") }}
      </button>
    </div>
  </div>
</template>
