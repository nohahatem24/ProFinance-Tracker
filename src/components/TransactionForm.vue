<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useTransactionStore } from "../stores/transactionStore";
import type { Transaction, Category } from "../types";
import { useI18n } from "vue-i18n";

// --- 1. إعدادات الترجمة والاتجاه ---
const { t, locale } = useI18n();
const rtlLocales = ["ar", "he", "fa", "ur", "ps", "yi", "sd"];
const isRtl = computed(() => rtlLocales.includes(locale.value));

const props = defineProps<{
  transactionToEdit: Transaction | null;
}>();
const emit = defineEmits(["clear-edit"]);

const transactionStore = useTransactionStore();

// --- 2. تعريف الحقول باستخدام ref ---
const getTodayLocalISO = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split("T")[0];
};

const description = ref("");
const amount = ref<number | null>(null);
const type = ref<"income" | "expense">("expense");
const categoryId = ref<number | null>(null);
const transactionDate = ref(getTodayLocalISO());
// ✨ تعديل: استخدام حروف صغيرة لتتوافق مع قيم <option> ومفاتيح الترجمة
const priority = ref<"high" | "medium" | "low" | null>(null);
const newCategoryName = ref("");

// --- 3. دوال مساعدة لإدارة الفورم ---
const resetFormFields = () => {
  description.value = "";
  amount.value = null;
  type.value = "expense";
  categoryId.value = null;
  priority.value = null;
  transactionDate.value = getTodayLocalISO();
  newCategoryName.value = "";
};

const resetForm = () => {
  resetFormFields();
  emit("clear-edit");
};

// --- 4. Computed Properties ---
const othersCategoryId = computed(() => {
  // ✨ تعديل: البحث باستخدام مفتاح الترجمة لضمان الموثوقية
  const othersKey = "others";
  const othersCategory = transactionStore.categories.find(
    (c: Category) => c.name.toLowerCase() === othersKey
  );
  return othersCategory ? othersCategory.id : null;
});

const showNewCategoryInput = computed(
  () => categoryId.value === othersCategoryId.value
);

const isEditing = computed(() => !!props.transactionToEdit);

// --- 5. مراقبة التغييرات لملء الفورم عند التعديل ---
watch(
  () => props.transactionToEdit,
  (newVal) => {
    if (newVal) {
      description.value = newVal.description;
      amount.value = newVal.amount;
      type.value = newVal.type;
      categoryId.value = newVal.category_id;
      transactionDate.value = new Date(newVal.created_at)
        .toISOString()
        .split("T")[0];
      // ✨ تعديل: التأكد من أن القيمة المحفوظة تتحول إلى حروف صغيرة
      priority.value = newVal.priority
        ? (newVal.priority.toLowerCase() as "high" | "medium" | "low")
        : null;
      newCategoryName.value = "";
    } else {
      // لا تقم بإعادة تعيين الفورم إذا كان المستخدم لا يزال في وضع التعديل
      if (!isEditing.value) {
        resetFormFields();
      }
    }
  },
  { immediate: true }
);

