// src/types.ts

export interface Transaction {
  id: number;
  user_id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category_id: number | null;
  created_at: string;
  priority: "High" | "Medium" | "Low" | null;
}

export interface Category {
  id: number;
  user_id: string;
  name: string;
}
