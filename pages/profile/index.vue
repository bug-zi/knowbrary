<template>
  <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
    <!-- Section 1: User Header -->
    <section class="card-base text-center">
      <template v-if="isLoggedIn">
        <div class="relative inline-block mb-3">
          <img
            v-if="authProfile?.avatarUrl"
            :src="authProfile.avatarUrl"
            alt="avatar"
            class="w-20 h-20 rounded-full object-cover mx-auto border-2 border-macaron-border"
          />
          <div v-else class="w-20 h-20 rounded-full bg-macaron-cta/20 flex items-center justify-center mx-auto text-3xl font-bold text-macaron-cta">
            {{ userInitial }}
          </div>
          <button
            class="absolute bottom-0 right-0 w-7 h-7 bg-macaron-card rounded-full shadow border border-macaron-border flex items-center justify-center hover:bg-macaron-border/30"
            @click="showProfileEditor = true"
          >
            <Icon name="lucide:pencil" class="w-3.5 h-3.5 text-macaron-text-secondary" />
          </button>
        </div>
        <h1 class="text-2xl font-bold text-macaron-text">{{ authProfile?.username || authProfile?.fullName || '万象研究所学员' }}</h1>
        <p v-if="authProfile?.bio" class="text-sm text-macaron-text-secondary mt-1">{{ authProfile.bio }}</p>
      </template>
      <template v-else>
        <div class="text-6xl mb-3"><Icon name="lucide:microscope" class="text-6xl" /></div>
        <h1 class="text-2xl font-bold text-macaron-text">万象研究所学员</h1>
        <p class="text-macaron-text-secondary mt-1">
          <NuxtLink to="/login?redirect=/profile" class="text-macaron-cta hover:underline no-underline">登录账号</NuxtLink>
          保存你的学习进度
        </p>
      </template>
      <p class="text-macaron-text-secondary mt-1">{{ joinText }}</p>
      <div class="flex items-center justify-center gap-6 mt-4 text-sm">
        <div class="text-center">
          <div class="text-xl font-bold text-macaron-cta">{{ stats.totalLearned }}</div>
          <div class="text-macaron-text-secondary">已学</div>
        </div>
        <div class="w-px h-8 bg-macaron-border" />
        <div class="text-center">
          <div class="text-xl font-bold text-macaron-cta">{{ stats.favoriteCount }}</div>
          <div class="text-macaron-text-secondary">收藏</div>
        </div>
        <div class="w-px h-8 bg-macaron-border" />
        <NuxtLink to="/checkin" class="text-center no-underline">
          <div class="text-xl font-bold text-macaron-cta">{{ checkinDays }}</div>
          <div class="text-macaron-text-secondary">打卡</div>
        </NuxtLink>
      </div>
    </section>

    <!-- Migration banner -->
    <section v-if="isLoggedIn && hasLocalData" class="card-base border-macaron-cta/30 bg-macaron-cta/5">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-macaron-text">发现本地学习数据</div>
          <p class="text-xs text-macaron-text-secondary mt-0.5">将本地学习记录合并到你的账号中</p>
        </div>
        <button
          class="px-4 py-2 bg-macaron-cta text-white rounded-card text-sm hover:bg-macaron-cta-hover transition-colors"
          @click="handleMigrate"
        >
          合并数据
        </button>
      </div>
    </section>

    <!-- Profile Editor -->
    <AuthProfileEditor :show="showProfileEditor" @close="showProfileEditor = false" />
    <section class="card-base">
      <h2 class="text-lg font-bold text-macaron-text mb-3"><Icon name="lucide:calendar" class="inline w-5 h-5 align-text-bottom" /> 学习热力图</h2>
      <p class="text-sm text-macaron-text-secondary mb-4">过去 16 周学习了 <span class="font-semibold text-macaron-text">{{ heatmapTotal }}</span> 张卡片</p>

      <!-- Month labels -->
      <div class="overflow-x-auto">
        <div class="inline-block min-w-[680px]">
          <div class="flex mb-1 text-xs text-macaron-text-secondary" style="padding-left: 28px;">
            <div
              v-for="month in monthLabels"
              :key="month.label + month.offset"
              class="text-xs"
              :style="{ marginLeft: month.offset > 0 ? '0' : '0', width: 'auto', position: 'relative', left: month.offset + 'px' }"
            >
              {{ month.label }}
            </div>
          </div>

          <div class="flex">
            <!-- Day labels -->
            <div class="flex flex-col gap-[3px] mr-1 text-xs text-macaron-text-secondary" style="width: 24px;">
              <div style="height: 12px; line-height: 12px;" />
              <div style="height: 12px; line-height: 12px;">一</div>
              <div style="height: 12px; line-height: 12px;" />
              <div style="height: 12px; line-height: 12px;">三</div>
              <div style="height: 12px; line-height: 12px;" />
              <div style="height: 12px; line-height: 12px;">五</div>
              <div style="height: 12px; line-height: 12px;" />
            </div>

            <!-- Heatmap grid: 16 columns (weeks), 7 rows (days) -->
            <div class="flex gap-[3px]">
              <div v-for="(week, wi) in heatmapWeeks" :key="wi" class="flex flex-col gap-[3px]">
                <div
                  v-for="(day, di) in week"
                  :key="di"
                  class="rounded-sm cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-macaron-cta/40"
                  :style="{
                    width: '12px',
                    height: '12px',
                    backgroundColor: getHeatmapColor(day.count),
                  }"
                  :title="day.date ? `${day.date}: ${day.count} 张卡片` : ''"
                  @mouseenter="showTooltip($event, day)"
                  @mouseleave="hideTooltip"
                />
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="flex items-center justify-end gap-1 mt-2 text-xs text-macaron-text-secondary">
            <span>少</span>
            <div class="rounded-sm" style="width:12px;height:12px;background-color:#ebedf0;" />
            <div class="rounded-sm" style="width:12px;height:12px;background-color:#9be9a8;" />
            <div class="rounded-sm" style="width:12px;height:12px;background-color:#40c463;" />
            <div class="rounded-sm" style="width:12px;height:12px;background-color:#30a14e;" />
            <span>多</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Tooltip overlay -->
    <div
      v-if="tooltip.visible"
      class="fixed z-50 bg-macaron-text text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none shadow-lg"
      :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
    >
      {{ tooltip.text }}
    </div>

    <!-- Section 3: Knowledge Radar Chart -->
    <section class="card-base">
      <h2 class="text-lg font-bold text-macaron-text mb-4"><Icon name="lucide:radar" class="inline w-5 h-5 align-text-bottom" /> 知识雷达图</h2>

      <!-- SVG Radar -->
      <div class="flex justify-center mb-6">
        <svg :width="radarSize" :height="radarSize" :viewBox="`0 0 ${radarSize} ${radarSize}`">
          <!-- Concentric guide circles -->
          <circle
            v-for="i in 5"
            :key="'circle-' + i"
            :cx="center"
            :cy="center"
            :r="radius * (i / 5)"
            fill="none"
            stroke="var(--macaron-svg-guide)"
            stroke-width="0.5"
          />

          <!-- Axis lines -->
          <line
            v-for="i in radarAxes"
            :key="'axis-' + i"
            :x1="center"
            :y1="center"
            :x2="center + radius * Math.cos(radarAngle(i) - Math.PI / 2)"
            :y2="center + radius * Math.sin(radarAngle(i) - Math.PI / 2)"
            stroke="var(--macaron-svg-guide)"
            stroke-width="0.5"
          />

          <!-- Total area (background) -->
          <polygon
            v-if="radarAxes > 0"
            :points="radarTotalPoints"
            fill="#6F4E3710"
            stroke="#6F4E3730"
            stroke-width="1"
          />

          <!-- Learned area (foreground) -->
          <polygon
            v-if="radarAxes > 0"
            :points="radarLearnedPoints"
            fill="#6F4E3740"
            stroke="#6F4E37"
            stroke-width="1.5"
          />

          <!-- Axis labels -->
          <text
            v-for="(cat, i) in radarData.categories"
            :key="'label-' + i"
            :x="labelX(i)"
            :y="labelY(i)"
            text-anchor="middle"
            dominant-baseline="middle"
            class="text-xs fill-macaron-text"
            style="font-size: 11px;"
          >
            <Icon :name="radarData.icons[i]" class="inline w-3.5 h-3.5" /> {{ cat }}
          </text>
        </svg>
      </div>

      <!-- Per-category progress bars -->
      <div class="space-y-3">
        <div v-for="(cat, i) in radarData.categories" :key="'bar-' + i" class="flex items-center gap-3">
          <span class="text-sm flex-shrink-0 w-24 truncate inline-flex items-center gap-1" :title="cat"><Icon :name="radarData.icons[i]" class="w-3.5 h-3.5 flex-shrink-0" /> {{ cat }}</span>
          <div class="flex-1 h-4 bg-macaron-border/40 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{
                width: radarData.total[i] > 0 ? (radarData.learned[i] / radarData.total[i] * 100) + '%' : '0%',
                backgroundColor: radarData.colors[i],
              }"
            />
          </div>
          <span class="text-xs text-macaron-text-secondary flex-shrink-0 w-16 text-right">
            {{ radarData.learned[i] }}/{{ radarData.total[i] }}
          </span>
        </div>
      </div>
    </section>

    <!-- Section 4: Settings -->
    <section class="card-base">
      <h2 class="text-lg font-bold text-macaron-text mb-4"><Icon name="lucide:settings" class="inline w-5 h-5 align-text-bottom" /> 设置</h2>
      <div class="space-y-4">
        <!-- AI Config Link -->
        <div class="flex items-center justify-between pt-2 border-t border-macaron-border">
          <div>
            <div class="text-sm font-medium text-macaron-text">AI 模型配置</div>
            <div class="text-xs text-macaron-text-secondary">配置 DeepSeek、智谱、豆包、千问、GPT</div>
          </div>
          <NuxtLink to="/profile/ai" class="px-4 py-2 rounded-xl text-sm border border-macaron-border hover:bg-macaron-bg transition-colors no-underline text-macaron-text">
            <Icon name="lucide:bot" class="inline w-4 h-4 align-text-bottom" /> 前往配置
          </NuxtLink>
        </div>

        <!-- Clear data -->
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-macaron-text">清除数据</div>
            <div class="text-xs text-macaron-text-secondary">删除所有学习记录和收藏</div>
          </div>
          <button
            class="px-4 py-2 rounded-xl text-sm border border-red-200 text-red-500 hover:bg-macaron-danger-hover transition-colors"
            @click="showClearConfirm = true"
          >
            清除全部
          </button>
        </div>
      </div>

      <!-- Clear confirmation modal -->
      <div v-if="showClearConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showClearConfirm = false">
        <div class="bg-macaron-card rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
          <h3 class="text-lg font-bold text-macaron-text mb-2">确认清除数据？</h3>
          <p class="text-sm text-macaron-text-secondary mb-4">此操作将删除所有学习进度、收藏和打卡记录，且不可恢复。</p>
          <div class="flex gap-3 justify-end">
            <button
              class="px-4 py-2 rounded-xl text-sm border border-macaron-border hover:bg-macaron-border/30 transition-colors"
              @click="showClearConfirm = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 rounded-xl text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
              @click="clearAllData"
            >
              确认清除
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- App version -->
    <div class="text-center text-xs text-macaron-text-secondary pb-4">
      万象研究所 v1.0
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAllCards } from '~/utils/cards'
import { getLearnedCardIds } from '~/utils/progress'
import { getCategoryMeta, CATEGORIES } from '~/types'
import {
  getLearningStats,
  getHeatmapData,
  getRadarData,
  getCheckinTotalDays,
} from '~/utils/stats'
import type { LearningStats } from '~/utils/stats'

