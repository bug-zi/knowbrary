<template>
  <div>
    <!-- Notes header -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-macaron-text flex items-center gap-2">
        <Icon name="lucide:notebook-pen" class="w-4 h-4 text-macaron-cta" />
        带疑阅读
        <span v-if="notes.length" class="text-xs text-macaron-text-secondary font-normal">({{ notes.length }} 条笔记)</span>
      </h3>
      <button
        v-if="notes.length >= 1"
        class="text-xs text-macaron-cta hover:underline bg-transparent border-none cursor-pointer"
        @click="$emit('complete')"
      >
        完成阅读，进入下一步
      </button>
    </div>

    <!-- Add note -->
    <ResearchNoteInput @add="$emit('addNote', $event)" />

    <!-- Notes list -->
    <div v-if="notes.length > 0" class="mt-4 space-y-2">
      <ResearchNoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        @ask-question="$emit('askQuestion', note.id, $event)"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-6">
      <Icon name="lucide:pencil-line" class="w-8 h-8 text-macaron-text-secondary/30 mx-auto mb-2" />
      <p class="text-xs text-macaron-text-secondary">开始记录你的阅读笔记吧</p>
      <p class="text-xs text-macaron-text-secondary/60 mt-1">可以摘录原文、记录困惑、标注灵感</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResearchStep, ResearchNote } from '~/types/research'

const props = defineProps<{
  step: ResearchStep
  isGenerating: boolean
}>()

defineEmits<{
  addNote: [note: ResearchNote]
  askQuestion: [noteId: string, question: string]
  complete: []
}>()

const notes = computed<ResearchNote[]>(() => {
  if (!props.step.data) return []
  return props.step.data as ResearchNote[]
})
</script>
