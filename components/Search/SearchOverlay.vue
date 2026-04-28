<template>
  <div class="fixed inset-0 z-[60] backdrop-blur-sm p-4 pt-6" style="background: var(--macaron-overlay)">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-1 relative">
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="搜索知识卡片..."
            class="w-full px-4 py-3 rounded-card bg-macaron-card shadow-card border border-macaron-border text-macaron-text placeholder:text-macaron-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-macaron-cta/30"
            @input="debouncedSearch"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-macaron-text-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          class="px-4 py-3 text-macaron-text-secondary hover:text-macaron-text transition-colors"
          @click="$emit('close')"
        >
          取消
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12 text-macaron-text-secondary">
        <Icon name="lucide:loader-2" class="inline w-5 h-5 animate-spin" />
        搜索中...
      </div>

      <!-- Results -->
      <div v-else-if="results.length > 0" class="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
        <div class="text-xs text-macaron-text-secondary mb-2 px-1">找到 {{ results.length }} 张卡片</div>
        <NuxtLink
          v-for="card in results"
          :key="card.id"
          :to="`/cards/${card.slug}`"
          class="block card-base no-underline"
          @click="$emit('close')"
        >
          <div class="flex items-start gap-3">
            <span
              class="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              :style="{ backgroundColor: getCategoryMeta(card.category).color }"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-macaron-text">{{ card.title }}</div>
              <div class="text-sm text-macaron-text-secondary mt-0.5 truncate">{{ card.oneLiner }}</div>
              <div class="flex items-center gap-2 mt-1.5">
                <span class="text-xs text-macaron-text-secondary"><Icon :name="getCategoryMeta(card.category).icon" class="inline w-3 h-3 align-text-bottom" /> {{ getCategoryMeta(card.category).name }}</span>
                <span :class="`badge-${card.difficulty}`"><Icon :name="DIFFICULTY_LABELS[card.difficulty].icon" class="inline w-3 h-3 align-text-bottom" /> {{ DIFFICULTY_LABELS[card.difficulty].label }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- No results -->
      <div v-else-if="query && searched && !results.length" class="text-center py-12 text-macaron-text-secondary">
        没有找到「{{ query }}」相关的知识卡片
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12 text-macaron-text-secondary">
        输入关键词搜索知识卡片
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { searchCards } from '~/utils/cards'
import { getCategoryMeta, DIFFICULTY_LABELS } from '~/types'
import type { KnowledgeCard } from '~/types'

defineEmits(['close'])

const query = ref('')
const results = ref<KnowledgeCard[]>([])
const loading = ref(false)
const searched = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus()
  })
})

function debouncedSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)

  const q = query.value.trim()
  if (!q) {
    results.value = []
    searched.value = false
    return
  }

  loading.value = true

  debounceTimer = setTimeout(async () => {
    try {
      results.value = await searchCards(q)
    } catch (e) {
      console.error('Search failed:', e)
      results.value = []
    } finally {
      loading.value = false
      searched.value = true
    }
  }, 300)
}
</script>
