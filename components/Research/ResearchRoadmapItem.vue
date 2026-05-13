<template>
  <div
    class="p-3 rounded-xl border transition-all"
    :class="item.isRead
      ? 'bg-macaron-cta/5 border-macaron-cta/20'
      : 'bg-macaron-card border-macaron-border'"
  >
    <div class="flex items-start gap-2.5">
      <!-- Read checkbox -->
      <button
        class="mt-0.5 w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 transition-colors border-none cursor-pointer"
        :class="item.isRead ? 'bg-macaron-cta text-white' : 'bg-macaron-badge-bg text-transparent hover:text-macaron-text-secondary/30'"
        @click="$emit('toggleRead')"
      >
        <Icon name="lucide:check" class="w-3 h-3" />
      </button>

      <div class="flex-1 min-w-0">
        <!-- Title + priority -->
        <div class="flex items-center gap-2 mb-1">
          <span class="text-sm font-medium text-macaron-text truncate">{{ item.title }}</span>
          <span
            class="px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0"
            :class="{
              'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400': item.priority === 'essential',
              'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400': item.priority === 'recommended',
              'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400': item.priority === 'optional',
            }"
          >
            {{ priorityLabels[item.priority] }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-xs text-macaron-text-secondary leading-relaxed">{{ item.description }}</p>

        <!-- Relevance -->
        <p class="text-xs text-macaron-cta/70 mt-1"> {{ item.relevance }}</p>

        <!-- User note (expandable) -->
        <div v-if="item.isRead" class="mt-2">
          <textarea
            :value="item.userNote"
            placeholder="读完随手记一句..."
            rows="2"
            class="w-full px-2.5 py-1.5 rounded-lg border border-macaron-border bg-macaron-bg text-xs text-macaron-text placeholder:text-macaron-text-secondary/40 focus:outline-none focus:border-macaron-cta/50 transition-colors resize-none"
            @blur="$emit('updateNote', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoadmapItem } from '~/types/research'

defineProps<{ item: RoadmapItem }>()
defineEmits<{
  toggleRead: []
  updateNote: [note: string]
}>()

const priorityLabels: Record<string, string> = {
  essential: '必读',
  recommended: '推荐',
  optional: '可选',
}
</script>
