import type { DailyQuiz, ThoughtExperiment, QuizResult, ThoughtReflection } from '~/types/quizzes'
import { useSupabase } from './supabase'

const QUIZ_RESULTS_KEY = 'wanxiang-quiz-results'
const PRACTICE_RESULTS_KEY = 'wanxiang-practice-results'
const THOUGHT_REFLECTIONS_KEY = 'wanxiang-thought-reflections'
const DAILY_QUIZ_CACHE_PREFIX = 'wanxiang-daily-quiz-'
let _quizzes: DailyQuiz[] | null = null
let _experiments: ThoughtExperiment[] | null = null

function mapQuiz(r: any): DailyQuiz {
  return { id: r.id, date: r.publish_date, question: r.question, scenario: r.scenario || '', options: r.options, correctAnswer: r.correct_answer, explanation: r.explanation, relatedCards: r.related_card_ids || [], category: r.category_id, difficulty: r.difficulty }
}

function mapExperiment(r: any): ThoughtExperiment {
  return { id: r.id, title: r.title, description: r.description, choices: r.choices, finalAnalysis: r.final_analysis, relatedCards: r.related_card_ids || [], category: r.category_id }
}

export async function getAllQuizzes(): Promise<DailyQuiz[]> {
  if (_quizzes) return _quizzes
  const { data } = await useSupabase().from('quizzes').select('*').order('publish_date')
  _quizzes = (data || []).map(mapQuiz)
  return _quizzes
}

export async function getTodaysQuiz(): Promise<DailyQuiz | null> {
  // 1. Check localStorage cache for today
  if (import.meta.client) {
    const today = new Date().toISOString().split('T')[0]
    const cached = localStorage.getItem(DAILY_QUIZ_CACHE_PREFIX + today)
    if (cached) {
      try { return JSON.parse(cached) } catch { /* ignore */ }
    }
  }

  // 2. Fallback: load from Supabase quizzes table
  const quizzes = await getAllQuizzes()
  if (!quizzes.length) return null
  const today = new Date().toISOString().split('T')[0]
  return quizzes.find(q => q.date === today) || quizzes[new Date().getDate() % quizzes.length]
}

export function cacheDailyQuiz(quiz: DailyQuiz): void {
  if (import.meta.server) return
  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem(DAILY_QUIZ_CACHE_PREFIX + today, JSON.stringify(quiz))
}

export function getCachedDailyQuiz(): DailyQuiz | null {
  if (import.meta.server) return null
  const today = new Date().toISOString().split('T')[0]
  const cached = localStorage.getItem(DAILY_QUIZ_CACHE_PREFIX + today)
  if (cached) {
    try { return JSON.parse(cached) } catch { /* ignore */ }
  }
  return null
}

export async function getAllThoughtExperiments(): Promise<ThoughtExperiment[]> {
  if (_experiments) return _experiments
  const { data } = await useSupabase().from('thought_experiments').select('*')
  _experiments = (data || []).map(mapExperiment)
  return _experiments
}

export async function getRandomThoughtExperiment(excludeId?: string): Promise<ThoughtExperiment> {
  const experiments = await getAllThoughtExperiments()
  const candidates = excludeId ? experiments.filter(e => e.id !== excludeId) : experiments
  return candidates[Math.floor(Math.random() * candidates.length)] || experiments[0]
}

export function saveQuizResult(result: QuizResult): void {
  if (import.meta.server) return
  const results = getQuizResults()
  results.push(result)
  localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results))
}

export function getQuizResults(): QuizResult[] {
  if (import.meta.server) return []
  const s = localStorage.getItem(QUIZ_RESULTS_KEY)
  return s ? JSON.parse(s) : []
}

export function hasAnsweredToday(): boolean {
  if (import.meta.server) return false
  const today = new Date().toISOString().split('T')[0]
  return getQuizResults().some(r => r.answeredAt.split('T')[0] === today)
}

export function getTodayQuizResult(): QuizResult | undefined {
  if (import.meta.server) return undefined
  const today = new Date().toISOString().split('T')[0]
  return getQuizResults().find(r => r.answeredAt.split('T')[0] === today)
}

export function getQuizStreak(): number {
  if (import.meta.server) return 0
  const results = getQuizResults()
  if (!results.length) return 0
  const dates = [...new Set(results.map(r => r.answeredAt.split('T')[0]))].sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (!dates.includes(today) && !dates.includes(yesterday)) return 0
  let streak = 1, current = dates[0]
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(current); prev.setDate(prev.getDate() - 1)
    if (dates.includes(prev.toISOString().split('T')[0])) { streak++; current = prev.toISOString().split('T')[0] }
    else break
  }
  return streak
}

export function getQuizStats(): { totalAnswered: number; correctCount: number; accuracy: number } {
  if (import.meta.server) return { totalAnswered: 0, correctCount: 0, accuracy: 0 }
  const results = getQuizResults()
  const correct = results.filter(r => r.isCorrect).length
  return { totalAnswered: results.length, correctCount: correct, accuracy: results.length > 0 ? Math.round((correct / results.length) * 100) : 0 }
}

// === Practice Mode ===

export async function getPracticeQuiz(excludedIds: string[]): Promise<DailyQuiz | null> {
  const quizzes = await getAllQuizzes()
  const today = new Date().toISOString().split('T')[0]
  const pool = quizzes.filter(q => !excludedIds.includes(q.id) && q.date !== today)
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export function savePracticeResult(result: QuizResult): void {
  if (import.meta.server) return
  const results = getPracticeResults()
  results.push(result)
  localStorage.setItem(PRACTICE_RESULTS_KEY, JSON.stringify(results))
}

export function getPracticeResults(): QuizResult[] {
  if (import.meta.server) return []
  const s = localStorage.getItem(PRACTICE_RESULTS_KEY)
  return s ? JSON.parse(s) : []
}

export function getPracticeStats(): { totalAnswered: number; correctCount: number; accuracy: number } {
  if (import.meta.server) return { totalAnswered: 0, correctCount: 0, accuracy: 0 }
  const results = getPracticeResults()
  const correct = results.filter(r => r.isCorrect).length
  return { totalAnswered: results.length, correctCount: correct, accuracy: results.length > 0 ? Math.round((correct / results.length) * 100) : 0 }
}

// === Thought Experiment Reflections ===

export function saveThoughtReflection(reflection: ThoughtReflection): void {
  if (import.meta.server) return
  const all: ThoughtReflection[] = JSON.parse(localStorage.getItem(THOUGHT_REFLECTIONS_KEY) || '[]')
  const idx = all.findIndex(r => r.experimentId === reflection.experimentId)
  if (idx >= 0) {
    all[idx] = reflection
  } else {
    all.push(reflection)
  }
  localStorage.setItem(THOUGHT_REFLECTIONS_KEY, JSON.stringify(all))
}

export function getThoughtReflection(experimentId: string): ThoughtReflection | null {
  if (import.meta.server) return null
  const all: ThoughtReflection[] = JSON.parse(localStorage.getItem(THOUGHT_REFLECTIONS_KEY) || '[]')
  return all.find(r => r.experimentId === experimentId) || null
}
