import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { supabase } from "../services/supabase";
import type { Transaction, Category } from "../types";
import { useAuthStore } from "./authStore";

export const useTransactionStore = defineStore("transactions", () => {
  const allTransactions = ref<Transaction[]>([]);
  const categories = ref<Category[]>([]);
  const loading = ref(false);

  const formatDateLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const setDefaultDateFilters = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: formatDateLocal(firstDay),
      endDate: formatDateLocal(lastDay),
    };
  };

  const globalFilters = ref(setDefaultDateFilters());

  const localFilters = ref({
    singleDate: "",
    type: null as "income" | "expense" | null,
    category: null as number | null,
    priority: null as "High" | "Medium" | "Low" | null,
  });

  const conversionRate = ref<number | null>(null);
  const targetCurrency = ref<string | null>(null);

  const resetLocalFilters = () => {
    localFilters.value = { singleDate: "", type: null, category: null, priority: null };
  };

  const resetAllFilters = () => {
    globalFilters.value = setDefaultDateFilters();
    resetLocalFilters();
  };

  const resetConversion = () => {
    conversionRate.value = null;
    targetCurrency.value = null;
  };

  const globallyFilteredTransactions = computed(() => {
    const { startDate, endDate } = globalFilters.value;
    if (!startDate || !endDate) return allTransactions.value; // **إصلاح مهم: أرجع كل المعاملات إذا لم تكن هناك فلاتر تاريخ**
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return allTransactions.value.filter((t) => {
      const transactionDate = new Date(t.created_at);
      return transactionDate >= start && transactionDate <= end;
    });
  });

  const totalIncome = computed(() =>
    globallyFilteredTransactions.value
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const totalExpenses = computed(() =>
    globallyFilteredTransactions.value
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const balance = computed(() => totalIncome.value - totalExpenses.value);

  const convertAmount = (amount: number): number => {
    if (conversionRate.value && conversionRate.value > 0) {
      return amount / conversionRate.value;
    }
    return amount;
  };

  const fetchTransactions = async () => {
    loading.value = true;
    const { data, error } = await supabase
      .from("transactions")
      .select("*, categories(id, name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      allTransactions.value = [];
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

  const addTransaction = async (transaction: Omit<Transaction, "id" | "user_id">) => {
    const authStore = useAuthStore();
    if (!authStore.user) return;
    const { error } = await supabase.from("transactions").insert([{ ...transaction, user_id: authStore.user.id }]);
    if (error) console.error("Error adding transaction:", error);
    else await fetchTransactions();
  };

  const updateTransaction = async (id: number, updates: Partial<Omit<Transaction, "id" | "user_id">>) => {
    const { error } = await supabase.from("transactions").update(updates).eq("id", id);
    if (error) console.error("Error updating transaction:", error);
    else await fetchTransactions();
  };

  const deleteTransaction = async (id: number) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) console.error("Error deleting transaction:", error);
    else allTransactions.value = allTransactions.value.filter((t) => t.id !== id);
  };

  const addCategory = async (name: string): Promise<Category | null> => {
    const authStore = useAuthStore();
    if (!authStore.user) return null;
    const existingCategory = categories.value.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) return existingCategory;
    const { data, error } = await supabase.from("categories").insert([{ name, user_id: authStore.user.id }]).select().single();
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
    allTransactions, categories, loading, globalFilters, localFilters,
    conversionRate, targetCurrency, resetLocalFilters, resetAllFilters,
    resetConversion, globallyFilteredTransactions, totalIncome, totalExpenses,
    balance, convertAmount, fetchTransactions, fetchCategories, addTransaction,
    updateTransaction, deleteTransaction, addCategory,
  };
});
