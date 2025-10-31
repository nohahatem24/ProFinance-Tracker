import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import DashboardView from "../views/DashboardView.vue"; // 1. استيراد الصفحة الجديدة

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    // 2. إضافة مسار لوحة التحكم مع علامة الحماية
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: { requiresAuth: true }, // <-- هذه هي العلامة المهمة
    },
    {
      path: "/",
      redirect: "/dashboard", // الآن الصفحة الرئيسية هي لوحة التحكم
    },
  ],
});
// ... (بعد تعريف const router = createRouter({ ... });)

// 3. إنشاء الـ Guard
import { useAuthStore } from "../stores/authStore";

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // تحقق من حالة المستخدم (خاصة عند تحديث الصفحة)
  // إذا لم يكن المستخدم معروفًا بعد، حاول جلبه من Supabase
  if (authStore.user === null) {
    await authStore.checkUser();
  }

  // to.meta.requiresAuth -> هل المسار القادم يتطلب تسجيل دخول؟
  // !authStore.user -> هل المستخدم غير مسجل؟
  if (to.meta.requiresAuth && !authStore.user) {
    // إذا كان كذلك، أعد توجيهه إلى صفحة الدخول
    next({ name: "login" });
  } else {
    // وإلا، اسمح له بالمرور
    next();
  }
});

// export default router;

export default router;
