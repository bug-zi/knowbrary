import { getAllCards } from './cards'
import { getLearnedCardIds, markCardLearned } from './progress'
import { getFavorites } from './favorites'
import { CATEGORIES } from '~/types'

const LEARNED_DATES_KEY = 'wanxiang-learned-dates'
const QUIZ_RESULTS_KEY = 'wanxiang-quiz-results'
const CHECKIN_KEY = 'wanxiang-checkins'

// --- Check-in ---
export function getCheckins(): string[] {
  if (import.meta.server) return []
  const stored = localStorage.getItem(CHECKIN_KEY)
  return stored ? JSON.parse(stored) : []
}

export function isCheckedToday(): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return getCheckins().includes(today)
}

export function checkIn(): { success: boolean; streak: number; totalDays: number } {
  if (import.meta.server || isCheckedToday()) return { success: false, streak: 0, totalDays: 0 }
  const checkins = getCheckins()
  const today = new Date().toISOString().slice(0, 10)
  checkins.push(today)
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkins))
  return { success: true, streak: getCheckinStreak(), totalDays: checkins.length }
}

export function getCheckinStreak(): number {
  const checkins = getCheckins()
  if (checkins.length === 0) return 0
  const uniqueDates = [...new Set(checkins)].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  let checkDate = new Date(today)
  if (!uniqueDates.includes(today)) checkDate.setDate(checkDate.getDate() - 1)
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().slice(0, 10)
    if (uniqueDates.includes(dateStr)) { streak++; checkDate.setDate(checkDate.getDate() - 1) }
    else break
  }
  return streak
}

export function getCheckinTotalDays(): number {
  return getCheckins().length
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  earnedAt?: string
}

export interface LearningStats {
  totalLearned: number
  totalCards: number
  categories: Record<string, { learned: number; total: number }>
  streak: number
  totalDaysActive: number
  favoriteCount: number
  quizCount: number
}

export function getLearnedDates(): Record<string, string> {
  if (import.meta.server) return {}
  const stored = localStorage.getItem(LEARNED_DATES_KEY)
  return stored ? JSON.parse(stored) : {}
}

export function markLearnedWithDate(cardId: string) {
  markCardLearned(cardId)
  if (import.meta.client) {
    const dates = getLearnedDates()
    if (!dates[cardId]) {
      dates[cardId] = new Date().toISOString().slice(0, 10)
      localStorage.setItem(LEARNED_DATES_KEY, JSON.stringify(dates))
    }
  }
}

export async function getLearningStats(): Promise<LearningStats> {
  const empty = { totalLearned: 0, totalCards: 0, categories: {}, streak: 0, totalDaysActive: 0, favoriteCount: 0, quizCount: 0 }
  if (import.meta.server) return empty

  const allCards = await getAllCards()
  const learnedIds = getLearnedCardIds()
  const favorites = getFavorites()
  const learnedDates = getLearnedDates()

  const categories: Record<string, { learned: number; total: number }> = {}
  for (const cat of CATEGORIES) {
    const catCards = allCards.filter(c => c.category === cat.id)
    if (catCards.length > 0) {
      categories[cat.id] = { learned: catCards.filter(c => learnedIds.includes(c.id)).length, total: catCards.length }
    }
  }

  const streak = calculateStreak(learnedDates)
  const totalDaysActive = new Set(Object.values(learnedDates)).size
  let quizCount = 0
  const quizStored = localStorage.getItem(QUIZ_RESULTS_KEY)
  if (quizStored) { try { quizCount = JSON.parse(quizStored).length } catch {} }

  return { totalLearned: learnedIds.length, totalCards: allCards.length, categories, streak, totalDaysActive, favoriteCount: favorites.length, quizCount }
}

