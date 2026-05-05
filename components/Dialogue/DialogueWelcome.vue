<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="px-4 pt-6 pb-4">
      <h1 class="text-xl font-bold text-macaron-text mb-1">今天想聊点什么？</h1>
      <p class="text-sm text-macaron-text-secondary">选一个话题，或者自由倾诉</p>
    </div>

    <!-- Topic grid -->
    <div class="flex-1 overflow-y-auto px-4 pb-4">
      <div class="grid grid-cols-2 gap-3 mb-4">
        <button
          v-for="topic in DIALOGUE_TOPICS"
          :key="topic.id"
          class="card-base p-4 text-left cursor-pointer hover:border-macaron-cta/40 transition-all active:scale-[0.98]"
          @click="$emit('selectTopic', topic.id)"
        >
          <div class="w-9 h-9 rounded-xl bg-macaron-badge-bg flex items-center justify-center mb-3">
            <Icon :name="topic.icon" class="w-4.5 h-4.5 text-macaron-text-secondary" />
          </div>
          <h3 class="text-sm font-medium text-macaron-text mb-1">{{ topic.label }}</h3>
          <p class="text-xs text-macaron-text-secondary leading-relaxed">{{ topic.description }}</p>
        </button>
      </div>

      <!-- Free chat button -->
      <button
        class="w-full py-3.5 rounded-2xl border-2 border-dashed border-macaron-border text-sm text-macaron-text-secondary bg-transparent cursor-pointer hover:border-macaron-cta/40 hover:text-macaron-cta transition-all"
        @click="$emit('selectTopic', null)"
      >
        <Icon name="lucide:pen-line" class="w-4 h-4 inline mr-1.5 -mt-0.5" />
        自由倾诉
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DIALOGUE_TOPICS } from '~/types/dialogue'
import type { DialogueTopic } from '~/types/dialogue'

defineEmits<{
  selectTopic: [topic: DialogueTopic | null]
}>()
</script>
