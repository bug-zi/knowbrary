<template>
  <div class="card-base p-3">
    <div class="flex items-start gap-2 mb-2">
      <span class="w-5 h-5 rounded-full bg-macaron-cta/10 text-macaron-cta text-xs font-medium flex items-center justify-center shrink-0">
        {{ index + 1 }}
      </span>
      <p class="text-sm font-medium text-macaron-text leading-relaxed">{{ question.question }}</p>
    </div>

    <!-- Not answered yet -->
    <div v-if="!question.userAnswer" class="pl-7">
      <!-- Hint -->
      <button
        v-if="!showHint"
        class="text-xs text-macaron-text-secondary hover:text-macaron-cta bg-transparent border-none cursor-pointer mb-2"
        @click="showHint = true"
      >
        需要提示？
      </button>
      <p v-else class="text-xs text-macaron-cta/70 mb-2">{{ question.hint }}</p>

      <!-- Confidence selector -->
      <div class="flex gap-2 mb-2">
        <button
          v-for="c in confidences"
          :key="c.value"
          class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border-none cursor-pointer"
          :class="selectedConfidence === c.value
            ? 'bg-macaron-cta text-white'
            : 'bg-macaron-badge-bg text-macaron-text-secondary'"
          @click="selectedConfidence = c.value"
        >
          {{ c.label }}
        </button>
      </div>

      <!-- Answer input -->
      <textarea
        v-model="answer"
        placeholder="用自己的话回答..."
        rows="3"
        class="w-full px-3 py-2 rounded-xl border border-macaron-border bg-macaron-bg text-sm text-macaron-text placeholder:text-macaron-text-secondary/50 focus:outline-none focus:border-macaron-cta transition-colors resize-none"
      />

      <button
        class="mt-2 px-4 py-1.5 rounded-lg bg-macaron-cta text-white text-xs font-medium hover:bg-macaron-cta-hover transition-colors border-none cursor-pointer disabled:opacity-40"
        :disabled="!answer.trim() || isSubmitting"
        @click="handleSubmit"
      >
        <span v-if="isSubmitting" class="flex items-center gap-1.5">
          <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          分析中
        </span>
        <span v-else>提交回答</span>
      </button>
    </div>

    <!-- Answered -->
    <div v-else class="pl-7">
      <!-- User answer -->
      <div class="p-2.5 rounded-lg bg-macaron-badge-bg/50 mb-2">
        <p class="text-xs text-macaron-text-secondary mb-0.5 flex items-center gap-1">
          <Icon name="lucide:user" class="w-3 h-3" />
          你的回答
          <span
            class="px-1.5 py-0.5 rounded text-[10px] ml-1"
            :class="confidenceColors[question.userConfidence]"
          >
            {{ confidenceLabels[question.userConfidence] }}
          </span>
        </p>
        <p class="text-sm text-macaron-text">{{ question.userAnswer }}</p>
      </div>

      <!-- Model answer -->
      <div class="p-2.5 rounded-lg bg-macaron-cta/5 border border-macaron-cta/10 mb-2">
        <p class="text-xs text-macaron-cta mb-0.5 flex items-center gap-1">
          <Icon name="lucide:bot" class="w-3 h-3" />
          参考答案
        </p>
        <p class="text-sm text-macaron-text leading-relaxed whitespace-pre-wrap">{{ question.suggestedAnswer }}</p>
      </div>

      <!-- Gap analysis -->
      <div v-if="question.gapAnalysis" class="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
        <p class="text-xs text-amber-600 dark:text-amber-400 mb-0.5 flex items-center gap-1">
          <Icon name="lucide:eye" class="w-3 h-3" />
          差距分析
        </p>
        <p class="text-sm text-macaron-text leading-relaxed">{{ question.gapAnalysis }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SelfTestQuestion } from '~/types/research'

const props = defineProps<{
  question: SelfTestQuestion
  index: number
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  submit: [data: { answer: string; confidence: 'sure' | 'rough' | 'lost' }]
}>()

const answer = ref('')
const selectedConfidence = ref<'sure' | 'rough' | 'lost'>('rough')
const showHint = ref(false)

const confidences = [
  { value: 'sure' as const, label: '很确定' },
  { value: 'rough' as const, label: '大致了解' },
  { value: 'lost' as const, label: '不太确定' },
]

const confidenceLabels: Record<string, string> = {
  sure: '很确定',
  rough: '大致了解',
  lost: '不太确定',
}

const confidenceColors: Record<string, string> = {
  sure: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  rough: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  lost: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

function handleSubmit() {
  if (!answer.value.trim()) return
  emit('submit', { answer: answer.value.trim(), confidence: selectedConfidence.value })
}
</script>
