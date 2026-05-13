<template>
  <div class="text-center py-8 px-4">
    <div class="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
      <Icon name="lucide:check-circle" class="w-7 h-7 text-green-500" />
    </div>
    <h3 class="text-lg font-semibold text-macaron-text mb-1">研究完成</h3>
    <p class="text-sm text-macaron-text-secondary mb-4 max-w-xs mx-auto">
      你已经完成了「{{ topic }}」的深度研究
    </p>

    <div class="flex gap-3 justify-center">
      <button
        class="px-5 py-2.5 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors border-none cursor-pointer"
        @click="$emit('back')"
      >
        返回项目列表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ topic: string }>()
defineEmits<{ back: [] }>()
</script>
