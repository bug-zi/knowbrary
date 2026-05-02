<template>
  <div
    class="absolute z-20 bg-macaron-card/95 backdrop-blur-sm border-macaron-border shadow-lg transition-transform duration-300 overflow-y-auto"
    :class="[
      isMobile
        ? ['bottom-0 left-0 w-full rounded-t-2xl border-t max-h-[60vh]', mobileDrawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]']
        : ['top-0 left-0 w-64 border-r h-full', collapsed ? '-translate-x-full' : 'translate-x-0']
    ]"
  >
    <!-- Mobile drag handle / Desktop toggle -->
    <div
      :class="isMobile ? 'flex justify-center py-2 cursor-grab' : 'absolute -right-10 top-3'"
      @click="isMobile ? $emit('update:mobileDrawerOpen', !mobileDrawerOpen) : $emit('update:collapsed', !collapsed)"
    >
      <div v-if="isMobile" class="w-10 h-1 rounded-full bg-macaron-border" />
      <button v-else class="bg-macaron-card border border-macaron-border rounded-r-lg px-2 py-2 shadow-sm hover:bg-macaron-bg transition-colors text-macaron-text-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="collapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <div class="p-4">
      <h2 class="text-lg font-bold text-macaron-text mb-4"><Icon name="lucide:share-2" class="inline w-5 h-5 align-text-bottom" /> 知识图谱</h2>

      <!-- Search -->
      <div class="mb-4">
        <label class="text-xs text-macaron-text-secondary mb-1 block">搜索节点</label>
        <input
          :value="searchQuery"
          type="text"
          placeholder="关键词、标签、分类..."
          class="w-full px-3 py-2 text-sm border border-macaron-border rounded-lg bg-macaron-bg focus:outline-none focus:ring-2 focus:ring-macaron-cta/40 transition-shadow"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Category Filters -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs text-macaron-text-secondary">分类筛选</label>
          <button
            class="text-xs text-macaron-cta hover:text-macaron-cta-hover transition-colors"
            @click="$emit('toggle-all')"
          >
            {{ allChecked ? '全部取消' : '全选' }}
          </button>
        </div>
        <div class="space-y-1 max-h-72 overflow-y-auto pr-1">
          <label
            v-for="cat in availableCategories"
            :key="cat.id"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-macaron-bg cursor-pointer transition-colors text-sm"
          >
            <input
              type="checkbox"
              :checked="enabledCategories.has(cat.id)"
              class="sr-only"
              @change="$emit('toggle-category', cat.id)"
            />
            <span
              class="w-4 h-4 rounded flex items-center justify-center border-2 transition-all flex-shrink-0"
              :style="{
                borderColor: cat.color,
                backgroundColor: enabledCategories.has(cat.id) ? cat.color : 'transparent',
              }"
            >
              <svg v-if="enabledCategories.has(cat.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span class="text-macaron-text"><Icon :name="cat.icon" class="inline w-4 h-4 align-text-bottom" /> {{ cat.name }}</span>
            <span class="text-xs text-macaron-text-secondary ml-auto">{{ getCategoryCount(cat.id) }}</span>
          </label>
        </div>
      </div>

      <!-- Controls -->
      <div class="space-y-2 mb-4">
        <button
          class="w-full px-3 py-2 text-sm bg-macaron-bg hover:bg-macaron-border rounded-lg transition-colors text-macaron-text-secondary"
          @click="$emit('reset-zoom')"
        >
          重置视图
        </button>
        <button
          class="w-full px-3 py-2 text-sm bg-macaron-bg hover:bg-macaron-border rounded-lg transition-colors text-macaron-text-secondary"
          @click="$emit('reset-simulation')"
        >
          重新布局
        </button>
      </div>

      <!-- Stats -->
      <div class="text-xs text-macaron-text-secondary border-t border-macaron-border pt-3">
        <div class="flex justify-between mb-1">
          <span>显示节点</span>
          <span class="font-medium text-macaron-text">{{ stats.nodes }}</span>
        </div>
        <div class="flex justify-between">
          <span>连接数</span>
          <span class="font-medium text-macaron-text">{{ stats.links }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types'

defineProps<{
  collapsed: boolean
  mobileDrawerOpen: boolean
  isMobile: boolean
  searchQuery: string
  availableCategories: { id: Category; name: string; icon: string; color: string }[]
  enabledCategories: Set<Category>
  allChecked: boolean
  stats: { nodes: number; links: number }
  getCategoryCount: (id: Category) => number
}>()

defineEmits<{
  'update:collapsed': [value: boolean]
  'update:mobileDrawerOpen': [value: boolean]
  'update:searchQuery': [value: string]
  'toggle-category': [id: Category]
  'toggle-all': []
  'reset-zoom': []
  'reset-simulation': []
}>()
</script>
