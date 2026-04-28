<template>
  <div class="min-h-screen">
    <LayoutAppHeader @toggle-search="showSearch = !showSearch" />

    <SearchOverlay v-if="showSearch" @close="showSearch = false" />

    <main class="pb-20 md:pb-8">
      <slot />
    </main>

    <LayoutAppBottomNav />
  </div>
</template>

<script setup lang="ts">
const showSearch = ref(false)
</script>
