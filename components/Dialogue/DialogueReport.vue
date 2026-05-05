<template>
  <div class="flex flex-col h-full">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-macaron-border bg-macaron-bg/80 backdrop-blur-sm shrink-0">
      <button
        class="flex items-center gap-1.5 text-sm text-macaron-text-secondary hover:text-macaron-cta transition-colors bg-transparent border-none cursor-pointer"
        @click="$emit('back')"
      >
        <Icon name="lucide:chevron-left" class="w-4 h-4" />
        返回
      </button>
      <h2 class="text-sm font-medium text-macaron-text">对话报告</h2>
      <div class="w-16" />
    </div>

    <!-- Report content -->
    <div v-if="report" class="flex-1 overflow-y-auto px-4 py-5 space-y-6">
      <!-- Key themes -->
      <section>
        <h3 class="text-xs font-medium text-macaron-text-secondary uppercase tracking-wider mb-3">核心主题</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="theme in report.keyThemes"
            :key="theme"
            class="px-3 py-1.5 rounded-full text-xs font-medium bg-macaron-badge-bg text-macaron-text-secondary"
          >
            {{ theme }}
          </span>
        </div>
      </section>

      <!-- Emotional journey -->
      <section class="border-l-2 border-macaron-cta/30 pl-4">
        <h3 class="text-xs font-medium text-macaron-text-secondary uppercase tracking-wider mb-2">情感轨迹</h3>
        <p class="text-sm text-macaron-text leading-relaxed">{{ report.emotionalJourney }}</p>
      </section>

      <!-- Insights -->
      <section>
        <h3 class="text-xs font-medium text-macaron-text-secondary uppercase tracking-wider mb-3">深层洞察</h3>
        <div class="space-y-3">
          <div
            v-for="insight in report.insights"
            :key="insight.title"
            class="card-base p-4"
          >
            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-lg bg-macaron-cta/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="lucide:lightbulb" class="w-3.5 h-3.5 text-macaron-cta" />
              </div>
              <div>
                <h4 class="text-sm font-medium text-macaron-text mb-1">{{ insight.title }}</h4>
                <p class="text-xs text-macaron-text-secondary leading-relaxed">{{ insight.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Suggestions -->
      <section>
        <h3 class="text-xs font-medium text-macaron-text-secondary uppercase tracking-wider mb-3">行动建议</h3>
        <div class="space-y-2.5">
          <div
            v-for="sug in report.suggestions"
            :key="sug.title"
            class="flex items-start gap-3 p-3 rounded-xl bg-macaron-surface-alt"
          >
            <span
              class="px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 mt-0.5"
              :class="{
                'bg-green-100 text-green-700': sug.difficulty === 'easy',
                'bg-amber-100 text-amber-700': sug.difficulty === 'moderate',
                'bg-blue-100 text-blue-700': sug.difficulty === 'ongoing',
              }"
            >
              {{ difficultyLabel(sug.difficulty) }}
            </span>
            <div>
              <h4 class="text-sm font-medium text-macaron-text mb-0.5">{{ sug.title }}</h4>
              <p class="text-xs text-macaron-text-secondary leading-relaxed">{{ sug.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Affirmations -->
      <section>
        <h3 class="text-xs font-medium text-macaron-text-secondary uppercase tracking-wider mb-3">给你的话</h3>
        <div class="space-y-2.5">
          <div
            v-for="aff in report.affirmations"
            :key="aff"
            class="p-4 rounded-xl bg-macaron-cta/5 border border-macaron-cta/10"
          >
            <p class="text-sm text-macaron-text leading-relaxed italic">"{{ aff }}"</p>
          </div>
        </div>
      </section>

      <!-- Closing thought -->
      <section class="pb-6">
        <div class="text-center py-6 px-4">
          <Icon name="lucide:sparkles" class="w-5 h-5 text-macaron-cta mx-auto mb-3" />
          <p class="text-base text-macaron-text leading-relaxed font-medium">{{ report.closingThought }}</p>
        </div>
      </section>
    </div>

    <!-- Loading state -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="flex gap-1 justify-center mb-3">
          <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 0ms" />
          <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 150ms" />
          <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 300ms" />
        </div>
        <p class="text-sm text-macaron-text-secondary">正在回顾我们的对话...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DialogueReport } from '~/types/dialogue'

defineProps<{
  report: DialogueReport | null
}>()

defineEmits<{
  back: []
}>()

function difficultyLabel(d: string): string {
  const map: Record<string, string> = {
    easy: '简单',
    moderate: '中等',
    ongoing: '持续',
  }
  return map[d] || d
}
</script>