// --- 6. دالة إرسال الفورم ---
const handleSubmit = async () => {
  if (!description.value || !amount.value || amount.value <= 0) {
    alert(t("required_field"));
    return;
  }

  let finalCategoryId = categoryId.value;

  // التعامل مع إضافة فئة جديدة
  if (type.value === "expense" && showNewCategoryInput.value) {
    if (!newCategoryName.value.trim()) {
      alert(t("required_field"));
      return;
    }
    // يجب حفظ الفئة الجديدة كمفتاح (حروف صغيرة)
    const newCatKey = newCategoryName.value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    const newCat = await transactionStore.addCategory(newCatKey);
    if (newCat) {
      finalCategoryId = newCat.id;
    } else {
      alert(t("transaction_failed"));
      return;
    }
  }

  // التحقق من الحقول المطلوبة للمصروفات
  if (type.value === "expense" && !finalCategoryId) {
    alert(t("select_category"));
    return;
  }
  if (type.value === "expense" && !priority.value) {
    alert(t("select_priority"));
    return;
  }

  const isToday = transactionDate.value === getTodayLocalISO();
  const finalDate = isToday ? new Date() : new Date(transactionDate.value);

  const transactionData = {
    description: description.value,
    amount: amount.value,
    type: type.value,
    category_id: type.value === "expense" ? finalCategoryId : null,
    created_at: finalDate.toISOString(),
    // ✨ تعديل: إرسال القيمة بالحروف الصغيرة كما هي
    priority: type.value === "expense" ? priority.value : null,
  };

  if (isEditing.value && props.transactionToEdit) {
    await transactionStore.updateTransaction(
      props.transactionToEdit.id,
      transactionData
    );
  } else {
    await transactionStore.addTransaction(transactionData);
  }

  resetForm();
};
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <h3
      class="text-lg font-medium text-gray-900 dark:text-white mb-6 text-start"
    >
      {{ isEditing ? t("edit_transaction") : t("add_transaction") }}
    </h3>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Type -->
      <div>
        <label
          for="type"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("type") }}</label
        >
        <select v-model="type" id="type" class="mt-1 input-field select-input">
          <option value="expense">{{ t("transaction.type.expense") }}</option>
          <option value="income">{{ t("transaction.type.income") }}</option>
        </select>
      </div>

      <!-- Description -->
      <div>
        <label
          for="description"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("description") }}</label
        >
        <input
          v-model="description"
          id="description"
          type="text"
          required
          class="mt-1 input-field"
          :placeholder="t('description_placeholder')"
        />
      </div>

      <!-- Amount -->
      <div>
        <label
          for="amount"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("amount") }}</label
        >
        <input
          v-model.number="amount"
          id="amount"
          type="number"
          step="0.01"
          required
          class="mt-1 input-field"
          :placeholder="t('amount_placeholder')"
        />
      </div>

      <!-- Category (for expenses) -->
      <div v-if="type === 'expense'">
        <label
          for="category"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("category") }}</label
        >
        <select
          v-model="categoryId"
          id="category"
          class="mt-1 input-field select-input"
        >
          <option :value="null" disabled>{{ t("select_category") }}</option>
          <option
            v-for="category in transactionStore.categories"
            :key="category.id"
            :value="category.id"
          >
            {{ t(category.name.toLowerCase()) }}
          </option>
        </select>
      </div>

      <!-- New Category Input -->
      <div v-if="type === 'expense' && showNewCategoryInput">
        <label
          for="new-category"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("new_category_name") }}</label
        >
        <input
          v-model="newCategoryName"
          id="new-category"
          type="text"
          class="mt-1 input-field"
          :placeholder="t('new_category_placeholder')"
        />
      </div>

      <!-- Priority (for expenses) -->
      <div v-if="type === 'expense'">
        <!-- ✨ تعديل: استخدام t() لترجمة الـ label -->
        <label
          for="priority"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("priority") }}</label
        >
        <select
          v-model="priority"
          id="priority"
          class="mt-1 input-field select-input"
        >
          <option :value="null" disabled>{{ t("select_priority") }}</option>
          <!-- ✨ تعديل: استخدام حروف صغيرة للقيم لتتوافق مع مفاتيح الترجمة -->
          <option value="high">{{ t("priority_levels.high") }}</option>
          <option value="medium">{{ t("priority_levels.medium") }}</option>
          <option value="low">{{ t("priority_levels.low") }}</option>
        </select>
      </div>

      <!-- Date -->
      <div>
        <label
          for="date"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >{{ t("date") }}</label
        >
        <input
          v-model="transactionDate"
          id="date"
          type="date"
          required
          class="mt-1 input-field"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 pt-2">
        <button
          type="submit"
          class="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
        >
          {{ isEditing ? t("update") : t("add") }}
        </button>
        <button
          v-if="isEditing"
          @click.prevent="resetForm"
          type="button"
          class="flex-grow bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
        >
          {{ t("cancel") }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
.input-field {
  @apply block w-full rounded-md border-gray-300 dark:border-gray-600 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6;
}

.select-input {
  @apply appearance-none bg-no-repeat;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-size: 1.5em 1.5em;
}

[dir="ltr"] .select-input {
  background-position: right 0.5rem center;
  @apply pr-10 pl-3;
}

[dir="rtl"] .select-input {
  background-position: left 0.5rem center;
  @apply pl-10 pr-3;
}

[dir="rtl"] .input-field,
[dir="rtl"] label,
[dir="rtl"] h3 {
  @apply text-right;
}
</style>