// --- Auth ---
const { isLoggedIn, profile: authProfile } = useAuth()
const { hasLocalData, migrateLocalData } = useMigration()

const showProfileEditor = ref(false)
const userInitial = computed(() => {
  if (authProfile.value?.username) return authProfile.value.username[0].toUpperCase()
  if (authProfile.value?.fullName) return authProfile.value.fullName[0]
  return 'U'
})

async function handleMigrate() {
  const { migrated } = await migrateLocalData()
  alert(`成功合并 ${migrated} 条数据`)
  await loadData()
}

// --- Reactive state ---
const stats = ref<LearningStats>({
  totalLearned: 0,
  totalCards: 0,
  categories: {},
  streak: 0,
  totalDaysActive: 0,
  favoriteCount: 0,
  quizCount: 0,
})

const showClearConfirm = ref(false)
const joinText = ref('今天刚来')
const checkinDays = ref(0)

// Heatmap
const heatmapData = ref<Record<string, number>>({})
const heatmapWeeks = ref<Array<Array<{ date: string; count: number }>>>([])
const monthLabels = ref<Array<{ label: string; offset: number }>>([])
const heatmapTotal = ref(0)

// Radar
const radarData = ref<{ categories: string[]; icons: string[]; colors: string[]; learned: number[]; total: number[] }>({
  categories: [],
  icons: [],
  colors: [],
  learned: [],
  total: [],
})
const radarSize = 360
const center = radarSize / 2
const radius = 130

