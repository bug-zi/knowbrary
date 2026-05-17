<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <h1 class="text-title font-bold text-macaron-text mb-2">
      <Icon name="lucide:archive" class="inline w-6 h-6 align-text-bottom" />
      归档处
    </h1>
    <p class="text-sm text-macaron-text-secondary mb-6">
      已归档的卡片将保留 7 天，之后自动删除。你可以在此期间恢复它们。
    </p>

    <!-- Empty state -->
    <div v-if="archivedCards.length === 0" class="text-center py-16">
      <Icon name="lucide:inbox" class="text-5xl text-macaron-border mx-auto" />
      <p class="mt-4 text-macaron-text-secondary">暂无归档卡片</p>
      <p class="text-sm text-macaron-text-secondary mt-1">复习完卡片后，可以选择归档不再需要的内容</p>
    </div>

    <!-- Card list -->
    <div v-else class="space-y-3">
      <div
        v-for="item in archivedCards"
        :key="item.id"
        class="card-base flex items-center gap-4 p-4"
      >
        <!-- Category icon -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: getMeta(item.category).color + '20' }"
        >
          <Icon :name="getMeta(item.category).icon" class="w-5 h-5" :style="{ color: getMeta(item.category).color }" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="font-medium text-macaron-text truncate">{{ item.title }}</div>
          <div class="text-xs text-macaron-text-secondary mt-0.5">
            {{ getMeta(item.category).name }}
            <span class="mx-1.5 opacity-40">|</span>
            <span :class="getRemainingDays(item.archivedAt) <= 2 ? 'text-red-500 font-medium' : ''">
              剩余 {{ getRemainingDays(item.archivedAt) }} 天
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-medium border border-macaron-border text-macaron-text hover:bg-macaron-hover-bg transition-colors cursor-pointer"
            @click="handleRestore(item.id)"
          >
            恢复
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            @click="handlePermanentDelete(item.id)"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getArchivedCards, unarchiveCard, removeArchiveEntry, getRemainingDays } from '~/utils/archive'
import { deleteCard, invalidateCardsCache } from '~/utils/cards'
import { getCategoryMeta } from '~/types'
import type { ArchivedCard } from '~/utils/archive'

const archivedCards = ref<ArchivedCard[]>([])

onMounted(async () => {
  const { valid, expired } = getArchivedCards()
  archivedCards.value = valid

  // Cleanup expired AI-generated cards from database
  for (const item of expired) {
    if (item.id.startsWith('ai-')) {
      deleteCard(item.id).catch(() => {})
    }
  }
  if (expired.length > 0) invalidateCardsCache()
})

function getMeta(category: string) {
  return getCategoryMeta(category as any)
}

function handleRestore(cardId: string) {
  unarchiveCard(cardId)
  invalidateCardsCache()
  archivedCards.value = getArchivedCards().valid
}

async function handlePermanentDelete(cardId: string) {
  if (!confirm('永久删除后将无法恢复，确定吗？')) return
  removeArchiveEntry(cardId)
  if (cardId.startsWith('ai-')) {
    await deleteCard(cardId)
  }
  invalidateCardsCache()
  archivedCards.value = getArchivedCards().valid
}
</script>
