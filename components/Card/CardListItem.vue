<template>
  <div class="card-base group relative">
    <NuxtLink :to="`/cards/${card.slug}`" class="block no-underline">
      <div class="flex items-start gap-3">
        <span
          class="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
          :style="{ backgroundColor: categoryMeta.color }"
        />
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-macaron-text group-hover:text-macaron-cta transition-colors">
            {{ card.title }}
          </h3>
          <p class="text-sm text-macaron-text-secondary mt-1 line-clamp-2">{{ card.oneLiner }}</p>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            <span :class="`badge-${card.difficulty}`">
              <Icon :name="DIFFICULTY_LABELS[card.difficulty].icon" class="inline w-3.5 h-3.5 align-text-bottom" /> {{ DIFFICULTY_LABELS[card.difficulty].label }}
            </span>
            <span class="text-xs text-macaron-text-secondary">
              {{ CARD_TYPE_LABELS[card.cardType] }}
            </span>
          </div>
        </div>
      </div>
    </NuxtLink>
    <!-- Delete button -->
    <button
      class="absolute top-2 right-2 p-1.5 rounded-lg text-macaron-text-secondary hover:text-red-500 hover:bg-macaron-danger-hover opacity-0 group-hover:opacity-100 transition-all"
      title="删除"
      @click="handleDelete"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
    </button>
    <!-- Delete confirm overlay -->
    <div v-if="showConfirm" class="absolute inset-0 bg-macaron-card/95 rounded-xl flex items-center justify-center z-10" @click.stop>
      <div class="text-center">
        <p class="text-sm text-macaron-text mb-3">确定删除「{{ card.title }}」？</p>
        <div class="flex gap-2">
          <button class="px-3 py-1.5 rounded-lg border border-macaron-border text-sm text-macaron-text-secondary hover:bg-macaron-border/40" @click="showConfirm = false">取消</button>
          <button class="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCategoryMeta, DIFFICULTY_LABELS, CARD_TYPE_LABELS } from '~/types'
import type { KnowledgeCard } from '~/types'

const props = defineProps<{ card: KnowledgeCard }>()
const emit = defineEmits<{ deleted: [] }>()
const categoryMeta = getCategoryMeta(props.card.category)

const showConfirm = ref(false)

function handleDelete() {
  showConfirm.value = true
}

async function confirmDelete() {
  const { deleteCard } = await import('~/utils/cards')
  const result = await deleteCard(props.card.id)
  if (result.ok) {
    emit('deleted')
  } else {
    alert(result.error || '删除失败')
  }
  showConfirm.value = false
}
</script>