function calculateStreak(learnedDates: Record<string, string>): number {
  const allDates = Object.values(learnedDates)
  if (allDates.length === 0) return 0
  const uniqueDates = [...new Set(allDates)].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  let checkDate = new Date(today)
  if (!uniqueDates.includes(today)) checkDate.setDate(checkDate.getDate() - 1)
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().slice(0, 10)
    if (uniqueDates.includes(dateStr)) { streak++; checkDate.setDate(checkDate.getDate() - 1) }
    else break
  }
  return streak
}

const ACHIEVEMENT_DEFS = [
  { id: 'first-card', title: '初入万象', description: '学习第一张知识卡片', icon: 'lucide:book-open' },
  { id: 'explorer-5', title: '知识探险家', description: '学习 5 张知识卡片', icon: 'lucide:compass' },
  { id: 'scholar-10', title: '博学之士', description: '学习 10 张知识卡片', icon: 'lucide:graduation-cap' },
  { id: 'category-master', title: '学科大师', description: '完成一个学科的全部卡片', icon: 'lucide:crown' },
  { id: 'favorite-5', title: '收藏达人', description: '收藏 5 张知识卡片', icon: 'lucide:star' },
  { id: 'streak-3', title: '三日不断', description: '连续 3 天学习', icon: 'lucide:flame' },
  { id: 'streak-7', title: '七日坚守', description: '连续 7 天学习', icon: 'lucide:dumbbell' },
  { id: 'all-categories', title: '万象通识', description: '每个有卡片学科至少学 1 张', icon: 'lucide:rainbow' },
]

export async function getAchievements(): Promise<Achievement[]> {
  if (import.meta.server) return ACHIEVEMENT_DEFS.map(d => ({ ...d, earned: false }))
  const stats = await getLearningStats()
  const earnedDateMap: Record<string, string> = {}
  const allDates = Object.values(getLearnedDates()).sort()

  if (stats.totalLearned >= 1) earnedDateMap['first-card'] = allDates[0]
  if (stats.totalLearned >= 5) earnedDateMap['explorer-5'] = allDates[Math.min(4, allDates.length - 1)]
  if (stats.totalLearned >= 10) earnedDateMap['scholar-10'] = allDates[Math.min(9, allDates.length - 1)]
  for (const s of Object.values(stats.categories)) { if (s.total > 0 && s.learned === s.total) { earnedDateMap['category-master'] = ''; break } }
  if (stats.favoriteCount >= 5) earnedDateMap['favorite-5'] = new Date().toISOString().slice(0, 10)
  if (stats.streak >= 3) earnedDateMap['streak-3'] = new Date().toISOString().slice(0, 10)
  if (stats.streak >= 7) earnedDateMap['streak-7'] = new Date().toISOString().slice(0, 10)
  const catsWithCards = Object.entries(stats.categories).filter(([, s]) => s.total > 0)
  if (catsWithCards.length > 0 && catsWithCards.every(([, s]) => s.learned >= 1)) earnedDateMap['all-categories'] = new Date().toISOString().slice(0, 10)

  return ACHIEVEMENT_DEFS.map(d => ({ ...d, earned: d.id in earnedDateMap, earnedAt: earnedDateMap[d.id] || undefined }))
}

export function getHeatmapData(): Record<string, number> {
  if (import.meta.server) return {}
  const counts: Record<string, number> = {}
  for (const d of Object.values(getLearnedDates())) counts[d] = (counts[d] || 0) + 1
  return counts
}

export async function getRadarData() {
  if (import.meta.server) return { categories: [] as string[], icons: [] as string[], colors: [] as string[], learned: [] as number[], total: [] as number[] }
  const allCards = await getAllCards()
  const learnedIds = getLearnedCardIds()
  const catStats = CATEGORIES
    .map(cat => { const cc = allCards.filter(c => c.category === cat.id); return { name: cat.name, icon: cat.icon, color: cat.color, total: cc.length, learned: cc.filter(c => learnedIds.includes(c.id)).length } })
    .filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 8)
  return { categories: catStats.map(c => c.name), icons: catStats.map(c => c.icon), colors: catStats.map(c => c.color), learned: catStats.map(c => c.learned), total: catStats.map(c => c.total) }
}