// Tooltip
const tooltip = ref({ visible: false, x: 0, y: 0, text: '' })

// --- Radar computed ---
const radarAxes = computed(() => radarData.value.categories.length)

function radarAngle(i: number): number {
  return (2 * Math.PI * i) / radarAxes.value
}

const radarTotalPoints = computed(() => {
  const axes = radarAxes.value
  if (axes === 0) return ''
  const points: string[] = []
  for (let i = 0; i < axes; i++) {
    const angle = radarAngle(i) - Math.PI / 2
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)
    points.push(`${x},${y}`)
  }
  return points.join(' ')
})

const radarLearnedPoints = computed(() => {
  const axes = radarAxes.value
  if (axes === 0) return ''
  const points: string[] = []
  for (let i = 0; i < axes; i++) {
    const angle = radarAngle(i) - Math.PI / 2
    const totalVal = radarData.value.total[i] || 1
    const ratio = radarData.value.learned[i] / totalVal
    const r = radius * ratio
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    points.push(`${x},${y}`)
  }
  return points.join(' ')
})

function labelX(i: number): number {
  const angle = radarAngle(i) - Math.PI / 2
  return center + (radius + 24) * Math.cos(angle)
}

function labelY(i: number): number {
  const angle = radarAngle(i) - Math.PI / 2
  return center + (radius + 24) * Math.sin(angle)
}

