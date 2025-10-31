import { createClient } from "@supabase/supabase-js";

// استبدل هذه القيم بالقيم الحقيقية من مشروعك على Supabase
const supabaseUrl = "https://jmspxdhatuyosowodwfc.supabase.co"; // الصق عنوان URL هنا
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptc3B4ZGhhdHV5b3Nvd29kd2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzY1ODEsImV4cCI6MjA3NzI1MjU4MX0.YF5t12vK1ThOJn-KI1gBgV28DJzcaDbWX0oFCagVs5Y"; // الصق مفتاح anon (public) هنا

// إنشاء وتصدير العميل
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
