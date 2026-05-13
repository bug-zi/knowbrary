<template>
  <div class="card-base p-3.5 cursor-pointer hover:border-macaron-cta/30 transition-all group" @click="$emit('select')">
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-macaron-text truncate">{{ project.topic }}</h4>
        <p class="text-xs text-macaron-text-secondary mt-0.5">
          {{ formatDate(project.createdAt) }}
          <span v-if="project.status === 'completed'" class="text-green-500 ml-1">已完成</span>
        </p>
      </div>
      <button
        class="w-6 h-6 flex items-center justify-center rounded-full text-macaron-text-secondary/40 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100"
        @click.stop="$emit('delete')"
      >
        <Icon name="lucide:trash-2" class="w-3 h-3" />
      </button>
    </div>
    <!-- Step dots -->
    <div class="flex gap-1.5 mt-2.5">
      <div
        v-for="step in project.steps"
        :key="step.stepId"
        class="w-5 h-1.5 rounded-full transition-colors"
        :class="step.status === 'completed' ? 'bg-macaron-cta' : step.status === 'active' ? 'bg-macaron-cta/40' : 'bg-macaron-border'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResearchProject } from '~/types/research'

defineProps<{ project: ResearchProject }>()
defineEmits<{ select: []; delete: [] }>()

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
