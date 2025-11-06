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

// --- ✨ 1. تحويل الدالة إلى async ---
const handleExportExcel = async () => {
  if (transactionsToExport.value.length === 0) {
    alert(t("no_data_to_export"));
    return;
  }

  // --- ✨ 2. إعداد البيانات مع كائن التاريخ الكامل ---
  const translatedData = transactionsToExport.value.map((transaction) => {
    const category = transactionStore.categories.find(
      (c) => c.id === transaction.category_id
    );

    return {
      _fullDate: new Date(transaction.created_at), // <-- إرسال كائن التاريخ
      [t("excel.header.date")]: "", // سيتم ملؤه لاحقاً في دالة التصدير
      [t("excel.header.description")]: transaction.description,
      [t("excel.header.type")]: t(`transaction.type.${transaction.type}`),
      [t("excel.header.amount")]: transaction.amount.toFixed(2),
      [t("excel.header.category")]: category
        ? t(category.name.toLowerCase())
        : t("n_a"),
      [t("excel.header.priority")]: transaction.priority
        ? t(`priority_levels.${transaction.priority.toLowerCase()}`)
        : t("n_a"),
    };
  });

  // --- ✨ 3. استخدام await عند استدعاء الدالة ---
  try {
    await exportToExcel(translatedData, t("excel.file_name"));
  } catch (error) {
    console.error("Excel export failed:", error);
    alert(
      "An error occurred during the Excel export. Please check the console."
    );
  }
};

const handleExportPDF = async () => {
  if (transactionsToExport.value.length === 0) {
    alert(t("no_data_to_export"));
    return;
  }

  let categoryChartImage = "";
  let priorityChartImage = "";

  try {
    const getChartAsBase64 = (chartId: string): string => {
      const chart = ChartJS.getChart(chartId);
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
