<template>
  <div class="card-base p-3">
    <!-- Type badge + content -->
    <div class="flex items-start gap-2">
      <span
        class="px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0"
        :class="typeColors[note.type]"
      >
        {{ typeLabels[note.type] }}
      </span>
      <p class="text-sm text-macaron-text leading-relaxed flex-1">{{ note.content }}</p>
    </div>

    <!-- AI response for questions -->
    <div v-if="note.type === 'question' && note.aiResponse" class="mt-2 p-2.5 rounded-lg bg-macaron-cta/5 border border-macaron-cta/10">
      <p class="text-xs text-macaron-text-secondary flex items-center gap-1 mb-1">
        <Icon name="lucide:bot" class="w-3 h-3 text-macaron-cta" />
        AI 回答
      </p>
      <p class="text-sm text-macaron-text leading-relaxed whitespace-pre-wrap">{{ note.aiResponse }}</p>
    </div>

    <!-- Loading for questions without response -->
    <div v-if="note.type === 'question' && !note.aiResponse" class="mt-2 flex items-center gap-2 text-xs text-macaron-text-secondary">
      <span class="w-3 h-3 border-2 border-macaron-cta/30 border-t-macaron-cta rounded-full animate-spin" />
      等待 AI 回答...
    </div>

    <!-- Timestamp -->
    <p class="text-[10px] text-macaron-text-secondary/50 mt-1.5">{{ formatTime(note.createdAt) }}</p>
  </div>
</template>

<script setup lang="ts">
import type { ResearchNote } from '~/types/research'

defineProps<{ note: ResearchNote }>()

defineEmits<{
  askQuestion: [question: string]
}>()

const typeLabels: Record<string, string> = {
  passage: '摘录',
  question: '提问',
  insight: '洞见',
  confusion: '困惑',
  connection: '关联',
}

const typeColors: Record<string, string> = {
  passage: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  question: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  insight: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  confusion: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  connection: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
