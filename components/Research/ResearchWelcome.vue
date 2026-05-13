<template>
  <div class="px-4 pt-6 pb-4">
    <div class="text-center mb-6">
      <div class="w-14 h-14 rounded-2xl bg-macaron-badge-bg flex items-center justify-center mx-auto mb-3">
        <Icon name="lucide:eye" class="w-7 h-7 text-macaron-cta" />
      </div>
      <h2 class="text-lg font-semibold text-macaron-text mb-1">想深入研究什么？</h2>
      <p class="text-sm text-macaron-text-secondary">选一个你完全不了解的领域，用五步法快速建立认知框架</p>
    </div>

    <div class="card-base p-4">
      <div class="space-y-3">
        <div>
          <label class="text-xs font-medium text-macaron-text-secondary mb-1 block">研究主题</label>
          <input
            v-model="topic"
            type="text"
            placeholder="比如：量子计算、行为经济学、日本战国史..."
            class="w-full px-3 py-2.5 rounded-xl border border-macaron-border bg-macaron-bg text-sm text-macaron-text placeholder:text-macaron-text-secondary/50 focus:outline-none focus:border-macaron-cta transition-colors"
            @keydown.enter="handleStart"
          />
        </div>
        <div>
          <label class="text-xs font-medium text-macaron-text-secondary mb-1 block">补充说明（可选）</label>
          <textarea
            v-model="description"
            placeholder="你的背景、想了解的具体方向、为什么想研究这个..."
            rows="3"
            class="w-full px-3 py-2.5 rounded-xl border border-macaron-border bg-macaron-bg text-sm text-macaron-text placeholder:text-macaron-text-secondary/50 focus:outline-none focus:border-macaron-cta transition-colors resize-none"
          />
        </div>
        <button
          class="w-full py-2.5 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!topic.trim()"
          @click="handleStart"
        >
          开始研究
        </button>
      </div>
    </div>

    <!-- Quick tips -->
    <div class="mt-4 p-3 rounded-xl bg-macaron-badge-bg/50">
      <h4 class="text-xs font-medium text-macaron-text-secondary mb-2 flex items-center gap-1.5">
        <Icon name="lucide:lightbulb" class="w-3.5 h-3.5" />
        洞察五步法
      </h4>
      <div class="grid grid-cols-5 gap-2 text-center">
        <div v-for="step in steps" :key="step.stepId" class="flex flex-col items-center gap-1">
          <Icon :name="step.icon" class="w-4 h-4 text-macaron-cta/70" />
          <span class="text-[10px] text-macaron-text-secondary">{{ step.shortLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RESEARCH_STEPS } from '~/types/research'

const emit = defineEmits<{
  start: [topic: string, description: string]
}>()

const topic = ref('')
const description = ref('')

const steps = RESEARCH_STEPS.map(s => ({
  ...s,
  shortLabel: s.label.replace('AI ', '').replace('知不知', '检验'),
}))

function handleStart() {
  if (!topic.value.trim()) return
  emit('start', topic.value.trim(), description.value.trim())
  topic.value = ''
  description.value = ''
}
</script>
