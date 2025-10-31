<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue';
import { useCurrencyStore } from '../stores/currencyStore';

const currencyStore = useCurrencyStore();
const query = ref('');

const filteredCurrencies = computed(() =>
  query.value === ''
    ? currencyStore.allCurrencies
    : currencyStore.allCurrencies.filter((currency) =>
        currency.name.toLowerCase().includes(query.value.toLowerCase()) ||
        currency.code.toLowerCase().includes(query.value.toLowerCase())
      )
);

const onCurrencyChange = (newCurrencyCode: string) => {
  currencyStore.setCurrency(newCurrencyCode);
};
</script>

<template>
  <div class="relative w-36">
    <Combobox :model-value="currencyStore.selectedCurrency" @update:model-value="onCurrencyChange">
      <div class="relative">
        <!-- --- إصلاح: إزالة الخاصية المكررة وترك النسخة الصحيحة فقط --- -->
        <ComboboxInput
          class="w-full rounded-md border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          @change="query = $event.target.value"
          :display-value="(code: any) => code"
        />
        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </ComboboxButton>
      </div>
      <TransitionRoot
        leave="transition ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
        @after-leave="query = ''"
      >
        <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-56 overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <div v-if="filteredCurrencies.length === 0 && query !== ''" class="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-400">
            Nothing found.
          </div>
          <ComboboxOption
            v-for="currency in filteredCurrencies"
            :key="currency.code"
            :value="currency.code"
            v-slot="{ selected, active }"
          >
            <li :class="{ 'bg-indigo-600 text-white': active, 'text-gray-900 dark:text-white': !active }" class="relative cursor-default select-none py-2 pl-10 pr-4">
              <span :class="{ 'font-medium': selected, 'font-normal': !selected }" class="block truncate">
                {{ currency.code }} - {{ currency.name }}
              </span>
              <span v-if="selected" :class="{ 'text-white': active, 'text-indigo-600 dark:text-indigo-400': !active }" class="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
              </span>
            </li>
          </ComboboxOption>
        </ComboboxOptions>
      </TransitionRoot>
    </Combobox>
  </div>
</template>
