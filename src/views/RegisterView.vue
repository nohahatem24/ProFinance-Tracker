<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const errorMessage = ref<string | null>(null);
const showPassword = ref(false);

// --- **الإصلاح الوحيد هنا: تحديث منطق التعامل مع الأخطاء** ---
const handleRegister = async () => {
  errorMessage.value = null;
  try {
    await authStore.register(email.value, password.value);
    // هذه الرسالة ستظهر فقط في حالة النجاح الحقيقي
    alert(
      "Registration successful! Please check your email to verify your account."
    );
    router.push("/login");
  } catch (error: any) {
    // نتحقق من رسالة الخطأ القادمة من Supabase
    if (error.message && error.message.includes("User already registered")) {
      // إذا كان المستخدم مسجلاً بالفعل، نعرض رسالة مخصصة
      errorMessage.value =
        "This email is already registered. Please log in instead.";
    } else {
      // لأي خطأ آخر، نعرض رسالة الخطأ العامة
      errorMessage.value = error.message || "An unexpected error occurred.";
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex transition-colors duration-300">
    <!-- Left Pane (Branding) -->
    <div
      class="hidden lg:flex w-1/2 items-center justify-center bg-gray-800 p-12 text-white relative"
    >
      <div class="text-center">
        <h1 class="text-5xl font-bold tracking-tight mb-6">
          ProFinance Tracker
        </h1>
        <p class="mt-4 text-lg text-gray-300">
          Take control of your finances. Track, analyze, and grow.
        </p>
      </div>
    </div>

    <!-- Right Pane (Form) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <div class="lg:hidden text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">ProFinance Tracker</h1>
        </div>

        <h2 class="text-3xl font-bold text-gray-900 text-center">
          Create Your Account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <RouterLink
            to="/login"
            class="font-medium text-indigo-600 hover:underline"
          >
            log in to your existing account
          </RouterLink>
        </p>

        <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              v-model="email"
              id="email"
              type="email"
              required
              class="auth-input"
              placeholder="Email address"
            />
          </div>
          <!-- Password input with show/hide toggle -->
          <div class="relative">
            <label for="password" class="sr-only">Password</label>
            <input
              v-model="password"
              id="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="auth-input"
              placeholder="Password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
              <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div v-if="errorMessage" class="rounded-md bg-red-500/10 p-3">
            <p class="text-sm text-red-500">
              {{ errorMessage }}
            </p>
          </div>

          <div>
            <button type="submit" class="auth-button">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.auth-input {
  @apply block w-full px-4 py-3 rounded-md border-0 bg-white  text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300  placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6;
}
.auth-button {
  @apply w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105;
}
</style>
