<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="text-center">
      <div class="text-4xl mb-4 animate-pulse">🔄</div>
      <p class="text-macaron-text-secondary">正在登录...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()

watch(user, (newUser) => {
  if (newUser) navigateTo('/profile')
}, { immediate: true })
</script>
