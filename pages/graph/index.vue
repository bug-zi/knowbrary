<template>
  <div class="graph-page relative w-full" style="height: calc(100vh - 64px)">
    <!-- Control Panel (left) -->
    <div
      class="absolute top-0 left-0 z-20 w-64 bg-macaron-card/95 backdrop-blur-sm border-r border-macaron-border h-full overflow-y-auto shadow-lg transition-transform duration-300"
      :class="panelCollapsed ? '-translate-x-full' : 'translate-x-0'"
    >
      <div class="p-4">
        <!-- Panel toggle button -->
        <button
          class="absolute -right-10 top-3 bg-macaron-card border border-macaron-border rounded-r-lg px-2 py-2 shadow-sm hover:bg-macaron-bg transition-colors text-macaron-text-secondary"
          @click="panelCollapsed = !panelCollapsed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="panelCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 class="text-lg font-bold text-macaron-text mb-4"><Icon name="lucide:share-2" class="inline w-5 h-5 align-text-bottom" /> 知识图谱</h2>

        <!-- Search -->
        <div class="mb-4">
          <label class="text-xs text-macaron-text-secondary mb-1 block">搜索节点</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="输入关键词..."
            class="w-full px-3 py-2 text-sm border border-macaron-border rounded-lg bg-macaron-bg focus:outline-none focus:ring-2 focus:ring-macaron-cta/40 transition-shadow"
          />
        </div>

        <!-- Category Filters -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs text-macaron-text-secondary">分类筛选</label>
            <button
              class="text-xs text-macaron-cta hover:text-macaron-cta-hover transition-colors"
              @click="toggleAllCategories"
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
                @change="toggleCategory(cat.id)"
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
            @click="resetZoom"
          >
            重置视图
          </button>
          <button
            class="w-full px-3 py-2 text-sm bg-macaron-bg hover:bg-macaron-border rounded-lg transition-colors text-macaron-text-secondary"
            @click="resetSimulation"
          >
            重新布局
          </button>
        </div>

        <!-- Stats -->
        <div class="text-xs text-macaron-text-secondary border-t border-macaron-border pt-3">
          <div class="flex justify-between mb-1">
            <span>显示节点</span>
            <span class="font-medium text-macaron-text">{{ filteredNodeCount }}</span>
          </div>
          <div class="flex justify-between">
            <span>连接数</span>
            <span class="font-medium text-macaron-text">{{ filteredLinkCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SVG Container -->
    <div ref="svgContainer" class="w-full h-full bg-macaron-graph-bg">
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

    <!-- Detail Panel (right) -->
    <Transition name="slide-right">
      <div
        v-if="selectedNode"
        class="absolute top-0 right-0 z-20 w-80 h-full bg-macaron-card/95 backdrop-blur-sm border-l border-macaron-border shadow-lg overflow-y-auto"
      >
        <div class="p-5">
          <!-- Close button -->
          <button
            class="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-macaron-bg transition-colors text-macaron-text-secondary"
            @click="selectedNode = null"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <template v-if="selectedCardData">
            <!-- Category badge -->
            <span
              class="inline-block text-xs px-2 py-1 rounded-full mb-3"
              :style="{ backgroundColor: selectedCardData.categoryColor + '40' }"
            >
              {{ selectedCardData.categoryIcon }} {{ selectedCardData.categoryName }}
            </span>

            <!-- Title -->
            <h3 class="text-xl font-bold text-macaron-text mb-2 pr-8">{{ selectedCardData.card.title }}</h3>

            <!-- OneLiner -->
            <p class="text-sm text-macaron-text-secondary mb-4">{{ selectedCardData.card.oneLiner }}</p>

            <!-- Difficulty -->
            <span :class="`badge-${selectedCardData.card.difficulty} mb-4 inline-block`">
              <Icon :name="difficultyLabels[selectedCardData.card.difficulty].icon" class="inline w-3.5 h-3.5 align-text-bottom" />
              {{ difficultyLabels[selectedCardData.card.difficulty].label }}
            </span>

            <!-- Tags -->
            <div v-if="selectedCardData.card.tags.length" class="flex flex-wrap gap-1.5 mb-5">
              <span
                v-for="tag in selectedCardData.card.tags"
                :key="tag"
                class="text-xs px-2 py-0.5 rounded-full bg-macaron-bg text-macaron-text-secondary"
              >
                #{{ tag }}
              </span>
            </div>

            <!-- Related Cards -->
            <div v-if="selectedCardData.relatedCards.length" class="mb-5">
              <h4 class="text-sm font-semibold text-macaron-text mb-2">知识邻居</h4>
              <div class="space-y-1.5">
                <NuxtLink
                  v-for="related in selectedCardData.relatedCards"
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
              :to="`/cards/${selectedCardData.card.slug}`"
              class="block w-full text-center px-4 py-2.5 rounded-xl text-white text-sm font-medium no-underline transition-colors"
              :style="{ backgroundColor: 'var(--macaron-cta)' }"
            >
              查看完整卡片
            </NuxtLink>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Category, KnowledgeCard } from '~/types'
import { CATEGORIES, getCategoryMeta, DIFFICULTY_LABELS } from '~/types'
import { getAllCards } from '~/utils/cards'
import { buildGraphData, getCategoryGraphData } from '~/utils/graph-data'
import type { GraphNode, GraphLink, GraphData } from '~/utils/graph-data'

const difficultyLabels = DIFFICULTY_LABELS

// --- State ---
const svgContainer = ref<HTMLElement | null>(null)
const panelCollapsed = ref(false)
const searchQuery = ref('')
const selectedNode = ref<GraphNode | null>(null)
const enabledCategories = ref<Set<Category>>(new Set(CATEGORIES.map(c => c.id)))
const tooltip = reactive({ visible: false, x: 0, y: 0, label: '', category: '' })

// --- D3 internals (not reactive, only used on client) ---
let simulation: any = null
let svgSel: any = null
let g: any = null
let zoomBehavior: any = null
let linkElements: any = null
let nodeElements: any = null
let labelElements: any = null
let currentData: GraphData | null = null
let zoomIdentityRef: any = null

// --- Preload cards via Supabase ---
const { data: allCards } = await useAsyncData('graph-cards', () => getAllCards())
const cards = computed(() => allCards.value ?? [])

// --- Computed ---
const availableCategories = computed(() => {
  const usedCategories = new Set(cards.value.map(c => c.category))
  return CATEGORIES.filter(c => usedCategories.has(c.id))
})

const allChecked = computed(() => {
  return availableCategories.value.every(c => enabledCategories.value.has(c.id))
})

const filteredNodeCount = computed(() => {
  if (!currentData) return 0
  return currentData.nodes.filter(n => enabledCategories.value.has(n.category)).length
})

const filteredLinkCount = computed(() => {
  if (!currentData) return 0
  const validIds = new Set(
    currentData.nodes
      .filter(n => enabledCategories.value.has(n.category))
      .map(n => n.id)
  )
  return currentData.links.filter(l => {
    const s = typeof l.source === 'string' ? l.source : l.source.id
    const t = typeof l.target === 'string' ? l.target : l.target.id
    return validIds.has(s) && validIds.has(t)
  }).length
})

const selectedCardData = computed(() => {
  if (!selectedNode.value) return null
  const card = cards.value.find(c => c.id === selectedNode.value!.id)
  if (!card) return null
  const meta = getCategoryMeta(card.category)
  const related = card.relatedCards
    .map(id => cards.value.find(c => c.id === id))
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
  if (next.has(categoryId)) {
    next.delete(categoryId)
  } else {
    next.add(categoryId)
  }
  enabledCategories.value = next
  rebuildGraph()
}

function toggleAllCategories() {
  if (allChecked.value) {
    enabledCategories.value = new Set()
  } else {
    enabledCategories.value = new Set(availableCategories.value.map(c => c.id))
  }
  rebuildGraph()
}

function resetZoom() {
  if (!svgSel || !zoomBehavior || !zoomIdentityRef) return
  svgSel.transition().duration(500).call(
    zoomBehavior.transform,
    zoomIdentityRef
  )
}

function resetSimulation() {
  if (!currentData) return
  if (simulation) simulation.stop()

  for (const node of currentData.nodes) {
    node.x = undefined
    node.y = undefined
    node.fx = null
    node.fy = null
  }

  rebuildGraph()
}

async function rebuildGraph() {
  if (!import.meta.client) return

  const categories = Array.from(enabledCategories.value) as Category[]
  const data = categories.length === availableCategories.value.length
    ? await buildGraphData()
    : await getCategoryGraphData(categories)

  currentData = data
  renderGraph(data)
}

// --- D3 Rendering ---
async function renderGraph(data: GraphData) {
  // Dynamic imports for client-only D3 modules
  const d3Force = await import('d3-force')
  const d3Selection = await import('d3-selection')
  const d3Zoom = await import('d3-zoom')
  const d3Drag = await import('d3-drag')

  const { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } = d3Force
  const { select } = d3Selection
  const { zoom: zoomFn, zoomIdentity } = d3Zoom
  const { drag: dragFn } = d3Drag

  // Store zoomIdentity for resetZoom
  zoomIdentityRef = zoomIdentity

  const container = svgContainer.value
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  // Clean up existing SVG
  select(container).select('svg').remove()

  if (simulation) {
    simulation.stop()
    simulation = null
  }

  if (data.nodes.length === 0) return

  // Build connection count map for sizing
  const connectionCount = new Map<string, number>()
  for (const node of data.nodes) {
    connectionCount.set(node.id, 0)
  }
  for (const link of data.links) {
    const sid = typeof link.source === 'string' ? link.source : link.source.id
    const tid = typeof link.target === 'string' ? link.target : link.target.id
    connectionCount.set(sid, (connectionCount.get(sid) || 0) + 1)
    connectionCount.set(tid, (connectionCount.get(tid) || 0) + 1)
  }

  // Determine node radius (6 to 14 based on connections)
  function nodeRadius(node: GraphNode): number {
    const count = connectionCount.get(node.id) || 0
    const minR = 6
    const maxR = 14
    const maxConn = Math.max(...Array.from(connectionCount.values()), 1)
    return minR + (count / maxConn) * (maxR - minR)
  }

  // Create SVG
  svgSel = select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', [0, 0, width, height] as any)
    .style('cursor', 'grab')

  // Background rect to capture zoom events
  svgSel.append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', 'var(--macaron-graph-bg)')

  // Defs for drop shadow filter
  const defs = svgSel.append('defs')
  const filter = defs.append('filter')
    .attr('id', 'node-shadow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%')
  filter.append('feDropShadow')
    .attr('dx', 0)
    .attr('dy', 1)
    .attr('stdDeviation', 2)
    .attr('flood-color', 'rgba(0,0,0,0.1)')

  // Zoom group
  g = svgSel.append('g')

  // Zoom behavior
  zoomBehavior = zoomFn()
    .scaleExtent([0.3, 4])
    .on('zoom', (event: any) => {
      g.attr('transform', event.transform)
    })

  svgSel.call(zoomBehavior)

  // Links (curved paths)
  linkElements = g.append('g')
    .attr('class', 'links')
    .selectAll('path')
    .data(data.links)
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', (d: GraphLink) => {
      return d.type === 'cross-category' ? 'var(--macaron-svg-guide)' : 'var(--macaron-border)'
    })
    .attr('stroke-width', (d: GraphLink) => {
      return d.type === 'cross-category' ? 2 : 1
    })
    .attr('stroke-dasharray', (d: GraphLink) => {
      return d.type === 'cross-category' ? '6,3' : 'none'
    })
    .attr('opacity', 0.5)

  // Node groups
  const nodeGroup = g.append('g')
    .attr('class', 'nodes')

  nodeElements = nodeGroup
    .selectAll('g')
    .data(data.nodes)
    .join('g')
    .style('cursor', 'pointer')

  // Node circles
  nodeElements
    .append('circle')
    .attr('r', (d: GraphNode) => nodeRadius(d))
    .attr('fill', (d: GraphNode) => d.color)
    .attr('stroke', 'var(--macaron-card)')
    .attr('stroke-width', 2)
    .attr('filter', 'url(#node-shadow)')

  // Node labels (hidden by default, shown on hover)
  labelElements = nodeElements
    .append('text')
    .text((d: GraphNode) => d.label)
    .attr('font-size', 11)
    .attr('dx', (d: GraphNode) => nodeRadius(d) + 4)
    .attr('dy', 4)
    .attr('fill', 'var(--macaron-text)')
    .attr('opacity', 0)
    .style('pointer-events', 'none')
    .style('user-select', 'none')

  // --- Interaction: hover ---
  nodeElements
    .on('mouseenter', (event: MouseEvent, d: GraphNode) => {
      // Show label
      select(event.currentTarget as SVGGElement)
        .select('text')
        .attr('opacity', 1)

      // Highlight connected links
      linkElements
        .attr('opacity', (l: GraphLink) => {
          const s = typeof l.source === 'string' ? l.source : l.source.id
          const t = typeof l.target === 'string' ? l.target : l.target.id
          return s === d.id || t === d.id ? 0.8 : 0.15
        })
        .attr('stroke-width', (l: GraphLink) => {
          const s = typeof l.source === 'string' ? l.source : l.source.id
          const t = typeof l.target === 'string' ? l.target : l.target.id
          return s === d.id || t === d.id ? 3 : (l.type === 'cross-category' ? 2 : 1)
        })

      // Dim other nodes
      nodeElements
        .select('circle')
        .attr('opacity', (n: GraphNode) => {
          if (n.id === d.id) return 1
          const connected = data.links.some(l => {
            const s = typeof l.source === 'string' ? l.source : l.source.id
            const t = typeof l.target === 'string' ? l.target : l.target.id
            return (s === d.id && t === n.id) || (t === d.id && s === n.id)
          })
          return connected ? 1 : 0.25
        })

      // Show tooltip
      const rect = container.getBoundingClientRect()
      tooltip.visible = true
      tooltip.label = d.label
      const meta = getCategoryMeta(d.category)
      tooltip.category = meta.name
      updateTooltipPosition(event, rect)
    })
    .on('mousemove', (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      updateTooltipPosition(event, rect)
    })
    .on('mouseleave', () => {
      // Hide label
      nodeElements.select('text').attr('opacity', 0)

      // Reset link styles
      linkElements
        .attr('opacity', 0.5)
        .attr('stroke-width', (l: GraphLink) =>
          l.type === 'cross-category' ? 2 : 1
        )

      // Reset node opacity
      nodeElements.select('circle').attr('opacity', 1)

      tooltip.visible = false
    })
    .on('click', (_event: MouseEvent, d: GraphNode) => {
      selectedNode.value = d
    })

  // --- Interaction: drag ---
  const drag = dragFn()
    .on('start', (event: any, d: GraphNode) => {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    })
    .on('drag', (event: any, d: GraphNode) => {
      d.fx = event.x
      d.fy = event.y
    })
    .on('end', (event: any, d: GraphNode) => {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    })

  nodeElements.call(drag)

  // Click on background to deselect
  svgSel.on('click', (event: MouseEvent) => {
    if (event.target === svgSel.node() || (event.target as Element)?.tagName === 'rect') {
      selectedNode.value = null
    }
  })

  // --- Force simulation ---
  simulation = forceSimulation(data.nodes)
    .force(
      'link',
      forceLink(data.links)
        .id((d: any) => d.id)
        .distance(80)
    )
    .force('charge', forceManyBody().strength(-200))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide().radius((d: GraphNode) => nodeRadius(d) + 4))

  simulation.on('tick', () => {
    linkElements.attr('d', (d: any) => {
      const dx = (d.target.x || 0) - (d.source.x || 0)
      const dy = (d.target.y || 0) - (d.source.y || 0)
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.2
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`
    })

    nodeElements.attr('transform', (d: GraphNode) => `translate(${d.x || 0},${d.y || 0})`)
  })

  // Apply search highlight if query exists
  applySearchHighlight()
}

function updateTooltipPosition(event: MouseEvent, rect: DOMRect) {
  tooltip.x = event.clientX - rect.left + 12
  tooltip.y = event.clientY - rect.top - 10

  // Keep tooltip within bounds
  const maxX = rect.width - 200
  const maxY = rect.height - 60
  if (tooltip.x > maxX) tooltip.x = event.clientX - rect.left - 160
  if (tooltip.y > maxY) tooltip.y = event.clientY - rect.top - 50
}

function applySearchHighlight() {
  if (!nodeElements || !linkElements) return

  const query = searchQuery.value.toLowerCase().trim()

  if (!query) {
    nodeElements.select('circle')
      .attr('stroke', 'var(--macaron-card)')
      .attr('stroke-width', 2)
    return
  }

  nodeElements.select('circle')
    .attr('stroke', (d: GraphNode) => {
      return d.label.toLowerCase().includes(query) ? 'var(--macaron-cta)' : 'var(--macaron-card)'
    })
    .attr('stroke-width', (d: GraphNode) => {
      return d.label.toLowerCase().includes(query) ? 3 : 2
    })
}

// --- Watch search query ---
watch(searchQuery, () => {
  applySearchHighlight()
})

// --- Lifecycle ---
onMounted(() => {
  if (!import.meta.client) return

  nextTick(() => {
    rebuildGraph()
  })

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (simulation) {
    simulation.stop()
    simulation = null
  }
  window.removeEventListener('resize', handleResize)
})

let resizeTimeout: ReturnType<typeof setTimeout> | null = null
function handleResize() {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    if (currentData) {
      renderGraph(currentData)
    }
  }, 250)
}
</script>

<style scoped>
/* Slide-in transition for detail panel */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

/* Custom scrollbar for panels */
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

/* SVG text selection prevention */
:deep(svg) {
  user-select: none;
  -webkit-user-select: none;
}
</style>
