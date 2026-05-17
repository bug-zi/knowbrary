<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <!-- Category Header -->
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/categories" class="text-macaron-text-secondary hover:text-macaron-text transition-colors no-underline">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </NuxtLink>
      <Icon :name="categoryMeta.icon" class="text-2xl" />
      <div>
        <h1 class="text-title font-bold text-macaron-text">{{ categoryMeta.name }}</h1>
        <p class="text-sm text-macaron-text-secondary">{{ categoryMeta.description }}</p>
      </div>
      <NuxtLink :to="`/create?category=${category}`" class="ml-auto flex items-center gap-1.5 px-4 py-2 bg-macaron-cta text-white rounded-xl text-sm font-medium hover:bg-macaron-cta-hover transition-colors no-underline">
        <Icon name="lucide:plus" class="w-4 h-4" />
        创建卡片
      </NuxtLink>
    </div>

    <!-- Filters (sticky on scroll) -->
    <div class="sticky top-[3.5rem] z-10 -mx-4 px-4 py-2 bg-macaron-bg/90 backdrop-blur-sm border-b border-macaron-border/30 mb-4 flex items-center gap-2 flex-wrap">
      <button
        v-for="d in difficulties"
        :key="d.value"
        class="px-3 py-1 rounded-full text-sm transition-colors"
        :class="selectedDifficulty === d.value ? 'bg-macaron-cta text-white' : 'bg-macaron-card text-macaron-text-secondary hover:bg-macaron-hover-bg'"
        @click="selectedDifficulty = selectedDifficulty === d.value ? null : d.value"
      >
        <Icon :name="d.icon" class="inline w-4 h-4 align-text-bottom" /> {{ d.label }}
      </button>
      <span class="text-macaron-text-secondary mx-1">|</span>
      <button
        v-for="t in cardTypes"
        :key="t.value"
        class="px-3 py-1 rounded-full text-sm transition-colors"
        :class="selectedType === t.value ? 'bg-macaron-cta text-white' : 'bg-macaron-card text-macaron-text-secondary hover:bg-macaron-hover-bg'"
        @click="selectedType = selectedType === t.value ? null : t.value"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Card List -->
    <div class="space-y-3">
      <CardListItem v-for="(card, index) in filteredCards" :key="card.id" :card="card" class="stagger-item" :style="{ '--stagger-index': index }" @deleted="refreshList" />
      <div v-if="!filteredCards.length" class="text-center py-12 text-macaron-text-secondary">
        暂无卡片，敬请期待
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCardsByCategory, filterCards } from '~/utils/cards'
import { getCategoryMeta, DIFFICULTY_LABELS, CARD_TYPE_LABELS } from '~/types'
import type { Category, Difficulty, CardType } from '~/types'

const route = useRoute()
const category = route.params.category as Category
const categoryMeta = getCategoryMeta(category)

const selectedDifficulty = ref<Difficulty | null>(null)
const selectedType = ref<CardType | null>(null)

const difficulties = Object.entries(DIFFICULTY_LABELS).map(([value, { label, icon }]) => ({
  value: value as Difficulty,
  label,
  icon,
}))

const cardTypes = Object.entries(CARD_TYPE_LABELS).map(([value, label]) => ({
  value: value as CardType,
  label,
}))

const { data: categoryCards, refresh: refreshCards } = await useAsyncData(`category-${category}-cards`, () => getCardsByCategory(category))
const cards = computed(() => categoryCards.value ?? [])

const filteredCards = computed(() => {
  let result = cards.value
  if (selectedDifficulty.value) {
    result = result.filter(c => c.difficulty === selectedDifficulty.value)
  }
  if (selectedType.value) {
    result = result.filter(c => c.cardType === selectedType.value)
  }
  return result
})

async function refreshList() {
  await refreshCards()
}
</script>
