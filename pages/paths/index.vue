<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-macaron-text mb-6"><Icon name="lucide:route" class="inline w-6 h-6 align-text-bottom" /> 学习路径</h1>

    <div class="space-y-4">
      <div
        v-for="path in paths"
        :key="path.id"
        class="card-base group relative"
        :style="{ borderColor: path.color + '40' }"
      >
        <NuxtLink :to="`/paths/${path.slug}`" class="block no-underline">
          <div class="flex items-start gap-4">
            <Icon :name="path.icon" class="text-3xl" />
            <div class="flex-1">
              <h2 class="font-semibold text-macaron-text group-hover:text-macaron-cta transition-colors">
                {{ path.title }}
              </h2>
              <p class="text-sm text-macaron-text-secondary mt-1">{{ path.description }}</p>

              <!-- Progress bar -->
              <div class="mt-3">
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-macaron-text-secondary">
                    {{ getProgress(path).completed }}/{{ getProgress(path).total }} 张卡片
                  </span>
                  <span class="font-medium text-macaron-cta">
                    {{ getProgress(path).percentage }}%
                  </span>
                </div>
                <div class="h-2 bg-macaron-border/40 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500 bg-macaron-cta"
                    :style="{ width: getProgress(path).percentage + '%' }"
                  />
                </div>
              </div>

              <div class="flex items-center gap-2 mt-2">
                <span class="text-xs px-2 py-0.5 rounded-full" :style="{ backgroundColor: path.color + '30' }">
                  {{ path.category }}
                </span>
                <span :class="`badge-${path.difficulty}`">
                  <Icon :name="DIFFICULTY_LABELS[path.difficulty].icon" class="inline w-3.5 h-3.5 align-text-bottom" /> {{ DIFFICULTY_LABELS[path.difficulty].label }}
                </span>
                <span class="text-xs text-macaron-text-secondary">~{{ path.estimatedTime }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
        <!-- Delete button -->
        <button
          class="absolute top-2 right-2 p-1.5 rounded-lg text-macaron-text-secondary hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
          title="删除"
          @click="startDelete(path)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
        <!-- Delete confirm overlay -->
        <div v-if="deletingPath?.id === path.id" class="absolute inset-0 bg-macaron-card/95 rounded-xl flex items-center justify-center z-10" @click.stop>
          <div class="text-center">
            <p class="text-sm text-macaron-text mb-3">确定删除「{{ path.title }}」？</p>
            <div class="flex gap-2">
              <button class="px-3 py-1.5 rounded-lg border border-macaron-border text-sm text-macaron-text-secondary hover:bg-macaron-border/30" @click="deletingPath = null">取消</button>
              <button class="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600" @click="confirmDeletePath(path)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAllPaths, deletePath } from '~/utils/paths'
import { getPathProgress } from '~/utils/progress'
import { DIFFICULTY_LABELS } from '~/types'
import type { LearningPath } from '~/types/paths'

const { data: pathsRef, refresh: refreshPaths } = await useAsyncData('all-paths', () => getAllPaths())
const paths = computed(() => pathsRef.value ?? [])

const deletingPath = ref<LearningPath | null>(null)

function getProgress(path: LearningPath) {
  return getPathProgress(path)
}

function startDelete(path: LearningPath) {
  deletingPath.value = path
}

async function confirmDeletePath(path: LearningPath) {
  const result = await deletePath(path.id)
  if (result.ok) {
    deletingPath.value = null
    await refreshPaths()
  } else {
    alert(result.error || '删除失败')
  }
}
</script>
