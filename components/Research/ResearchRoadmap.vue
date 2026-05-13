<template>
  <div>
    <!-- Not generated yet -->
    <div v-if="!step.data" class="text-center py-8">
      <div class="w-12 h-12 rounded-xl bg-macaron-badge-bg flex items-center justify-center mx-auto mb-3">
        <Icon name="lucide:map" class="w-6 h-6 text-macaron-cta" />
      </div>
      <h3 class="text-sm font-semibold text-macaron-text mb-1">生成研究路线图</h3>
      <p class="text-xs text-macaron-text-secondary mb-4 max-w-xs mx-auto">
        AI 会结合网络搜索，为你梳理「{{ topic }}」的核心文献、关键人物和重要概念
      </p>
      <button
        class="px-5 py-2.5 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors border-none cursor-pointer disabled:opacity-40"
        :disabled="isGenerating"
        @click="$emit('generate')"
      >
        <span v-if="isGenerating" class="flex items-center gap-2">
          <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          正在搜索和梳理...
        </span>
        <span v-else>生成路线图</span>
      </button>
    </div>

    <!-- Roadmap generated -->
    <div v-else>
      <div class="flex items-center justify-between mb-3">
        <div>
          <h3 class="text-sm font-semibold text-macaron-text">研究路线图</h3>
          <p class="text-xs text-macaron-text-secondary mt-0.5">{{ roadmap.topicSummary }}</p>
        </div>
        <button
          class="text-xs text-macaron-cta hover:underline bg-transparent border-none cursor-pointer"
          :disabled="isGenerating"
          @click="$emit('generate')"
        >
          重新生成
        </button>
      </div>

      <!-- Core question -->
      <div class="p-3 rounded-xl bg-macaron-cta/10 border border-macaron-cta/20 mb-4">
        <p class="text-xs text-macaron-cta font-medium mb-0.5">核心问题</p>
        <p class="text-sm text-macaron-text">{{ roadmap.coreQuestion }}</p>
      </div>

      <!-- Items grouped by type -->
      <div class="space-y-4">
        <div v-for="group in groupedItems" :key="group.type">
          <h4 class="text-xs font-medium text-macaron-text-secondary mb-2 flex items-center gap-1.5">
            <Icon :name="typeIcons[group.type]" class="w-3.5 h-3.5" />
            {{ typeLabels[group.type] }}
            <span class="text-macaron-text-secondary/50">({{ group.items.length }})</span>
          </h4>
          <div class="space-y-2">
            <ResearchRoadmapItem
              v-for="item in group.items"
              :key="item.id"
              :item="item"
              @toggle-read="$emit('toggleRead', item.id)"
              @update-note="$emit('updateNote', item.id, $event)"
            />
          </div>
        </div>
      </div>

      <!-- Suggested angles -->
      <div v-if="roadmap.suggestedAngles?.length" class="mt-4 p-3 rounded-xl bg-macaron-badge-bg/50">
        <h4 class="text-xs font-medium text-macaron-text-secondary mb-2">建议深入方向</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="angle in roadmap.suggestedAngles"
            :key="angle"
            class="px-2.5 py-1 rounded-lg bg-macaron-bg text-xs text-macaron-text border border-macaron-border"
          >
            {{ angle }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResearchStep, ResearchRoadmap as RoadmapType } from '~/types/research'

const props = defineProps<{
  step: ResearchStep
  topic: string
  isGenerating: boolean
}>()

defineEmits<{
  generate: []
  toggleRead: [itemId: string]
  updateNote: [itemId: string, note: string]
}>()

const roadmap = computed(() => props.step.data as RoadmapType)

const typeLabels: Record<string, string> = {
  paper: '核心论文',
  book: '必读书目',
  person: '关键人物',
  concept: '核心概念',
  resource: '学习资源',
  'recent-development': '最新进展',
}

const typeIcons: Record<string, string> = {
  paper: 'lucide:file-text',
  book: 'lucide:book-open',
  person: 'lucide:user',
  concept: 'lucide:lightbulb',
  resource: 'lucide:link',
  'recent-development': 'lucide:trending-up',
}

const groupedItems = computed(() => {
  if (!roadmap.value?.items) return []
  const groups: { type: string; items: any[] }[] = []
  const typeOrder = ['concept', 'paper', 'book', 'person', 'resource', 'recent-development']
  for (const type of typeOrder) {
    const items = roadmap.value.items.filter(i => i.type === type)
    if (items.length > 0) {
      groups.push({ type, items })
    }
  }
  return groups
})
</script>
