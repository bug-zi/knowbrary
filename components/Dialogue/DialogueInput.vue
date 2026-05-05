<template>
  <div class="flex items-end gap-2 px-4 py-3 border-t border-macaron-border bg-macaron-bg/80 backdrop-blur-sm">
    <textarea
      ref="inputRef"
      v-model="text"
      :disabled="disabled"
      :placeholder="placeholder"
      rows="1"
      class="flex-1 resize-none rounded-2xl bg-macaron-surface-alt border border-macaron-border px-4 py-2.5 text-sm text-macaron-text placeholder-macaron-text-secondary/50 outline-none focus:border-macaron-cta/50 transition-colors"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
      :style="{ height: inputHeight + 'px' }"
      @input="autoResize"
      @keydown="handleKeydown"
    />
    <button
      :disabled="!canSend"
      class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
      :class="canSend
        ? 'bg-macaron-cta text-white hover:bg-macaron-cta-hover active:scale-95'
        : 'bg-macaron-surface-alt text-macaron-text-secondary/30 cursor-not-allowed'"
      @click="handleSend"
    >
      <Icon name="lucide:send" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  disabled?: boolean
  placeholder?: string
}>(), {
  disabled: false,
  placeholder: '说说你的想法...',
})

const emit = defineEmits<{
  send: [content: string]
}>()

const text = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)
const inputHeight = ref(44)

const canSend = computed(() => text.value.trim().length > 0 && !props.disabled)

function autoResize() {
  if (!inputRef.value) return
  inputRef.value.style.height = 'auto'
  const h = Math.min(Math.max(inputRef.value.scrollHeight, 44), 120)
  inputHeight.value = h
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleSend() {
  const content = text.value.trim()
  if (!content || props.disabled) return
  emit('send', content)
  text.value = ''
  inputHeight.value = 44
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = '44px'
    }
  })
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>
