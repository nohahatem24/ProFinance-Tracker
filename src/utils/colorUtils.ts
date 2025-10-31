// src/utils/colorUtils.ts

const PREDEFINED_COLORS: { [key: string]: string } = {
  // يمكنكِ تحديد ألوان ثابتة هنا للفئات الشائعة
  'Food': '#FF6384',
  'Transport': '#36A2EB',
  'Shopping': '#FFCE56',
  'Utilities': '#4BC0C0',
  'Entertainment': '#9966FF',
  'Housing': '#FF9F40',
  // ألوان الأولويات
  'High': '#E74C3C',
  'Medium': '#F39C12',
  'Low': '#2ECC71',
};

const PALETTE = [
  '#1ABC9C', '#3498DB', '#9B59B6', '#E67E22', '#F1C40F',
  '#2980B9', '#8E44AD', '#D35400', '#C0392B', '#BDC3C7'
];

let colorIndex = 0;

// دالة لتوليد لون فريد بناءً على اسم الفئة
function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export function getColor(label: string): string {
  if (PREDEFINED_COLORS[label]) {
    return PREDEFINED_COLORS[label];
  }
  
  // إذا لم يكن اللون محددًا مسبقًا، نستخدم طريقة أخرى
  // لتجنب الألوان المتشابهة، يمكننا استخدام لوحة ألوان محددة
  const color = PALETTE[colorIndex % PALETTE.length];
  colorIndex++;
  // أو نستخدم دالة التجزئة لتوليد لون فريد
  // return generateColorFromString(label);
  return color;
}
