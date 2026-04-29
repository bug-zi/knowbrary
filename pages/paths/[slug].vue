<template>
  <div v-if="path" class="max-w-4xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/paths" class="text-macaron-text-secondary hover:text-macaron-text transition-colors no-underline">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </NuxtLink>
      <Icon :name="path.icon" class="text-2xl" />
      <div class="flex-1">
        <h1 class="text-xl font-bold text-macaron-text">{{ path.title }}</h1>
        <p class="text-sm text-macaron-text-secondary">{{ path.description }}</p>
      </div>
      <button
        v-if="path.id.startsWith('path-ai-')"
        class="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-400 hover:text-red-600"
        @click="showDeleteConfirm = true"
      >
        <Icon name="lucide:trash-2" />
      </button>
    </div>

    <!-- Progress -->
    <div class="card-base mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-macaron-text-secondary">学习进度</span>
        <span class="text-sm font-medium text-macaron-cta">{{ progress.percentage }}%</span>
      </div>
      <div class="h-3 bg-macaron-border/40 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 bg-macaron-cta"
          :style="{ width: progress.percentage + '%' }"
        />
      </div>
      <div class="flex items-center gap-3 mt-2 text-xs text-macaron-text-secondary">
        <span>{{ progress.completed }}/{{ progress.total }} 张卡片</span>
        <span>~{{ path.estimatedTime }}</span>
        <span :class="`badge-${path.difficulty}`"><Icon :name="DIFFICULTY_LABELS[path.difficulty].icon" class="inline w-3.5 h-3.5 align-text-bottom" /> {{ DIFFICULTY_LABELS[path.difficulty].label }}</span>
      </div>
    </div>

    <!-- Skill Tree -->
    <div class="card-base mb-6">
      <h2 class="text-lg font-semibold text-macaron-text mb-4">技能树</h2>
      <div ref="treeContainerRef" class="relative overflow-hidden" :style="{ height: treeHeight + 'px' }">
        <!-- SVG Lines -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 1;">
          <line
            v-for="edge in path.edges"
            :key="`${edge.from}-${edge.to}`"
            :x1="scaledPos(edge.from).x"
            :y1="scaledPos(edge.from).y + nodeHalfH"
            :x2="scaledPos(edge.to).x"
            :y2="scaledPos(edge.to).y - nodeHalfH"
            :stroke="getEdgeColor(edge)"
            stroke-width="2"
            stroke-dasharray="6,3"
          />
        </svg>

        <!-- Nodes -->
        <div
          v-for="node in path.nodes"
          :key="node.id"
          class="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          :style="{ left: scaledPos(node.id).x + 'px', top: scaledPos(node.id).y + 'px' }"
        >
          <NuxtLink
            v-if="getNodeState(node) !== 'locked'"
            :to="`/cards/${getCardSlug(node.cardId)}?from=/paths/${slug}`"
            class="block no-underline"
            @click="handleCardClick(node)"
          >
            <div
              class="px-3 py-2.5 rounded-2xl shadow-sm border-2 text-center transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer"
              :class="getNodeBgClass(node)"
              :style="{ borderColor: getNodeState(node) === 'completed' ? 'var(--macaron-cta)' : 'var(--macaron-cta-light)', width: nodeW + 'px' }"
            >
              <div class="text-lg mb-1"><Icon :name="getNodeState(node) === 'completed' ? 'lucide:circle-check' : getNodeState(node) === 'available' ? 'lucide:book-open' : 'lucide:lock'" /></div>
              <div class="text-sm font-medium text-macaron-text truncate">{{ getCardTitle(node.cardId) }}</div>
              <div v-if="getNodeState(node) === 'completed'" class="text-xs mt-1 text-macaron-cta">已完成</div>
              <div v-else-if="getNodeState(node) === 'available'" class="text-xs mt-1 text-macaron-text-secondary">点击学习</div>
            </div>
          </NuxtLink>
          <div v-else class="px-3 py-2.5 rounded-2xl shadow-sm border-2 text-center opacity-50 cursor-not-allowed" :style="{ borderColor: 'var(--macaron-cta-light, #D4C4B0)', width: nodeW + 'px' }">
            <div class="text-lg mb-1"><Icon name="lucide:lock" /></div>
            <div class="text-sm font-medium text-macaron-text-secondary truncate">{{ getCardTitle(node.cardId) }}</div>
            <div class="text-xs mt-1 text-macaron-text-secondary">需先完成前置</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Completion message -->
    <div v-if="progress.percentage === 100" class="card-base text-center py-8">
      <div class="text-4xl mb-2"><Icon name="lucide:party-popper" class="text-4xl" /></div>
      <h3 class="text-lg font-bold text-macaron-text">恭喜完成！</h3>
      <p class="text-sm text-macaron-text-secondary mt-1">你已完成「{{ path.title }}」全部内容</p>
    </div>
  </div>

  <div v-else class="max-w-4xl mx-auto px-4 py-8 text-center">
    <div class="text-4xl mb-4"><Icon name="lucide:search" class="text-4xl" /></div>
    <p class="text-macaron-text-secondary">路径未找到</p>
  </div>

  <!-- Delete confirmation dialog -->
  <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div class="bg-macaron-card rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl">
      <h3 class="text-lg font-bold text-macaron-text">确认删除</h3>
      <p class="text-sm text-macaron-text-secondary mt-2">将删除此路径及其所有节点和占位卡片，确定吗？</p>
      <div class="flex gap-3 mt-5">
        <button class="flex-1 py-2.5 rounded-xl border border-macaron-border text-macaron-text font-medium" @click="showDeleteConfirm = false">取消</button>
        <button class="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600" @click="confirmDeletePath">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPathBySlug, deletePath } from '~/utils/paths'
