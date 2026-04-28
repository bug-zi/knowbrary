<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-macaron-text mb-6"><Icon name="lucide:layout-grid" class="inline w-6 h-6 align-text-bottom" /> 全部分类</h1>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <NuxtLink
        v-for="cat in categoriesWithCounts"
        :key="cat.id"
        :to="`/categories/${cat.id}`"
        class="card-base text-center no-underline py-6"
        :style="{ borderColor: cat.color + '40' }"
      >
        <Icon :name="cat.icon" class="text-3xl" />
        <div class="mt-2 font-semibold text-macaron-text">{{ cat.name }}</div>
        <div class="text-sm text-macaron-text-secondary mt-1">{{ cat.description }}</div>
        <div class="mt-2 text-xs px-2 py-0.5 rounded-full inline-block" :style="{ backgroundColor: cat.color + '30' }">
          {{ cat.cardCount }} 张卡片
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAllCards } from '~/utils/cards'
import { CATEGORIES } from '~/types'

const { data: allCards } = await useAsyncData('categories-cards', () => getAllCards())
const cards = allCards.value ?? []

const categoriesWithCounts = CATEGORIES.map(cat => ({
  ...cat,
  cardCount: cards.filter(c => c.category === cat.id).length,
}))
</script>
