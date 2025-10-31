import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../services/supabase";
import type { User } from "@supabase/supabase-js";
import type { Router } from "vue-router"; // <-- 1. استيراد نوع Router

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);

  // دالة لتسجيل الدخول مع تحديد الأنواع
  async function login(email: string, password: string) {
    // <-- 2. تحديد الأنواع
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) throw error;
    user.value = data.user;
  }

  // دالة لإنشاء حساب جديد مع تحديد الأنواع
  async function register(email: string, password: string) {
    // <-- 3. تحديد الأنواع
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) throw error;
    user.value = data.user;
  }

  // دالة لتسجيل الخروج مع تحديد النوع واستخدام الـ router
  async function logout(router: Router) {
    // <-- 4. تعديل دالة logout
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    user.value = null;
    router.push({ name: "login" }); // الانتقال إلى صفحة الدخول
  }

  // دالة للتحقق من حالة المستخدم عند تحميل التطبيق
  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    user.value = data.user;
  }

  return {
    user,
    login,
    register,
    logout,
    checkUser,
  };
});
