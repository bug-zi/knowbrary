<template>
  <div
    class="flex gap-2.5 mb-4"
    :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
  >
    <!-- Avatar -->
    <div
      class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
      :class="message.role === 'user' ? 'bg-macaron-cta/20' : 'bg-macaron-badge-bg'"
    >
      <Icon
        :name="message.role === 'user' ? 'lucide:user' : 'lucide:bot'"
        class="w-4 h-4"
        :class="message.role === 'user' ? 'text-macaron-cta' : 'text-macaron-text-secondary'"
      />
    </div>

    <!-- Bubble -->
    <div class="max-w-[80%]">
      <div
        class="rounded-2xl px-4 py-3 text-sm leading-relaxed break-words"
        :class="message.role === 'user'
          ? 'bg-macaron-cta text-white rounded-br-sm'
          : 'bg-macaron-surface-alt text-macaron-text rounded-bl-sm'"
        v-html="renderedContent"
      />
      <div
        class="text-[10px] mt-1 px-1"
        :class="message.role === 'user' ? 'text-right text-macaron-text-secondary/50' : 'text-left text-macaron-text-secondary/50'"
      >
        {{ formattedTime }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DialogueMessage } from '~/types/dialogue'

const props = defineProps<{
  message: DialogueMessage
}>()

const formattedTime = computed(() => {
  const d = new Date(props.message.timestamp)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
})

const renderedContent = computed(() => {
  // Simple markdown: bold, italic, line breaks
  let text = props.message.content
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // Line breaks
  text = text.replace(/\n/g, '<br>')
  return text
})
</script>
