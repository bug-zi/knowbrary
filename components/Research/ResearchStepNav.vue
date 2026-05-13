<template>
  <div class="flex items-center gap-3 px-4 py-3 border-t border-macaron-border bg-macaron-bg/90 shrink-0">
    <button
      class="flex-1 py-2 rounded-xl text-sm font-medium transition-colors border-none cursor-pointer"
      :class="hasPrev
        ? 'bg-macaron-badge-bg text-macaron-text hover:bg-macaron-border/50'
        : 'bg-macaron-badge-bg/30 text-macaron-text-secondary/40 cursor-not-allowed'"
      :disabled="!hasPrev"
      @click="$emit('prev')"
    >
      <Icon name="lucide:chevron-left" class="w-4 h-4 inline-block mr-1" />
      上一步
    </button>
    <div class="text-xs text-macaron-text-secondary font-medium">
      {{ currentStepId }} / 5
    </div>
    <button
      class="flex-1 py-2 rounded-xl text-sm font-medium transition-colors border-none cursor-pointer"
      :class="hasNext
        ? 'bg-macaron-badge-bg text-macaron-text hover:bg-macaron-border/50'
        : 'bg-macaron-badge-bg/30 text-macaron-text-secondary/40 cursor-not-allowed'"
      :disabled="!hasNext"
      @click="$emit('next')"
    >
      下一步
      <Icon name="lucide:chevron-right" class="w-4 h-4 inline-block ml-1" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ResearchStep, ResearchStepId } from '~/types/research'

const props = defineProps<{
  currentStepId: ResearchStepId
  steps: ResearchStep[]
}>()

defineEmits<{ prev: []; next: [] }>()

const hasPrev = computed(() => {
  if (props.currentStepId <= 1) return false
  const prevStep = props.steps.find(s => s.stepId === (props.currentStepId - 1) as ResearchStepId)
  return prevStep?.status !== 'locked'
})

const hasNext = computed(() => {
  if (props.currentStepId >= 5) return false
  const nextStep = props.steps.find(s => s.stepId === (props.currentStepId + 1) as ResearchStepId)
  return nextStep?.status !== 'locked'
})
</script>
