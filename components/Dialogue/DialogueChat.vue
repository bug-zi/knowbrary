<template>
  <div class="flex flex-col h-full">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-macaron-border bg-macaron-bg/80 backdrop-blur-sm shrink-0">
      <button
        class="flex items-center gap-1.5 text-sm text-macaron-text-secondary hover:text-macaron-cta transition-colors bg-transparent border-none cursor-pointer"
        @click="$emit('back')"
      >
        <Icon name="lucide:chevron-left" class="w-4 h-4" />
        返回
      </button>
      <h2 class="text-sm font-medium text-macaron-text truncate max-w-[50%]">
        {{ session?.title || '新的对话' }}
      </h2>
      <div ref="menuRef" class="relative z-50">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full text-macaron-text-secondary hover:bg-macaron-surface-alt transition-colors bg-transparent border-none cursor-pointer"
          @click.stop="showMenu = !showMenu"
        >
          <Icon name="lucide:more-vertical" class="w-4 h-4" />
        </button>
        <!-- End conversation menu -->
        <Transition name="fade">
          <div
            v-if="showMenu"
            class="absolute right-0 top-full mt-1 bg-macaron-card border border-macaron-border rounded-xl shadow-lg py-1 min-w-[120px] z-50"
          >
            <button
              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-macaron-text hover:bg-macaron-surface-alt bg-transparent border-none cursor-pointer transition-colors"
              @click.stop="directEnd"
            >
              <Icon name="lucide:square" class="w-3.5 h-3.5" />
              结束对话
            </button>
            <button
              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent border-none cursor-pointer transition-colors"
              @click.stop="directDelete"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
              归档对话
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Messages area -->
    <div ref="scrollContainer" class="flex-1 overflow-y-auto px-4 py-4">
      <!-- Session messages -->
      <DialogueMessage
        v-for="msg in session?.messages"
        :key="msg.id"
        :message="msg"
      />

      <!-- AI typing indicator -->
      <div v-if="isTyping" class="flex gap-2.5 mb-4">
        <div class="w-8 h-8 rounded-full bg-macaron-badge-bg flex items-center justify-center shrink-0">
          <Icon name="lucide:bot" class="w-4 h-4 text-macaron-text-secondary" />
        </div>
        <div class="bg-macaron-surface-alt rounded-2xl rounded-bl-sm px-4 py-3">
          <div class="flex gap-1">
            <span class="w-2 h-2 rounded-full bg-macaron-text-secondary/40 animate-bounce" style="animation-delay: 0ms" />
            <span class="w-2 h-2 rounded-full bg-macaron-text-secondary/40 animate-bounce" style="animation-delay: 150ms" />
            <span class="w-2 h-2 rounded-full bg-macaron-text-secondary/40 animate-bounce" style="animation-delay: 300ms" />
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="text-center py-3">
        <span class="text-xs text-red-400">{{ error }}</span>
      </div>
    </div>

    <!-- Input area -->
    <DialogueInput
      :disabled="isTyping"
      @send="$emit('send', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { DialogueSession } from '~/types/dialogue'

const props = defineProps<{
  session: DialogueSession | null
  isTyping: boolean
  error: string
}>()

const emit = defineEmits<{
  back: []
  send: [content: string]
  end: []
  delete: []
}>()

const showMenu = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

function directEnd() {
  showMenu.value = false
  emit('end')
}

function directDelete() {
  showMenu.value = false
  emit('delete')
}

// Click outside to close menu
function handleClickOutside(e: MouseEvent) {
  if (showMenu.value && menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// Auto-scroll to bottom on new messages
watch(
  () => props.session?.messages?.length,
  () => {
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
      }
    })
  },
  { immediate: true },
)

// Also scroll when typing state changes (for typing indicator)
watch(() => props.isTyping, () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
