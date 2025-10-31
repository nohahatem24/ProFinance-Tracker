// في src/types/index.ts

export interface Category {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  created_at: string;
  description: string;
  amount: number;
  type: "income" | "expense"; // النوع إما دخل أو مصروف
  category_id: number | null;
  user_id: string;
  // قد نضيف بيانات الفئة هنا لاحقًا
  categories?: Category | null;
  priority: 'High' | 'Medium' | 'Low' | null;
}
