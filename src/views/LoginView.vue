<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

import lightLogo from "../assets/Plightmodelogo.png";
import darkLogo from "../assets/Pnightmodelogo.png";

const { t, locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const errorMessage = ref<string | null>(null);
const showPassword = ref(false);

const rtlLocales = ["ar", "he", "fa", "ur"];
const isRtl = computed(() => rtlLocales.includes(locale.value));

const handleLogin = async () => {
  errorMessage.value = null;
  try {
    await authStore.login(email.value, password.value);
    router.push("/dashboard");
  } catch (error: any) {
    errorMessage.value = error.message || "An unexpected error occurred.";
  }
};
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      
      <!-- ✨ تعديل: القسم الداكن أصبح الآن هو الأول في الكود -->
      <div class="hidden lg:flex flex-col justify-center items-center bg-gray-800 text-white p-12">
        <div class="text-center">
          <img :src="darkLogo" alt="Dark Logo" class="h-auto w-80 mx-auto mb-10"/>
          <p class="mt-4 text-xl font-medium text-gray-300">{{ t("app_subtitle") }}</p>
        </div>
      </div>

      <!-- القسم الثاني: الفورم -->
      <!-- ✨ تعديل: تم حذف كلاس الترتيب لأنه لم يعد ضرورياً -->
      <div class="flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
        <div class="w-full max-w-md">
          
          <div class="lg:hidden mb-8 text-center">
            <img :src="lightLogo" alt="Logo" class="h-30 w-60 mx-auto mb-20" />
          </div>

          <h2 class="text-3xl font-bold text-gray-900 text-center">
            {{ t("welcome_back") }}
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            {{ t("or") }}
            <RouterLink to="/register" class="font-medium text-indigo-600 hover:underline">
              {{ t("sign_up_for_new_account") }}
            </RouterLink>
          </p>

          <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
            <div>
              <label for="email" class="sr-only">{{ t("email") }}</label>
              <input v-model="email" id="email" type="email" required class="auth-input" :placeholder="t('email')"/>
            </div>
            <div class="relative">
              <label for="password" class="sr-only">{{ t("password") }}</label>
              <input v-model="password" id="password" :type="showPassword ? 'text' : 'password'" required class="auth-input" :placeholder="t('password')"/>
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-2 flex items-center rtl:left-0 rtl:right-auto ltr:pr-3 rtl:pl-3">
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div v-if="errorMessage" class="rounded-md bg-red-500/10 p-3">
              <p class="text-sm text-red-500">{{ errorMessage }}</p>
            </div>
            <div>
              <button type="submit" class="auth-button">{{ t("sign_in") }}</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="postcss">
.auth-input {
  @apply block w-full px-4 py-3 rounded-md border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6;
}
.auth-button {
  @apply w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105;
}
</style>
