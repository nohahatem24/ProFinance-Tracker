import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { allCurrencies, type Currency } from "../currencies";

export const useCurrencyStore = defineStore("currency", () => {
  const selectedCurrency = ref<string>(
    localStorage.getItem("selectedCurrency") || "USD"
  );

  watch(selectedCurrency, (newCurrency) => {
    localStorage.setItem("selectedCurrency", newCurrency);
  });

  const setCurrency = (currencyCode: string) => {
    selectedCurrency.value = currencyCode;
  };

  // --- الإصلاح الرئيسي هنا ---
  // نجعل الدالة تقبل رمز عملة اختياري.
  // إذا لم يتم توفيره، تستخدم العملة الأساسية المختارة.
  const formatCurrency = (value: number, currencyCode?: string) => {
    const code = currencyCode || selectedCurrency.value;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (e) {
      // في حالة وجود رمز عملة غير صالح، نرجع الرقم مع الرمز
      return `${code} ${value.toFixed(2)}`;
    }
  };

  return {
    selectedCurrency,
    allCurrencies,
    setCurrency,
    formatCurrency,
  };
});
