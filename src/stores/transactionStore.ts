// src/stores/transactionStore.ts

import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { supabase } from '../services/supabase';
import type { Transaction, Category } from '../types';
import { useAuthStore } from './authStore';

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);
  const categories = ref<Category[]>([]);
  const loading = ref(false);

  const globalFilters = ref({
    startDate: '',
    endDate: '',
  });

  const localFilters = ref({
    text: '',
    type: 'all' as 'all' | 'income' | 'expense',
    category: 'all' as number | 'all',
    priority: 'all' as 'all' | 'High' | 'Medium' | 'Low',
    singleDate: '',
  });

  const resetLocalFilters = () => {
    localFilters.value = {
      text: '', type: 'all', category: 'all', priority: 'all', singleDate: ''
    };
  };

  const resetAllFilters = () => {
    globalFilters.value = { startDate: '', endDate: '' };
    resetLocalFilters();
  };

  const globallyFilteredTransactions = computed(() => {
    const { startDate, endDate } = globalFilters.value;
    if (!startDate && !endDate) {
      return transactions.value;
    }
    return transactions.value.filter(t => {
      const transactionDate = new Date(t.created_at).toISOString().split('T')[0];
      if (startDate && transactionDate < startDate) return false;
      if (endDate && transactionDate > endDate) return false;
      return true;
    });
  });

  const locallyFilteredTransactions = computed(() => {
    return globallyFilteredTransactions.value.filter(t => {
      const textMatch = !localFilters.value.text || t.description.toLowerCase().includes(localFilters.value.text.toLowerCase());
      const typeMatch = localFilters.value.type === 'all' || t.type === localFilters.value.type;
      const categoryMatch = localFilters.value.category === 'all' || t.category_id === localFilters.value.category;
      const priorityMatch = localFilters.value.priority === 'all' || t.priority === localFilters.value.priority;
      const singleDateMatch = !localFilters.value.singleDate || new Date(t.created_at).toISOString().split('T')[0] === localFilters.value.singleDate;
      return textMatch && typeMatch && categoryMatch && priorityMatch && singleDateMatch;
    });
  });

  const totalIncomeInPeriod = computed(() => globallyFilteredTransactions.value.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
  const totalExpensesInPeriod = computed(() => globallyFilteredTransactions.value.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));

  const balance = computed(() => {
    const endDate = globalFilters.value.endDate ? new Date(globalFilters.value.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const relevantTransactions = transactions.value.filter(t => new Date(t.created_at).toISOString().split('T')[0] <= endDate);
    const totalIncome = relevantTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = relevantTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return totalIncome - totalExpenses;
  });

  const fetchTransactions = async () => {
    loading.value = true;
    const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching transactions:', error);
    else transactions.value = data || [];
    loading.value = false;
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error('Error fetching categories:', error);
    else categories.value = data || [];
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
    const authStore = useAuthStore();
    if (!authStore.user) return;
    const { data, error } = await supabase.from('transactions').insert([{ ...transaction, user_id: authStore.user.id }]).select().single();
    if (error) console.error('Error adding transaction:', error);
    else if (data) await fetchTransactions();
  };

  const updateTransaction = async (id: number, updates: Partial<Omit<Transaction, 'id' | 'user_id'>>) => {
    const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select().single();
    if (error) console.error('Error updating transaction:', error);
    else if (data) {
      const index = transactions.value.findIndex(t => t.id === id);
      if (index !== -1) transactions.value[index] = data;
      await fetchTransactions();
    }
  };

  const deleteTransaction = async (id: number) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) console.error('Error deleting transaction:', error);
    else transactions.value = transactions.value.filter(t => t.id !== id);
  };

  const addCategory = async (name: string): Promise<Category | null> => {
    const authStore = useAuthStore();
    if (!authStore.user) return null;
    const existingCategory = categories.value.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) return existingCategory;
    const { data, error } = await supabase.from('categories').insert([{ name, user_id: authStore.user.id }]).select().single();
    if (error) {
      console.error('Error adding category:', error);
      return null;
    }
    if (data) {
      categories.value.push(data);
      return data;
    }
    return null;
  };

  return {
    transactions, categories, loading,
    globalFilters, localFilters,
    resetLocalFilters, resetAllFilters,
    globallyFilteredTransactions,
    locallyFilteredTransactions,
    totalIncome: totalIncomeInPeriod,
    totalExpenses: totalExpensesInPeriod,
    balance,
    fetchTransactions, fetchCategories, addTransaction, updateTransaction, deleteTransaction, addCategory,
  };
});
