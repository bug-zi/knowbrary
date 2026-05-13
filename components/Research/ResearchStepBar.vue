<template>
  <div class="flex items-center justify-center gap-1 py-2 px-4 bg-macaron-bg/50 border-b border-macaron-border/50 shrink-0">
    <template v-for="(step, index) in steps" :key="step.stepId">
      <!-- Step dot -->
      <button
        class="flex flex-col items-center gap-0.5 px-2 py-1 bg-transparent border-none cursor-pointer transition-all rounded-lg"
        :class="{
          'opacity-40 cursor-not-allowed': step.status === 'locked',
          'hover:bg-macaron-badge-bg': step.status !== 'locked',
        }"
        :disabled="step.status === 'locked'"
        @click="step.status !== 'locked' && $emit('select', step.stepId)"
      >
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center transition-all"
          :class="{
            'bg-macaron-cta text-white': step.status === 'completed',
            'border-2 border-macaron-cta text-macaron-cta': step.status === 'active' && currentStepId !== step.stepId,
            'bg-macaron-cta/20 text-macaron-cta ring-2 ring-macaron-cta/30': currentStepId === step.stepId,
            'bg-macaron-border/50 text-macaron-text-secondary/40': step.status === 'locked',
          }"
        >
          <Icon v-if="step.status === 'completed'" name="lucide:check" class="w-3.5 h-3.5" />
          <Icon v-else :name="RESEARCH_STEPS[index].icon" class="w-3.5 h-3.5" />
        </div>
        <span class="text-[9px] font-medium transition-colors" :class="currentStepId === step.stepId ? 'text-macaron-cta' : 'text-macaron-text-secondary'">
          {{ RESEARCH_STEPS[index].label.replace('AI ', '') }}
        </span>
      </button>
      <!-- Connector -->
      <div v-if="index < steps.length - 1" class="w-3 h-px" :class="step.status === 'completed' ? 'bg-macaron-cta' : 'bg-macaron-border'" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ResearchStep, ResearchStepId } from '~/types/research'
import { RESEARCH_STEPS } from '~/types/research'

defineProps<{
  steps: ResearchStep[]
  currentStepId: ResearchStepId
}>()

defineEmits<{ select: [stepId: ResearchStepId] }>()
</script>
