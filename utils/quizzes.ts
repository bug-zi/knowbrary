import type { DailyQuiz, ThoughtExperiment, QuizResult } from '~/types/quizzes'
import { useSupabase } from './supabase'

const QUIZ_RESULTS_KEY = 'wanxiang-quiz-results'
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
  const quizzes = await getAllQuizzes()
  if (!quizzes.length) return null
  const today = new Date().toISOString().split('T')[0]
  return quizzes.find(q => q.date === today) || quizzes[new Date().getDate() % quizzes.length]
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
