import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../services/supabase";
import type { User } from "@supabase/supabase-js";
import type { Router } from "vue-router"; // <-- **الإصلاح هنا**

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

  async function register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) throw error;
    user.value = data.user;
  }

  // **الإصلاح هنا: تحديد نوع 'router'**
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
