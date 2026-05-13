<template>
  <div class="card-base p-3">
    <!-- Type selector -->
    <div class="flex gap-1.5 mb-2.5 flex-wrap">
      <button
        v-for="t in noteTypes"
        :key="t.value"
        class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border-none cursor-pointer"
        :class="selectedType === t.value
          ? 'bg-macaron-cta text-white'
          : 'bg-macaron-badge-bg text-macaron-text-secondary hover:bg-macaron-border/50'"
        @click="selectedType = t.value"
      >
        <Icon :name="t.icon" class="w-3 h-3 inline-block mr-0.5" />
        {{ t.label }}
      </button>
    </div>

    <!-- Input area -->
    <textarea
      v-model="content"
      :placeholder="placeholders[selectedType]"
      rows="3"
      class="w-full px-3 py-2 rounded-xl border border-macaron-border bg-macaron-bg text-sm text-macaron-text placeholder:text-macaron-text-secondary/50 focus:outline-none focus:border-macaron-cta transition-colors resize-none"
      @keydown.ctrl.enter="handleSubmit"
    />

    <div class="flex justify-between items-center mt-2">
      <span class="text-[10px] text-macaron-text-secondary/50">Ctrl + Enter 提交</span>
      <button
        class="px-4 py-1.5 rounded-lg bg-macaron-cta text-white text-xs font-medium hover:bg-macaron-cta-hover transition-colors border-none cursor-pointer disabled:opacity-40"
        :disabled="!content.trim()"
        @click="handleSubmit"
      >
        {{ selectedType === 'question' ? '提问' : '记录' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResearchNote, NoteType } from '~/types/research'

const emit = defineEmits<{
  add: [note: ResearchNote]
}>()

const selectedType = ref<NoteType>('passage')
const content = ref('')

const noteTypes: { value: NoteType; label: string; icon: string }[] = [
  { value: 'passage', label: '摘录', icon: 'lucide:quote' },
  { value: 'question', label: '提问', icon: 'lucide:help-circle' },
  { value: 'insight', label: '洞见', icon: 'lucide:lightbulb' },
  { value: 'confusion', label: '困惑', icon: 'lucide:help-circle' },
  { value: 'connection', label: '关联', icon: 'lucide:link' },
]

const placeholders: Record<NoteType, string> = {
  passage: '摘录你读到的关键段落或观点...',
  question: '问一个具体的问题，越精确越好...',
  insight: '记录你的理解和感悟...',
  confusion: '哪里没懂？你以为自己懂了但其实没懂的是什么？',
  connection: '这个概念跟什么有关联？跟你已知的知识怎么连接？',
}

function handleSubmit() {
  if (!content.value.trim()) return

  const note: ResearchNote = {
    id: crypto.randomUUID(),
    sourceItemId: null,
    type: selectedType.value,
    content: content.value.trim(),
    aiResponse: null,
    createdAt: new Date().toISOString(),
  }

  emit('add', note)
  content.value = ''
}
</script>
