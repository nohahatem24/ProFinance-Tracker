import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { supabase } from "../services/supabase";
import type { Transaction, Category } from "../types";
import { useAuthStore } from "./authStore";

export const useTransactionStore = defineStore("transactions", () => {
  const allTransactions = ref<Transaction[]>([]);
  const categories = ref<Category[]>([]);
  const loading = ref(false);

  // --- الإصلاح الجذري هنا ---
  // helper: تنسيق التاريخ بصيغة yyyy-mm-dd بالزمن المحلي
  const formatDateLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // helper: إنشاء Date محلي من سلسلة yyyy-mm-dd
  const parseDateLocal = (yyyyMmDd: string) => {
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  // نقوم بإنشاء دالة لضبط التاريخ أولاً (الشهر التقويمي الحالي)
  const setDefaultDateFilters = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: formatDateLocal(firstDay),
      endDate: formatDateLocal(lastDay),
    };
  };

  // ثم نستخدمها مباشرة عند تعريف globalFilters
  const globalFilters = ref(setDefaultDateFilters());
  // -------------------------

  const localFilters = ref({
    text: "",
    type: "all" as "all" | "income" | "expense",
    category: "all" as number | "all",
    priority: "all" as "all" | "High" | "Medium" | "Low",
    singleDate: "",
  });

  const conversionRate = ref<number | null>(null);
  const targetCurrency = ref<string | null>(null);

  const resetLocalFilters = () => {
    localFilters.value = {
      text: "",
      type: "all",
      category: "all",
      priority: "all",
      singleDate: "",
    };
  };

  const resetAllFilters = () => {
    globalFilters.value = setDefaultDateFilters();
    resetLocalFilters();
  };

  const resetConversion = () => {
    conversionRate.value = null;
    targetCurrency.value = null;
  };

  // --- 1. حساب رصيد بداية الفترة (الرصيد المرحّل) ---
  const openingBalance = computed(() => {
    if (!globalFilters.value.startDate) return 0;
    const startDate = parseDateLocal(globalFilters.value.startDate);
    const previousTransactions = allTransactions.value.filter((t) => {
      const txDate = parseDateLocal(formatDateLocal(new Date(t.created_at)));
      return txDate < startDate;
    });
    const previousIncome = previousTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const previousExpenses = previousTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return previousIncome - previousExpenses;
  });

  // --- 2. المعاملات خلال الفترة المحددة فقط ---
  const globallyFilteredTransactions = computed(() => {
    const { startDate, endDate } = globalFilters.value;
    if (!startDate || !endDate) return []; // التأكد من وجود القيم
    return allTransactions.value.filter((t) => {
      const transactionDate = formatDateLocal(new Date(t.created_at));
      if (transactionDate < startDate) return false;
      if (transactionDate > endDate) return false;
      return true;
    });
  });

  // --- 3. الدخل والمصروفات الجديدة خلال الفترة ---
  const incomeThisPeriod = computed(() =>
    globallyFilteredTransactions.value
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const expensesThisPeriod = computed(() =>
    globallyFilteredTransactions.value
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  // --- 4. بناء القيم النهائية للعرض بناءً على المنطق الصحيح ---

  // "Total Available" = الرصيد المرحّل (إذا كان موجبًا) + الدخل الجديد
  const totalIncome = computed(() => {
    const carryOver = Math.max(0, openingBalance.value); // لا نرحل رصيدًا سالبًا كدخل
    return incomeThisPeriod.value + carryOver;
  });

  // "Total Expenses" = المصروفات الجديدة فقط
  const totalExpenses = computed(() => {
    return expensesThisPeriod.value;
  });

  // "Final Balance" = الرصيد المرحّل + الدخل الجديد - المصروفات الجديدة
  const balance = computed(() => {
    return (
      openingBalance.value + incomeThisPeriod.value - expensesThisPeriod.value
    );
  });

  const convertAmount = (amount: number): number => {
    if (conversionRate.value && conversionRate.value > 0) {
      return amount / conversionRate.value;
    }
    return amount;
  };

  const locallyFilteredTransactions = computed(() => {
    return globallyFilteredTransactions.value.filter((t) => {
      const textMatch =
        !localFilters.value.text ||
        t.description
          .toLowerCase()
          .includes(localFilters.value.text.toLowerCase());
      const typeMatch =
        localFilters.value.type === "all" || t.type === localFilters.value.type;
      const categoryMatch =
        localFilters.value.category === "all" ||
        t.category_id === localFilters.value.category;
      const priorityMatch =
        localFilters.value.priority === "all" ||
        t.priority === localFilters.value.priority;
      const singleDateMatch =
        !localFilters.value.singleDate ||
        formatDateLocal(new Date(t.created_at)) ===
          localFilters.value.singleDate;
      return (
        textMatch &&
        typeMatch &&
        categoryMatch &&
        priorityMatch &&
        singleDateMatch
      );
    });
  });

  const fetchTransactions = async () => {
    loading.value = true;
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      allTransactions.value = data || [];
    }
    loading.value = false;
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error("Error fetching categories:", error);
    else categories.value = data || [];
  };

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "user_id">
  ) => {
    const authStore = useAuthStore();
    if (!authStore.user) return;
    const { data, error } = await supabase
      .from("transactions")
      .insert([{ ...transaction, user_id: authStore.user.id }])
      .select()
      .single();
    if (error) console.error("Error adding transaction:", error);
    else if (data) await fetchTransactions();
  };

  const updateTransaction = async (
    id: number,
    updates: Partial<Omit<Transaction, "id" | "user_id">>
  ) => {
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) console.error("Error updating transaction:", error);
    else if (data) await fetchTransactions();
  };

  const deleteTransaction = async (id: number) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) console.error("Error deleting transaction:", error);
    else
      allTransactions.value = allTransactions.value.filter((t) => t.id !== id);
  };

  const addCategory = async (name: string): Promise<Category | null> => {
    const authStore = useAuthStore();
    if (!authStore.user) return null;
    const existingCategory = categories.value.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (existingCategory) return existingCategory;
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, user_id: authStore.user.id }])
      .select()
      .single();
    if (error) {
      console.error("Error adding category:", error);
      return null;
    }
    if (data) {
      categories.value.push(data);
      return data;
    }
    return null;
  };

  return {
    allTransactions,
    categories,
    loading,
    globalFilters,
    localFilters,
    conversionRate,
    targetCurrency,
    resetLocalFilters,
    resetAllFilters,
    resetConversion,
    openingBalance,
    globallyFilteredTransactions,
    locallyFilteredTransactions,
    totalIncome,
    totalExpenses,
    balance,
    convertAmount,
    fetchTransactions,
    fetchCategories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
  };
});
