<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useTransactionStore } from "../stores/transactionStore";
import type { Transaction, Category } from "../types";

const props = defineProps<{
  transactionToEdit: Transaction | null;
}>();
const emit = defineEmits(["clear-edit"]);

const transactionStore = useTransactionStore();

const description = ref("");
const amount = ref<number | null>(null);
const type = ref<"income" | "expense">("expense");
const categoryId = ref<number | null>(null);
const transactionDate = ref(new Date().toISOString().split("T")[0]);
const priority = ref<"High" | "Medium" | "Low" | null>(null);
const newCategoryName = ref("");

const resetFormFields = () => {
  description.value = "";
  amount.value = null;
  type.value = "expense";
  categoryId.value = null;
  priority.value = null;
  transactionDate.value = new Date().toISOString().split("T")[0];
  newCategoryName.value = "";
};

const resetForm = () => {
  resetFormFields();
  emit("clear-edit");
};

const othersCategoryId = computed(() => {
  const othersCategory = transactionStore.categories.find(
    (c: Category) => c.name.toLowerCase() === "others"
  );
  return othersCategory ? othersCategory.id : null;
});
const showNewCategoryInput = computed(
  () => categoryId.value === othersCategoryId.value
);
const isEditing = computed(() => !!props.transactionToEdit);

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
      priority.value = newVal.priority || null;
      newCategoryName.value = "";
    } else {
      if (!isEditing.value) {
        resetFormFields();
      }
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (!description.value || !amount.value || amount.value <= 0) {
    alert("Please fill in all fields correctly and ensure amount is positive.");
    return;
  }

  let finalCategoryId = categoryId.value;

  if (type.value === "expense" && showNewCategoryInput.value) {
    if (!newCategoryName.value.trim()) {
      alert("Please enter a name for the new category.");
      return;
    }
    const newCat = await transactionStore.addCategory(
      newCategoryName.value.trim()
    );
    if (newCat) {
      finalCategoryId = newCat.id;
    } else {
      alert("Failed to create new category.");
      return;
    }
  }

  if (type.value === "expense" && !finalCategoryId) {
    alert("Please select or create a category for the expense.");
    return;
  }
  if (type.value === "expense" && !priority.value) {
    alert("Please select a priority for the expense.");
    return;
  }

  const transactionData = {
    description: description.value,
    amount: amount.value,
    type: type.value,
    category_id: type.value === "expense" ? finalCategoryId : null,
    created_at: new Date(transactionDate.value).toISOString(),
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
  <!-- إصلاح: إضافة كلاسات المظهر هنا -->
  <div
    class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors duration-300"
  >
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
      {{ isEditing ? "Edit Transaction" : "Add New Transaction" }}
    </h3>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <!-- إصلاح: تحديث لون الـ label -->
        <label
          for="type"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >Type</label
        >
        <select v-model="type" id="type" class="mt-1 input-field">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label
          for="description"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >Description</label
        >
        <input
          v-model="description"
          id="description"
          type="text"
          required
          class="mt-1 input-field"
          placeholder="e.g., Groceries"
        />
      </div>

      <div>
        <label
          for="amount"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >Amount</label
        >
        <input
          v-model.number="amount"
          id="amount"
          type="number"
          step="0.01"
          required
          class="mt-1 input-field"
          placeholder="e.g., 75.50"
        />
      </div>

      <div v-if="type === 'expense'">
        <label
          for="category"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >Category</label
        >
        <select v-model="categoryId" id="category" class="mt-1 input-field">
          <option :value="null" disabled>Select a category</option>
          <option
            v-for="category in transactionStore.categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div v-if="type === 'expense' && showNewCategoryInput">
        <label
          for="new-category"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >New Category Name</label
        >
        <input
          v-model="newCategoryName"
          id="new-category"
          type="text"
          class="mt-1 input-field"
          placeholder="e.g., Personal Project"
        />
      </div>

      <div v-if="type === 'expense'">
        <label
          for="priority"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >Priority</label
        >
        <select v-model="priority" id="priority" class="mt-1 input-field">
          <option :value="null" disabled>Select priority</option>
          <option value="High">High (Necessary)</option>
          <option value="Medium">Medium (Important)</option>
          <option value="Low">Low (Unnecessary)</option>
        </select>
      </div>

      <div>
        <label
          for="date"
          class="block text-sm font-medium text-gray-600 dark:text-gray-300"
          >Date</label
        >
        <input
          v-model="transactionDate"
          id="date"
          type="date"
          required
          class="mt-1 input-field"
        />
      </div>

      <div class="flex gap-4 pt-2">
        <button
          type="submit"
          class="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
        >
          {{ isEditing ? "Update Transaction" : "Add Transaction" }}
        </button>
        <button
          v-if="isEditing"
          @click.prevent="resetForm"
          type="button"
          class="flex-grow bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
/* إصلاح: تحديث كلاس حقول الإدخال ليدعم المظهرين */
.input-field {
  @apply block w-full rounded-md border-gray-300 dark:border-gray-600 py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6;
}
</style>