import { getAllCards } from '~/utils/cards'
import { getPathProgress, getNodeState as getNodeStateUtil, markCardLearned, isCardLearned } from '~/utils/progress'
import { DIFFICULTY_LABELS } from '~/types'
import type { LearningPath, PathNode, PathEdge } from '~/types/paths'

const route = useRoute()
const slug = route.params.slug as string
const { data: pathRef } = await useAsyncData(`path-${slug}`, () => getPathBySlug(slug))
const path = pathRef.value

const { data: allCards } = await useAsyncData(`path-cards-${slug}`, () => getAllCards())
const cardsMap = new Map((allCards.value ?? []).map(c => [c.id, c]))

const progress = path ? getPathProgress(path) : { completed: 0, total: 0, percentage: 0 }

// Refresh progress reactively
const refreshKey = ref(0)
function refreshProgress() {
  refreshKey.value++
}

// Responsive tree layout
const treeContainerRef = ref<HTMLElement>()
const containerWidth = ref(0)

onMounted(() => {
  nextTick(() => {
    if (!treeContainerRef.value) return
    containerWidth.value = treeContainerRef.value.offsetWidth
    const ro = new ResizeObserver(entries => {
      containerWidth.value = entries[0].contentRect.width
    })
    ro.observe(treeContainerRef.value)
    onUnmounted(() => ro.disconnect())
  })
})

const nodeW = computed(() => (containerWidth.value || 800) < 420 ? 110 : 160)
const nodeHalfH = computed(() => (containerWidth.value || 800) < 420 ? 40 : 50)

const treeHeight = computed(() => {
  if (!path) return 300
  const ys = path.nodes.map(n => n.position?.y || 0)
  return Math.max(...ys) + nodeHalfH.value * 2 + 30
})

const scaledPos = computed(() => {
  const w = containerWidth.value || 800
  const nhH = nodeHalfH.value
  const nW = nodeW.value
  const nodes = path?.nodes || []
  const allX = nodes.map(n => n.position?.x || 0)
  const minX = allX.length ? Math.min(...allX) : 0
  const maxX = allX.length ? Math.max(...allX) : 0

  return (nodeId: string): { x: number; y: number } => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node?.position) return { x: w / 2, y: 50 }

    let x = w / 2
    if (maxX > minX) {
      const margin = nW / 2 + 16
      const usable = w - margin * 2
      x = margin + ((node.position.x - minX) / (maxX - minX)) * usable
    }

    const y = node.position.y + nhH + 10
    return { x, y }
  }
})

function getNodePosition(nodeId: string): { x: number; y: number } {
  if (!path) return { x: 0, y: 0 }
  const node = path.nodes.find(n => n.id === nodeId)
  return node?.position || { x: 0, y: 0 }
}

function getNodeState(node: PathNode): 'completed' | 'available' | 'locked' {
  if (!path) return 'locked'
  return getNodeStateUtil(node, path)
}

function getCardTitle(cardId: string): string {
  return cardsMap.get(cardId)?.title || '未知卡片'
}

function getCardSlug(cardId: string): string {
  return cardsMap.get(cardId)?.slug || ''
}

function getEdgeColor(edge: PathEdge): string {
  if (!path) return '#D4C4B0'
  const fromNode = path.nodes.find(n => n.id === edge.from)
  const toNode = path.nodes.find(n => n.id === edge.to)
  if (!fromNode || !toNode) return '#D4C4B0'
  const fromState = getNodeState(fromNode)
  const toState = getNodeState(toNode)
  if (fromState === 'completed' && (toState === 'completed' || toState === 'available')) {
    return '#D4A574'
  }
  return '#D4C4B0'
}

function getNodeBgClass(node: PathNode): string {
  const state = getNodeState(node)
  if (state === 'completed') return 'bg-macaron-card'
  if (state === 'available') return 'bg-macaron-card'
  return 'bg-macaron-border/20'
}

function handleCardClick(node: PathNode) {
  if (!isCardLearned(node.cardId)) {
    markCardLearned(node.cardId)
    refreshProgress()
  }
}

const showDeleteConfirm = ref(false)
async function confirmDeletePath() {
  if (!path) return
  const result = await deletePath(path.id)
  if (result.ok) {
    navigateTo('/paths')
  } else {
    alert(result.error || '删除失败')
  }
  showDeleteConfirm.value = false
}
</script>
