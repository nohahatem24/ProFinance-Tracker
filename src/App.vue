<script setup lang="ts">
import { useThemeStore } from "./stores/themeStore";

// Initialize theme store
const themeStore = useThemeStore();
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <router-view></router-view>
  </div>
</template>
