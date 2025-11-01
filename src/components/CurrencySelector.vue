<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";
// **تم إصلاح المسار هنا**
import { allCurrencies, type Currency } from "../currencies";

const model = defineModel<string | null>();

const query = ref("");

const filteredCurrencies = computed(() =>
  query.value === ""
    ? allCurrencies
    : allCurrencies.filter((currency: Currency) =>
        `${currency.code} - ${currency.name}`
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(query.value.toLowerCase().replace(/\s+/g, ""))
      )
);
</script>

<template>
  <div class="relative w-full">
    <Combobox v-model="model">
      <div class="relative">
        <ComboboxInput
          class="w-full rounded-md border-0 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-gray-200 focus:ring-0"
          :display-value="
            (code: any) => (typeof code === 'string' ? code.toUpperCase() : '')
          "
          @change="query = $event.target.value"
        />
        <ComboboxButton
          class="absolute inset-y-0 right-0 flex items-center pr-2"
        >
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>
      </div>
      <TransitionRoot
        leave="transition ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
        @after-leave="query = ''"
      >
        <ComboboxOptions
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
        >
          <div
            v-if="filteredCurrencies.length === 0 && query !== ''"
            class="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300"
          >
            Nothing found.
          </div>

          <ComboboxOption
            v-for="currency in filteredCurrencies"
            :key="currency.code"
            :value="currency.code"
            v-slot="{ selected, active }"
          >
            <li
              class="relative cursor-default select-none py-2 pl-10 pr-4"
              :class="{
                'bg-indigo-600 text-white': active,
                'text-gray-900 dark:text-gray-200': !active,
              }"
            >
              <span
                class="block truncate"
                :class="{ 'font-medium': selected, 'font-normal': !selected }"
              >
                {{ currency.code }} - {{ currency.name }}
              </span>
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-3"
                :class="{ 'text-white': active, 'text-indigo-600': !active }"
              >
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ComboboxOption>
        </ComboboxOptions>
      </TransitionRoot>
    </Combobox>
  </div>
</template>
