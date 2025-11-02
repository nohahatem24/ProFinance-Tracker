import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../services/supabase";
import type { User } from "@supabase/supabase-js";
import type { Router } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) throw error;
    user.value = data.user;
  }

  // --- **الإصلاح الجذري والنهائي هنا** ---
  async function register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    // إذا كان هناك خطأ صريح من Supabase، قم بإلقائه
    if (error) {
      throw error;
    }

    // **الحالة الأهم:** إذا لم يكن هناك خطأ، تحقق مما إذا كان المستخدم موجودًا بالفعل
    // (هذا يحدث عندما يكون identity.id موجودًا ولكن user.id غير موجود)
    if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      // هذا يعني أن Supabase تعرف هذا البريد الإلكتروني ولكنه لم ينشئ مستخدمًا جديدًا
      // لأنه ينتظر تأكيد البريد الإلكتروني من محاولة سابقة.
      throw new Error(
        "User already registered. Please check your email to verify or log in."
      );
    }

    // إذا لم يكن أي من الشروط السابقة صحيحًا، فالتسجيل ناجح
    user.value = data.user;
  }

  async function logout(router: Router) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    user.value = null;
    router.push({ name: "login" });
  }

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