// --- Heatmap helpers ---
function getHeatmapColor(count: number): string {
  if (count === 0) return '#ebedf0'
  if (count <= 2) return '#9be9a8'
  if (count <= 5) return '#40c463'
  return '#30a14e'
}

function showTooltip(event: MouseEvent, day: { date: string; count: number }) {
  if (!day.date) return
  tooltip.value = {
    visible: true,
    x: event.clientX + 10,
    y: event.clientY - 30,
    text: day.count > 0 ? `${day.date}: ${day.count} 张卡片` : `${day.date}: 无学习记录`,
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

// --- Clear data ---
async function clearAllData() {
  if (!import.meta.client) return
  localStorage.removeItem('wanxiang-favorites')
  localStorage.removeItem('wanxiang-learned')
  localStorage.removeItem('wanxiang-learned-dates')
  localStorage.removeItem('wanxiang-progress')
  localStorage.removeItem('wanxiang-quiz-results')
  localStorage.removeItem('wanxiang-checkins')
  showClearConfirm.value = false

  // Reload data
  await loadData()

  // Show feedback
  alert('数据已清除')
}

// --- Build heatmap grid ---
function buildHeatmap(data: Record<string, number>) {
  const weeks: Array<Array<{ date: string; count: number }>> = []
  const today = new Date()
  const totalDays = 112 // 16 weeks

  // Find the start date: go back to the beginning of the week that is 112 days ago
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - totalDays + 1)
  // Align to Monday (day-of-week: 1=Mon ... 7=Sun)
  const dayOfWeek = startDate.getDay() || 7 // Convert Sunday=0 to 7
  startDate.setDate(startDate.getDate() - (dayOfWeek - 1))

  let currentDate = new Date(startDate)
  let total = 0
  const monthsSeen: Record<string, number> = {}

  for (let w = 0; w < 16; w++) {
    const week: Array<{ date: string; count: number }> = []
    for (let d = 0; d < 7; d++) {
      const dateStr = currentDate.toISOString().slice(0, 10)
      const count = data[dateStr] || 0
      week.push({ date: dateStr, count })
      total += count

      // Track month starts for labels
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
      const monthLabel = `${currentDate.getMonth() + 1}月`
      if (!(monthKey in monthsSeen)) {
        monthsSeen[monthKey] = w * 15 // approximate pixel offset
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
  }

  heatmapWeeks.value = weeks
  heatmapTotal.value = total

  // Build month labels
  const labels: Array<{ label: string; offset: number }> = []
  let lastMonth = ''
  for (let w = 0; w < weeks.length; w++) {
    const firstDay = weeks[w][0].date
    const d = new Date(firstDay)
    const monthStr = `${d.getMonth() + 1}月`
    if (monthStr !== lastMonth) {
      labels.push({ label: monthStr, offset: w * 15 })
      lastMonth = monthStr
    }
  }
  monthLabels.value = labels
}

// --- Compute join text ---
function computeJoinText(allCards: KnowledgeCard[]) {
  const learnedIds = getLearnedCardIds()
  if (learnedIds.length === 0) {
    joinText.value = '今天刚来'
    return
  }

  // Try to get earliest date from learned-dates
  if (import.meta.client) {
    const stored = localStorage.getItem('wanxiang-learned-dates')
    if (stored) {
      const dates: Record<string, string> = JSON.parse(stored)
      const allDates = Object.values(dates).sort()
      if (allDates.length > 0) {
        const firstDate = new Date(allDates[0])
        const today = new Date()
        const diffDays = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
        joinText.value = diffDays === 0 ? '今天刚来' : `加入 ${diffDays} 天`
        return
      }
    }
  }

  joinText.value = '今天刚来'
}

// --- Load all data ---
async function loadData() {
  if (!import.meta.client) return

  const [s, allCards, hmData, radar] = await Promise.all([
    getLearningStats(),
    getAllCards(),
    Promise.resolve(getHeatmapData()),
    getRadarData(),
  ])

  stats.value = s
  checkinDays.value = getCheckinTotalDays()

  // Heatmap
  heatmapData.value = hmData
  buildHeatmap(hmData)

  // Radar
  radarData.value = radar

  // Join text
  computeJoinText(allCards)
}

// --- Lifecycle ---
onMounted(async () => {
  await loadData()
})
</script>
