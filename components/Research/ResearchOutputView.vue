<template>
  <div>
    <!-- Not generated yet -->
    <div v-if="!step.data" class="text-center py-8">
      <div class="w-12 h-12 rounded-xl bg-macaron-badge-bg flex items-center justify-center mx-auto mb-3">
        <Icon name="lucide:file-text" class="w-6 h-6 text-macaron-cta" />
      </div>
      <h3 class="text-sm font-semibold text-macaron-text mb-1">整理你的研究成果</h3>
      <p class="text-xs text-macaron-text-secondary mb-4 max-w-xs mx-auto">
        选择一种格式，AI 帮你把研究笔记转化为结构化输出
      </p>

      <!-- Format selector -->
      <div class="grid grid-cols-2 gap-2 max-w-xs mx-auto mb-4">
        <button
          v-for="fmt in formats"
          :key="fmt.value"
          class="p-3 rounded-xl border transition-all text-center cursor-pointer"
          :class="selectedFormat === fmt.value
            ? 'border-macaron-cta bg-macaron-cta/5'
            : 'border-macaron-border bg-macaron-card hover:border-macaron-cta/30'"
          @click="selectedFormat = fmt.value"
        >
          <Icon :name="fmt.icon" class="w-5 h-5 mx-auto mb-1" :class="selectedFormat === fmt.value ? 'text-macaron-cta' : 'text-macaron-text-secondary'" />
          <span class="text-xs font-medium" :class="selectedFormat === fmt.value ? 'text-macaron-cta' : 'text-macaron-text'">{{ fmt.label }}</span>
        </button>
      </div>

      <button
        class="px-5 py-2.5 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors border-none cursor-pointer disabled:opacity-40"
        :disabled="isGenerating"
        @click="$emit('generate', selectedFormat)"
      >
        <span v-if="isGenerating" class="flex items-center gap-2">
          <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          正在生成...
        </span>
        <span v-else>生成 {{ formatLabels[selectedFormat] }}</span>
      </button>
    </div>

    <!-- Output result -->
    <div v-else>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-macaron-text">{{ output.title }}</h3>
        <div class="flex items-center gap-2">
          <button
            class="text-xs text-macaron-cta hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
            @click="handleCopy"
          >
            <Icon name="lucide:copy" class="w-3 h-3" />
            复制
          </button>
          <button
            class="text-xs text-macaron-text-secondary hover:text-macaron-cta bg-transparent border-none cursor-pointer"
            @click="showFormatSelector = true"
          >
            更换格式
          </button>
        </div>
      </div>

      <!-- Sections -->
      <div class="space-y-4">
        <div v-for="section in output.sections" :key="section.heading" class="card-base p-3">
          <h4 class="text-sm font-semibold text-macaron-text mb-2">{{ section.heading }}</h4>
          <div class="text-sm text-macaron-text leading-relaxed whitespace-pre-wrap">{{ section.content }}</div>
          <div v-if="section.keyPoints?.length" class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="point in section.keyPoints"
              :key="point"
              class="px-2 py-0.5 rounded bg-macaron-badge-bg text-xs text-macaron-text-secondary"
            >
              {{ point }}
            </span>
          </div>
        </div>
      </div>

      <p class="text-xs text-macaron-text-secondary/50 mt-3 text-center">
        约 {{ output.totalWordCount }} 字
      </p>

      <!-- Format selector modal -->
      <div v-if="showFormatSelector" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="showFormatSelector = false">
        <div class="bg-macaron-card rounded-2xl p-4 mx-4 max-w-sm w-full shadow-xl border border-macaron-border">
          <h3 class="text-sm font-semibold text-macaron-text mb-3">选择新格式</h3>
          <div class="grid grid-cols-2 gap-2 mb-3">
            <button
              v-for="fmt in formats"
              :key="fmt.value"
              class="p-3 rounded-xl border transition-all text-center cursor-pointer"
              :class="selectedFormat === fmt.value
                ? 'border-macaron-cta bg-macaron-cta/5'
                : 'border-macaron-border bg-macaron-card hover:border-macaron-cta/30'"
              @click="selectedFormat = fmt.value"
            >
              <Icon :name="fmt.icon" class="w-5 h-5 mx-auto mb-1 text-macaron-text-secondary" />
              <span class="text-xs font-medium text-macaron-text">{{ fmt.label }}</span>
            </button>
          </div>
          <button
            class="w-full py-2 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors border-none cursor-pointer disabled:opacity-40"
            :disabled="isGenerating"
            @click="$emit('generate', selectedFormat); showFormatSelector = false"
          >
            重新生成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResearchStep, ResearchOutput as OutputType, OutputFormat } from '~/types/research'

const props = defineProps<{
  step: ResearchStep
  isGenerating: boolean
}>()

defineEmits<{ generate: [format: OutputFormat] }>()

const output = computed(() => props.step.data as OutputType)
const selectedFormat = ref<OutputFormat>('article')
const showFormatSelector = ref(false)

const formats: { value: OutputFormat; label: string; icon: string }[] = [
  { value: 'article', label: '研究文章', icon: 'lucide:file-text' },
  { value: 'outline', label: '结构大纲', icon: 'lucide:list' },
  { value: 'mindmap', label: '思维导图', icon: 'lucide:git-branch' },
  { value: 'keytakeaways', label: '核心要点', icon: 'lucide:bookmark' },
]

const formatLabels: Record<OutputFormat, string> = {
  article: '研究文章',
  outline: '结构大纲',
  mindmap: '思维导图',
  keytakeaways: '核心要点',
}

function handleCopy() {
  if (!output.value) return
  const text = output.value.sections
    .map(s => `## ${s.heading}\n\n${s.content}`)
    .join('\n\n')
  navigator.clipboard.writeText(text)
}
</script>
