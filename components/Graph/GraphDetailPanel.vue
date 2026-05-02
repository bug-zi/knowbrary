<template>
  <Transition name="slide-right">
    <div
      v-if="cardData"
      class="absolute z-20 bg-macaron-card/95 backdrop-blur-sm border-l border-macaron-border shadow-lg overflow-y-auto"
      :class="isMobile ? 'inset-0 w-full border-none' : 'top-0 right-0 w-80 h-full'"
    >
      <div class="p-5">
        <!-- Close button -->
        <button
          class="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-macaron-bg transition-colors text-macaron-text-secondary z-10"
          @click="$emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Category badge -->
        <span
          class="inline-block text-xs px-2 py-1 rounded-full mb-3"
          :style="{ backgroundColor: cardData.categoryColor + '40' }"
        >
          {{ cardData.categoryIcon }} {{ cardData.categoryName }}
        </span>

        <!-- Title -->
        <h3 class="text-xl font-bold text-macaron-text mb-2 pr-8">{{ cardData.card.title }}</h3>

        <!-- OneLiner -->
        <p class="text-sm text-macaron-text-secondary mb-4">{{ cardData.card.oneLiner }}</p>

        <!-- Difficulty -->
        <span :class="`badge-${cardData.card.difficulty} mb-4 inline-block`">
          <Icon :name="difficultyLabels[cardData.card.difficulty].icon" class="inline w-3.5 h-3.5 align-text-bottom" />
          {{ difficultyLabels[cardData.card.difficulty].label }}
        </span>

        <!-- Tags -->
        <div v-if="cardData.card.tags.length" class="flex flex-wrap gap-1.5 mb-5">
          <span
            v-for="tag in cardData.card.tags"
            :key="tag"
            class="text-xs px-2 py-0.5 rounded-full bg-macaron-bg text-macaron-text-secondary"
          >
            #{{ tag }}
          </span>
        </div>

        <!-- Related Cards -->
        <div v-if="cardData.relatedCards.length" class="mb-5">
          <h4 class="text-sm font-semibold text-macaron-text mb-2">知识邻居</h4>
          <div class="space-y-1.5">
            <NuxtLink
              v-for="related in cardData.relatedCards"
              :key="related.id"
              :to="`/cards/${related.slug}`"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm no-underline transition-colors"
              :style="{ backgroundColor: getCategoryMeta(related.category).color + '20' }"
            >
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{ backgroundColor: getCategoryMeta(related.category).color }"
              />
              <span class="text-macaron-text truncate">{{ related.title }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Open full card button -->
        <NuxtLink
          :to="`/cards/${cardData.card.slug}`"
          class="block w-full text-center px-4 py-2.5 rounded-xl text-white text-sm font-medium no-underline transition-colors"
          :style="{ backgroundColor: 'var(--macaron-cta)' }"
        >
          查看完整卡片
        </NuxtLink>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { KnowledgeCard } from '~/types'
import { getCategoryMeta, DIFFICULTY_LABELS } from '~/types'

defineProps<{
  cardData: {
    card: KnowledgeCard
    categoryColor: string
    categoryName: string
    categoryIcon: string
    relatedCards: KnowledgeCard[]
  } | null
  isMobile: boolean
}>()

defineEmits<{
  close: []
}>()

const difficultyLabels = DIFFICULTY_LABELS
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
