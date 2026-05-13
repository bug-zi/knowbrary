<template>
  <div>
    <!-- Not generated yet -->
    <div v-if="!step.data" class="text-center py-8">
      <div class="w-12 h-12 rounded-xl bg-macaron-badge-bg flex items-center justify-center mx-auto mb-3">
        <Icon name="lucide:scan-eye" class="w-6 h-6 text-macaron-cta" />
      </div>
      <h3 class="text-sm font-semibold text-macaron-text mb-1">全景分析</h3>
      <p class="text-xs text-macaron-text-secondary mb-4 max-w-xs mx-auto">
        AI 会横向审视你收集的所有材料，发现跨领域的模式、矛盾和盲区
      </p>
      <p v-if="notesCount < 3" class="text-xs text-amber-500 mb-3">
        建议至少积累 3 条笔记后再分析（当前 {{ notesCount }} 条）
      </p>
      <button
        class="px-5 py-2.5 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors border-none cursor-pointer disabled:opacity-40"
        :disabled="isGenerating || notesCount < 1"
        @click="$emit('generate')"
      >
        <span v-if="isGenerating" class="flex items-center gap-2">
          <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          正在分析你的材料...
        </span>
        <span v-else>开始分析</span>
      </button>
    </div>

    <!-- Analysis results -->
    <div v-else>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-macaron-text">全景分析</h3>
        <button
          class="text-xs text-macaron-cta hover:underline bg-transparent border-none cursor-pointer"
          :disabled="isGenerating"
          @click="$emit('generate')"
        >
          重新分析
        </button>
      </div>

      <!-- Knowledge map -->
      <div class="card-base p-3 mb-3">
        <h4 class="text-xs font-medium text-macaron-cta mb-1.5 flex items-center gap-1.5">
          <Icon name="lucide:map" class="w-3.5 h-3.5" />
          知识全景
        </h4>
        <p class="text-sm text-macaron-text leading-relaxed">{{ analysis.knowledgeMap }}</p>
      </div>

      <!-- Analysis sections -->
      <div class="space-y-3">
        <div v-for="section in sections" :key="section.key" class="card-base p-3">
          <h4 class="text-xs font-medium mb-2 flex items-center gap-1.5" :class="section.color">
            <Icon :name="section.icon" class="w-3.5 h-3.5" />
            {{ section.title }}
          </h4>
          <ul class="space-y-1.5">
            <li
              v-for="(item, idx) in (analysis as any)[section.key] as string[]"
              :key="idx"
              class="text-sm text-macaron-text leading-relaxed pl-3 border-l-2"
              :class="section.borderColor"
            >
              {{ item }}
            </li>
          </ul>
          <p v-if="!(analysis as any)[section.key]?.length" class="text-xs text-macaron-text-secondary/50">
            未发现
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResearchStep, PanoramicAnalysis } from '~/types/research'

const props = defineProps<{
  step: ResearchStep
  notesCount: number
  isGenerating: boolean
}>()

defineEmits<{ generate: [] }>()

const analysis = computed(() => props.step.data as PanoramicAnalysis)

const sections = [
  { key: 'patterns', title: '发现的模式', icon: 'lucide:repeat', color: 'text-blue-500', borderColor: 'border-blue-300' },
  { key: 'contradictions', title: '矛盾与分歧', icon: 'lucide:swords', color: 'text-red-500', borderColor: 'border-red-300' },
  { key: 'consensusPoints', title: '各方共识', icon: 'lucide:handshake', color: 'text-green-500', borderColor: 'border-green-300' },
  { key: 'openQuestions', title: '未解决的核心问题', icon: 'lucide:circle-help', color: 'text-amber-500', borderColor: 'border-amber-300' },
  { key: 'blindSpots', title: '你的盲区', icon: 'lucide:eye-off', color: 'text-purple-500', borderColor: 'border-purple-300' },
]
</script>
