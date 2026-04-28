<template>
  <div class="max-w-lg mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <div class="card-base text-center">
      <div class="flex items-center justify-between mb-4">
        <NuxtLink to="/profile" class="flex items-center gap-1.5 text-macaron-cta hover:text-macaron-text transition-colors no-underline text-sm font-medium">
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
          返回
        </NuxtLink>
        <h1 class="text-lg font-bold text-macaron-text">每日打卡</h1>
        <div class="w-16" />
      </div>

      <!-- Streak display -->
      <div class="py-6">
        <div class="text-6xl font-bold text-macaron-cta mb-2">{{ streak }}</div>
        <div class="text-sm text-macaron-text-secondary">连续打卡天数</div>
      </div>

      <!-- Stats row -->
      <div class="flex items-center justify-center gap-8 pb-2">
        <div class="text-center">
          <div class="text-2xl font-bold text-macaron-text">{{ totalDays }}</div>
          <div class="text-xs text-macaron-text-secondary">累计打卡</div>
        </div>
        <div class="w-px h-8 bg-macaron-border" />
        <div class="text-center">
          <div class="text-2xl font-bold text-macaron-text">{{ maxStreak }}</div>
          <div class="text-xs text-macaron-text-secondary">最长连续</div>
        </div>
      </div>
    </div>

    <!-- Check-in button -->
    <div class="card-base text-center">
      <button
        class="w-full py-4 rounded-2xl text-lg font-bold transition-all duration-300 active:scale-[0.97]"
        :class="checkedToday
          ? 'bg-macaron-border/40 text-macaron-text-secondary cursor-default'
          : 'bg-macaron-cta text-white hover:bg-macaron-cta-hover shadow-lg'"
        @click="handleCheckIn"
      >
        <template v-if="checkedToday">
          <Icon name="lucide:check-circle-2" class="inline w-5 h-5 align-text-bottom mr-1" />
          今日已打卡
        </template>
        <template v-else>
          <Icon name="lucide:sun" class="inline w-5 h-5 align-text-bottom mr-1" />
          打卡签到
        </template>
      </button>

      <!-- Recent checkins -->
      <div v-if="recentCheckins.length" class="mt-4 pt-4 border-t border-macaron-border/50">
        <div class="text-xs text-macaron-text-secondary mb-2">最近打卡</div>
        <div class="flex flex-wrap gap-2 justify-center">
          <span
            v-for="date in recentCheckins"
            :key="date"
            class="text-xs px-2.5 py-1 rounded-full bg-macaron-cta/10 text-macaron-cta font-medium"
          >
            {{ formatCheckinDate(date) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Calendar -->
    <div class="card-base">
      <div class="flex items-center justify-between mb-4">
        <button
          class="p-1.5 rounded-lg hover:bg-macaron-hover-bg transition-colors"
          @click="prevMonth"
        >
          <Icon name="lucide:chevron-left" class="w-4 h-4 text-macaron-text" />
        </button>
        <h2 class="text-base font-bold text-macaron-text">{{ calendarTitle }}</h2>
        <button
          class="p-1.5 rounded-lg hover:bg-macaron-hover-bg transition-colors"
          @click="nextMonth"
        >
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-macaron-text" />
        </button>
      </div>

      <!-- Weekday headers -->
      <div class="grid grid-cols-7 gap-1 mb-1">
        <div v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day" class="text-center text-xs text-macaron-text-secondary py-1">
          {{ day }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(cell, i) in calendarCells"
          :key="i"
          class="aspect-square rounded-lg flex items-center justify-center text-sm transition-all duration-200"
          :class="getCellClass(cell)"
        >
          {{ cell.day || '' }}
        </div>
      </div>
    </div>

    <!-- Check-in animation toast -->
    <Transition name="toast">
      <div
        v-if="showSuccessToast"
        class="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 bg-macaron-text text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5"
      >
        <Icon name="lucide:check-circle-2" class="w-5 h-5 text-macaron-cta" />
        <span class="font-medium text-sm">打卡成功! 连续 {{ streak }} 天</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { getCheckins, checkIn, isCheckedToday, getCheckinStreak, getCheckinTotalDays } from '~/utils/stats'

const streak = ref(0)
const totalDays = ref(0)
const maxStreak = ref(0)
const checkedToday = ref(false)
const recentCheckins = ref<string[]>([])
const showSuccessToast = ref(false)

// Calendar state
const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth())

const calendarTitle = computed(() => {
  return `${calendarYear.value}年${calendarMonth.value + 1}月`
})

interface CalendarCell {
  day: number | null
  date: string | null
  isToday: boolean
  isCurrentMonth: boolean
}

const calendarCells = computed<CalendarCell[]>(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Monday=0 ... Sunday=6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const cells: CalendarCell[] = []
  const todayStr = new Date().toISOString().slice(0, 10)
  const checkinSet = new Set(getCheckins())

  // Empty cells before month starts
  for (let i = 0; i < startDow; i++) {
    cells.push({ day: null, date: null, isToday: false, isCurrentMonth: false })
  }

  // Day cells
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dateStr = date.toISOString().slice(0, 10)
    cells.push({
      day: d,
      date: dateStr,
      isToday: dateStr === todayStr,
      isCurrentMonth: true,
    })
  }

  return cells
})

function getCellClass(cell: CalendarCell): string {
  if (!cell.day) return ''
  const checkinSet = new Set(getCheckins())
  const isChecked = cell.date && checkinSet.has(cell.date)

  if (isChecked && cell.isToday) return 'bg-macaron-cta text-white font-bold'
  if (isChecked) return 'bg-macaron-cta/20 text-macaron-cta font-medium'
  if (cell.isToday) return 'border-2 border-macaron-cta/40 text-macaron-text font-medium'
  return 'text-macaron-text-secondary'
}

function prevMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

function formatCheckinDate(date: string): string {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date === today.toISOString().slice(0, 10)) return '今天'
  if (date === yesterday.toISOString().slice(0, 10)) return '昨天'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function calcMaxStreak(): number {
  const checkins = getCheckins()
  if (checkins.length === 0) return 0
  const uniqueDates = [...new Set(checkins)].sort()
  let max = 1
  let current = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1])
    const curr = new Date(uniqueDates[i])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      current++
      max = Math.max(max, current)
    } else {
      current = 1
    }
  }
  return max
}

function handleCheckIn() {
  if (checkedToday.value) return
  const result = checkIn()
  if (result.success) {
    checkedToday.value = true
    streak.value = result.streak
    totalDays.value = result.totalDays
    maxStreak.value = calcMaxStreak()
    loadRecentCheckins()
    showSuccessToast.value = true
    setTimeout(() => { showSuccessToast.value = false }, 2000)
  }
}

function loadRecentCheckins() {
  const checkins = getCheckins()
  recentCheckins.value = [...checkins].sort().reverse().slice(0, 7)
}

onMounted(() => {
  streak.value = getCheckinStreak()
  totalDays.value = getCheckinTotalDays()
  maxStreak.value = calcMaxStreak()
  checkedToday.value = isCheckedToday()
  loadRecentCheckins()
})
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.3s ease-in; }
.toast-enter-from { opacity: 0; transform: translate(-50%, -20px) scale(0.9); }
.toast-leave-to { opacity: 0; transform: translate(-50%, -20px) scale(0.9); }
</style>
