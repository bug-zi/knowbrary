<template>
  <div class="rounded-2xl border border-macaron-border/50 bg-macaron-card p-4">
    <div class="flex items-center gap-2 mb-3">
      <Icon name="lucide:layers" class="w-4 h-4 text-macaron-cta" />
      <span class="text-sm font-semibold text-macaron-text">学习进度</span>
      <span class="text-xs text-macaron-text-secondary ml-auto">
        当前阶段：{{ tierLabel[status.currentTier] }}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <!-- Beginner tier -->
      <div class="text-center">
        <div class="flex items-center justify-center gap-1 mb-1.5">
          <Icon name="lucide:lightbulb" class="w-3.5 h-3.5 text-amber-500" />
          <span class="text-xs font-medium text-macaron-text">入门</span>
        </div>
        <div class="h-2 bg-macaron-border/40 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full bg-amber-400 transition-all duration-500 ease-out"
            :style="{ width: `${beginnerPercent}%` }"
          />
        </div>
        <div class="text-[10px] text-macaron-text-secondary mt-1">
          {{ status.beginnerCompleted }}/{{ status.beginnerTarget }}
        </div>
      </div>

      <!-- Intermediate tier -->
      <div class="text-center transition-opacity duration-300" :class="{ 'opacity-40': !status.intermediateUnlocked }">
        <div class="flex items-center justify-center gap-1 mb-1.5">
          <Icon :name="status.intermediateUnlocked ? 'lucide:microscope' : 'lucide:lock'" class="w-3.5 h-3.5" :class="status.intermediateUnlocked ? 'text-blue-500' : 'text-macaron-muted'" />
          <span class="text-xs font-medium" :class="status.intermediateUnlocked ? 'text-macaron-text' : 'text-macaron-muted'">进阶</span>
        </div>
        <div class="h-2 bg-macaron-border/40 rounded-full overflow-hidden">
          <div
            v-if="status.intermediateUnlocked"
            class="h-full rounded-full bg-blue-400 transition-all duration-500 ease-out"
            :style="{ width: `${intermediatePercent}%` }"
          />
        </div>
        <div class="text-[10px] mt-1" :class="status.intermediateUnlocked ? 'text-macaron-text-secondary' : 'text-macaron-muted'">
          {{ status.intermediateUnlocked ? `${status.intermediateCompleted}/${status.intermediateTarget}` : intermediateHint }}
        </div>
      </div>

      <!-- Advanced tier -->
      <div class="text-center transition-opacity duration-300" :class="{ 'opacity-40': !status.advancedUnlocked }">
        <div class="flex items-center justify-center gap-1 mb-1.5">
          <Icon :name="status.advancedUnlocked ? 'lucide:bar-chart-3' : 'lucide:lock'" class="w-3.5 h-3.5" :class="status.advancedUnlocked ? 'text-purple-500' : 'text-macaron-muted'" />
          <span class="text-xs font-medium" :class="status.advancedUnlocked ? 'text-macaron-text' : 'text-macaron-muted'">专业</span>
        </div>
        <div class="h-2 bg-macaron-border/40 rounded-full overflow-hidden">
          <div
            v-if="status.advancedUnlocked"
            class="h-full rounded-full bg-purple-400 transition-all duration-500 ease-out"
            :style="{ width: `${advancedPercent}%` }"
          />
        </div>
        <div class="text-[10px] mt-1" :class="status.advancedUnlocked ? 'text-macaron-text-secondary' : 'text-macaron-muted'">
          {{ status.advancedUnlocked ? `${status.advancedCompleted}张已学` : advancedHint }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TierStatus, TierLevel } from '~/types/domain-tiers'

const props = defineProps<{
  status: TierStatus
  intermediateHint: string
  advancedHint: string
}>()

const tierLabel: Record<TierLevel, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '专业',
}

const beginnerPercent = computed(() =>
  props.status.beginnerTarget > 0
    ? Math.min(100, Math.round((props.status.beginnerCompleted / props.status.beginnerTarget) * 100))
    : 0,
)

const intermediatePercent = computed(() =>
  props.status.intermediateTarget > 0
    ? Math.min(100, Math.round((props.status.intermediateCompleted / props.status.intermediateTarget) * 100))
    : 0,
)

const advancedPercent = computed(() =>
  props.status.advancedCompleted > 0 ? 100 : 0,
)
</script>
