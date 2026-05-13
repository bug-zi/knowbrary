<template>
  <div>
    <!-- Not generated yet -->
    <div v-if="!step.data" class="text-center py-8">
      <div class="w-12 h-12 rounded-xl bg-macaron-badge-bg flex items-center justify-center mx-auto mb-3">
        <Icon name="lucide:help-circle" class="w-6 h-6 text-macaron-cta" />
      </div>
      <h3 class="text-sm font-semibold text-macaron-text mb-1">知不知检验</h3>
      <p class="text-xs text-macaron-text-secondary mb-4 max-w-xs mx-auto">
        AI 会生成 5 道自测题来检验你的理解深度，帮你发现"以为自己懂了但其实没懂"的地方
      </p>
      <button
        class="px-5 py-2.5 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors border-none cursor-pointer disabled:opacity-40"
        :disabled="isGenerating"
        @click="$emit('generate')"
      >
        <span v-if="isGenerating" class="flex items-center gap-2">
          <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          正在出题...
        </span>
        <span v-else>生成自测题</span>
      </button>
    </div>

    <!-- Self-test questions -->
    <div v-else>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-macaron-text">知不知检验</h3>
        <button
          class="text-xs text-macaron-cta hover:underline bg-transparent border-none cursor-pointer"
          :disabled="isGenerating"
          @click="$emit('generate')"
        >
          重新出题
        </button>
      </div>

      <!-- Questions -->
      <div class="space-y-3">
        <ResearchSelfTestQuestion
          v-for="(q, idx) in assessment.questions"
          :key="q.id"
          :question="q"
          :index="idx"
          :is-submitting="submittingId === q.id"
          @submit="handleSubmit(q.id, $event)"
        />
      </div>

      <!-- Summary (show after all questions answered) -->
      <div v-if="allAnswered" class="mt-4 p-4 rounded-xl bg-macaron-cta/5 border border-macaron-cta/20">
        <h4 class="text-sm font-semibold text-macaron-text mb-2">总结</h4>
        <p class="text-sm text-macaron-text leading-relaxed mb-3">{{ assessment.overallGapSummary }}</p>
        <div v-if="assessment.suggestedNextSteps?.length" class="mb-3">
          <p class="text-xs font-medium text-macaron-text-secondary mb-1.5">建议继续学习：</p>
          <ul class="space-y-1">
            <li v-for="step in assessment.suggestedNextSteps" :key="step" class="text-sm text-macaron-text flex items-start gap-1.5">
              <Icon name="lucide:arrow-right" class="w-3.5 h-3.5 text-macaron-cta shrink-0 mt-0.5" />
              {{ step }}
            </li>
          </ul>
        </div>
        <button
          class="w-full py-2.5 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors border-none cursor-pointer"
          @click="$emit('complete')"
        >
          完成这次研究
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResearchStep, SelfAssessment } from '~/types/research'

const props = defineProps<{
  step: ResearchStep
  isGenerating: boolean
}>()

const emit = defineEmits<{
  generate: []
  submit: [questionId: string, answer: string, confidence: 'sure' | 'rough' | 'lost']
  complete: []
}>()

const submittingId = ref<string | null>(null)

const assessment = computed(() => props.step.data as SelfAssessment)

const allAnswered = computed(() => {
  if (!assessment.value?.questions) return false
  return assessment.value.questions.every(q => q.userAnswer)
})

function handleSubmit(questionId: string, data: { answer: string; confidence: 'sure' | 'rough' | 'lost' }) {
  submittingId.value = questionId
  emit('submit', questionId, data.answer, data.confidence)
  // Reset after a delay (parent will update the data)
  setTimeout(() => { submittingId.value = null }, 2000)
}
</script>
