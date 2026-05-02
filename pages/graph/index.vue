<template>
  <div class="graph-page relative w-full" style="height: calc(100vh - 64px)">
    <!-- Control Panel -->
    <GraphControlPanel
      v-model:collapsed="panelCollapsed"
      v-model:mobileDrawerOpen="mobileDrawerOpen"
      v-model:searchQuery="searchQuery"
      :is-mobile="isMobile"
      :available-categories="availableCategories"
      :enabled-categories="enabledCategories"
      :all-checked="allChecked"
      :stats="displayStats"
      :get-category-count="getCategoryCount"
      @toggle-category="toggleCategory"
      @toggle-all="toggleAllCategories"
      @reset-zoom="resetZoom"
      @reset-simulation="resetSimulation"
    />

    <!-- SVG Container -->
    <div ref="svgContainer" class="w-full h-full bg-macaron-graph-bg">
      <!-- Loading indicator -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center z-10 bg-macaron-graph-bg/80"
      >
        <div class="flex flex-col items-center gap-3">
          <Icon name="lucide:loader-2" class="w-8 h-8 text-macaron-cta animate-spin" />
          <span class="text-sm text-macaron-text-secondary">加载知识图谱...</span>
        </div>
      </div>

      <!-- Tooltip -->
      <div
        v-if="tooltip.visible"
        class="absolute z-30 bg-macaron-card/95 backdrop-blur-sm border border-macaron-border rounded-lg px-3 py-2 shadow-lg pointer-events-none transition-opacity"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="text-sm font-medium text-macaron-text">{{ tooltip.label }}</div>
        <div class="text-xs text-macaron-text-secondary">{{ tooltip.category }}</div>
      </div>
    </div>

    <!-- Detail Panel -->
    <GraphDetailPanel
      :card-data="selectedCardData"
      :is-mobile="isMobile"
      @close="selectedNode = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category, KnowledgeCard } from '~/types'
import { CATEGORIES, getCategoryMeta } from '~/types'
import { getAllCards } from '~/utils/cards'
import { buildGraphData, getCategoryGraphData } from '~/utils/graph-data'
import type { GraphNode, GraphData } from '~/utils/graph-data'
import { useGraphSimulation } from '~/composables/useGraphSimulation'

const {
  isLoading,
  displayStats,
  initSVG,
  updateGraph,
  resetZoom,
  resetSimulation,
  handleResize,
  applySearchHighlight,
  destroy,
  svgInitialized,
} = useGraphSimulation()

// --- State ---
const svgContainer = ref<HTMLElement | null>(null)
const panelCollapsed = ref(false)
const mobileDrawerOpen = ref(false)
const searchQuery = ref('')
const selectedNode = ref<GraphNode | null>(null)
const enabledCategories = ref<Set<Category>>(new Set(CATEGORIES.map(c => c.id)))
const tooltip = reactive({ visible: false, x: 0, y: 0, label: '', category: '' })
const isMobile = ref(false)

// --- Data ---
const { data: allCards } = await useAsyncData('graph-cards', () => getAllCards())
const cards = computed(() => allCards.value ?? [])
const cardsById = computed(() => new Map(cards.value.map(c => [c.id, c])))

// --- Computed ---
const availableCategories = computed(() => {
  const usedCategories = new Set(cards.value.map(c => c.category))
  return CATEGORIES.filter(c => usedCategories.has(c.id))
})

const allChecked = computed(() => {
  return availableCategories.value.every(c => enabledCategories.value.has(c.id))
})

const selectedCardData = computed(() => {
  if (!selectedNode.value) return null
  const card = cardsById.value.get(selectedNode.value.id)
  if (!card) return null
  const meta = getCategoryMeta(card.category)
  const related = card.relatedCards
    .map(id => cardsById.value.get(id))
    .filter(Boolean) as KnowledgeCard[]
  return {
    card,
    categoryColor: meta.color,
    categoryName: meta.name,
    categoryIcon: meta.icon,
    relatedCards: related,
  }
})

// --- Methods ---
function getCategoryCount(categoryId: Category): number {
  return cards.value.filter(c => c.category === categoryId).length
}

function toggleCategory(categoryId: Category) {
  const next = new Set(enabledCategories.value)
  if (next.has(categoryId)) next.delete(categoryId)
  else next.add(categoryId)
  enabledCategories.value = next
  rebuildGraph()
}

function toggleAllCategories() {
  if (allChecked.value) enabledCategories.value = new Set()
  else enabledCategories.value = new Set(availableCategories.value.map(c => c.id))
  rebuildGraph()
}

async function rebuildGraph() {
  if (!import.meta.client || !svgInitialized.value) return
  isLoading.value = true

  const categories = Array.from(enabledCategories.value) as Category[]
  const data = categories.length === availableCategories.value.length
    ? await buildGraphData()
    : await getCategoryGraphData(categories)

  const container = svgContainer.value
  if (!container) { isLoading.value = false; return }

  await updateGraph(data, container, {
    onNodeHover: (event, node) => {
      tooltip.visible = true
      tooltip.label = node.label
      tooltip.category = node.categoryLabel
      updateTooltipPosition(event)
    },
    onNodeMove: (event) => updateTooltipPosition(event),
    onNodeLeave: () => { tooltip.visible = false },
    onNodeClick: (node) => { selectedNode.value = node },
    onBackgroundClick: () => { selectedNode.value = null },
  })

  isLoading.value = false
}

function updateTooltipPosition(event: MouseEvent) {
  const container = svgContainer.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  tooltip.x = event.clientX - rect.left + 12
  tooltip.y = event.clientY - rect.top - 10

  const maxX = rect.width - 200
  const maxY = rect.height - 60
  if (tooltip.x > maxX) tooltip.x = event.clientX - rect.left - 160
  if (tooltip.y > maxY) tooltip.y = event.clientY - rect.top - 50
}

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

// --- Watch ---
watch(searchQuery, (q) => {
  applySearchHighlight(q)
})

// --- Lifecycle ---
onMounted(async () => {
  if (!import.meta.client) return
  checkMobile()
  isLoading.value = true

  await nextTick()
  const container = svgContainer.value
  if (container) await initSVG(container)
  await rebuildGraph()
  isLoading.value = false

  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  destroy()
  window.removeEventListener('resize', onResize)
})

let resizeTimeout: ReturnType<typeof setTimeout> | null = null
function onResize() {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    checkMobile()
    handleResize()
  }, 250)
}
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--macaron-border);
  border-radius: 4px;
}

:deep(svg) {
  user-select: none;
  -webkit-user-select: none;
}
</style>
