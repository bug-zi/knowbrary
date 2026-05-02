<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold text-macaron-text mb-1">知识实验</h1>
      <p class="text-sm text-macaron-text-secondary">每天一个小挑战，让知识真正属于你</p>
    </div>

    <!-- Stats Bar -->
    <div class="card-base mb-4 flex items-center justify-around py-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-macaron-cta">{{ streak }} <Icon name="lucide:flame" class="inline w-5 h-5 align-text-bottom text-orange-500" /></div>
        <div class="text-xs text-macaron-text-secondary mt-0.5">连续天数</div>
      </div>
      <div class="w-px h-8 bg-macaron-border" />
      <div class="text-center">
        <div class="text-2xl font-bold text-macaron-text">{{ stats.totalAnswered }}</div>
        <div class="text-xs text-macaron-text-secondary mt-0.5">已答题数</div>
      </div>
      <div class="w-px h-8 bg-macaron-border" />
      <div class="text-center">
        <div class="text-2xl font-bold text-macaron-text">{{ stats.accuracy }}%</div>
        <div class="text-xs text-macaron-text-secondary mt-0.5">正确率</div>
      </div>
    </div>

    <!-- Practice Stats (shown when practice has been done) -->
    <div v-if="practiceStats.totalAnswered > 0" class="card-base mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-macaron-text-secondary">练习模式统计</span>
        <span class="text-xs text-macaron-muted">不计入连续天数</span>
      </div>
      <div class="flex items-center justify-around py-2">
        <div class="text-center">
          <div class="text-lg font-bold text-macaron-cta">{{ practiceStats.totalAnswered }}</div>
          <div class="text-xs text-macaron-text-secondary">练习题数</div>
        </div>
        <div class="w-px h-6 bg-macaron-border" />
        <div class="text-center">
          <div class="text-lg font-bold text-macaron-text">{{ practiceStats.accuracy }}%</div>
          <div class="text-xs text-macaron-text-secondary">练习正确率</div>
        </div>
      </div>
    </div>

    <!-- Tab Switcher -->
    <div class="flex gap-2 mb-6">
      <button
        class="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
        :class="activeTab === 'quiz'
          ? 'bg-macaron-cta text-white shadow-card'
          : 'bg-macaron-card text-macaron-text-secondary border border-macaron-border hover:bg-macaron-border/30'"
        @click="activeTab = 'quiz'"
      >
        每日一题
      </button>
      <button
        class="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
        :class="activeTab === 'fact'
          ? 'bg-macaron-cta text-white shadow-card'
          : 'bg-macaron-card text-macaron-text-secondary border border-macaron-border hover:bg-macaron-border/30'"
        @click="activeTab = 'fact'"
      >
        冷知识
      </button>
    </div>

    <!-- Tab 1: Daily Quiz -->
    <div v-if="activeTab === 'quiz'">
      <template v-if="todaysQuiz">
        <!-- Already answered today -->
        <div v-if="alreadyAnswered && todayResult" class="card-base">
          <div class="text-center mb-4">
            <div class="text-4xl mb-2"><Icon :name="todayResult.isCorrect ? 'lucide:party-popper' : 'lucide:dumbbell'" class="text-4xl" /></div>
            <h2 class="text-lg font-bold text-macaron-text">
              {{ todayResult.isCorrect ? '回答正确！' : '答错了，但学到就是赚到！' }}
            </h2>
          </div>

          <!-- Show the question -->
          <div class="mb-4">
            <p class="font-medium text-macaron-text mb-1">{{ todaysQuiz.question }}</p>
          </div>

          <!-- Show options with result highlighting -->
          <div class="space-y-2 mb-4">
            <div
              v-for="option in todaysQuiz.options"
              :key="option.id"
              class="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors"
              :class="[getOptionResultClass(option.id, todayResult), {
                'quiz-anim-correct': answerAnimation === 'correct' && option.id === todayResult?.selectedAnswer,
                'quiz-anim-wrong': answerAnimation === 'wrong' && option.id === todayResult?.selectedAnswer,
              }]"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                :class="getOptionCircleClass(option.id, todayResult)"
              >
                {{ option.id.toUpperCase() }}
              </span>
              <span class="text-sm">{{ option.text }}</span>
            </div>
          </div>

          <!-- Explanation -->
          <div class="bg-amber-50 rounded-xl p-4 mb-4">
            <div class="font-medium text-amber-800 text-sm mb-1">解析</div>
            <p class="text-sm text-amber-900 leading-relaxed">{{ todaysQuiz.explanation }}</p>
          </div>

          <!-- Related cards -->
          <div v-if="relatedQuizCards.length > 0">
            <div class="text-sm font-medium text-macaron-text mb-2">相关知识卡片</div>
            <div class="space-y-2">
              <NuxtLink
                v-for="card in relatedQuizCards"
                :key="card.id"
                :to="`/cards/${card.slug}`"
                class="flex items-center gap-3 px-4 py-3 rounded-xl bg-macaron-card border border-macaron-border hover:border-macaron-cta transition-colors no-underline"
              >
                <span
                  class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: getCategoryMeta(card.category).color }"
                />
                <div>
                  <div class="text-sm font-medium text-macaron-text">{{ card.title }}</div>
                  <div class="text-xs text-macaron-text-secondary">{{ card.oneLiner }}</div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Come back tomorrow / Continue practicing -->
          <div class="text-center mt-6 pt-4 border-t border-macaron-border">
            <p class="text-sm text-macaron-text-secondary mb-3">明天的题目已经准备好了，记得回来挑战哦</p>
            <button
              class="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-macaron-cta text-white hover:bg-macaron-cta-hover shadow-card"
              @click="startPractice"
            >
              <Icon name="lucide:dumbbell" class="inline w-4 h-4 mr-1 align-text-bottom" />
              继续练习
            </button>
          </div>
        </div>

        <!-- Quiz not yet answered -->
        <div v-else class="card-base">
          <!-- Category & Difficulty Badge -->
          <div class="flex items-center gap-2 mb-4">
            <span
              class="text-xs px-2.5 py-1 rounded-full font-medium"
              :style="{
                backgroundColor: getCategoryMeta(todaysQuiz.category).color + '30',
                color: darkenColor(getCategoryMeta(todaysQuiz.category).color)
              }"
            >
              {{ getCategoryMeta(todaysQuiz.category).name }}
            </span>
            <span :class="`badge-${todaysQuiz.difficulty}`">
              {{ getDifficultyLabel(todaysQuiz.difficulty) }}
            </span>
          </div>

          <!-- Question -->
          <h2 class="text-lg font-bold text-macaron-text mb-3">{{ todaysQuiz.question }}</h2>

          <!-- Scenario -->
          <div class="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 mb-5">
            <p class="text-sm text-macaron-text leading-relaxed">{{ todaysQuiz.scenario }}</p>
          </div>

          <!-- Options -->
          <div class="space-y-3 mb-5">
            <button
              v-for="option in todaysQuiz.options"
              :key="option.id"
              class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200"
              :class="selectedOption === option.id
                ? 'border-macaron-cta bg-pink-50'
                : 'border-macaron-border bg-macaron-card hover:border-macaron-border'"
              @click="selectedOption = option.id"
            >
              <span
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors"
                :class="selectedOption === option.id
                  ? 'bg-macaron-cta text-white'
                  : 'bg-macaron-border/40 text-macaron-text-secondary'"
              >
                {{ option.id.toUpperCase() }}
              </span>
              <span class="text-sm text-macaron-text">{{ option.text }}</span>
            </button>
          </div>

          <!-- Submit Button -->
          <button
            class="w-full py-3 rounded-xl font-medium text-white transition-all duration-200"
            :class="selectedOption
              ? 'bg-macaron-cta hover:bg-macaron-cta-hover shadow-card'
              : 'bg-macaron-border cursor-not-allowed'"
            :disabled="!selectedOption"
            @click="submitQuiz"
          >
            {{ selectedOption ? '提交答案' : '请选择一个答案' }}
          </button>
        </div>
      </template>

      <!-- Generating / Loading state -->
      <div v-else-if="generating" class="card-base text-center py-12">
        <div class="text-5xl mb-4"><Icon name="lucide:sparkles" class="text-5xl animate-pulse" /></div>
        <p class="text-macaron-text font-medium mb-1">AI 正在出题中，请稍后</p>
        <p class="text-sm text-macaron-text-secondary mb-3">基于知识卡片为你生成专属题目</p>
        <div class="w-48 mx-auto h-1.5 bg-macaron-border rounded-full overflow-hidden">
          <div class="h-full bg-macaron-cta rounded-full animate-loading-bar" />
        </div>
      </div>

      <!-- Generation error -->
      <div v-else-if="generateError" class="card-base text-center py-12">
        <div class="text-5xl mb-4"><Icon name="lucide:alert-circle" class="text-5xl text-red-400" /></div>
        <p class="text-macaron-text font-medium mb-1">出题失败</p>
        <p class="text-sm text-macaron-text-secondary mb-4">{{ generateError }}</p>
        <button
          class="px-6 py-2.5 rounded-xl font-medium text-sm bg-macaron-cta text-white hover:bg-macaron-cta-hover shadow-card transition-colors"
          @click="generateQuizFromAI().then(q => { if (q) { todaysQuiz = ref(q); cacheDailyQuiz(q) } })"
        >
          重试
        </button>
      </div>

      <!-- No quiz & no AI configured -->
      <div v-else class="card-base text-center py-12">
        <div class="text-5xl mb-4"><Icon name="lucide:clipboard-list" class="text-5xl" /></div>
        <p class="text-macaron-text-secondary">暂无题目，请在个人中心配置AI后自动出题</p>
      </div>

      <!-- Practice Mode -->
      <div v-if="isPracticeMode" class="mt-4">
        <div v-if="practiceQuiz" class="card-base">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-600">
              练习模式
            </span>
            <span
              class="text-xs px-2.5 py-1 rounded-full font-medium"
              :style="{
                backgroundColor: getCategoryMeta(practiceQuiz.category).color + '30',
                color: darkenColor(getCategoryMeta(practiceQuiz.category).color)
              }"
            >
              {{ getCategoryMeta(practiceQuiz.category).name }}
            </span>
            <span :class="`badge-${practiceQuiz.difficulty}`">
              {{ getDifficultyLabel(practiceQuiz.difficulty) }}
            </span>
          </div>

          <h2 class="text-lg font-bold text-macaron-text mb-3">{{ practiceQuiz.question }}</h2>

          <div class="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 mb-5">
            <p class="text-sm text-macaron-text leading-relaxed">{{ practiceQuiz.scenario }}</p>
          </div>

          <!-- Practice options (not yet answered) -->
          <div v-if="!practiceAnswered" class="space-y-3 mb-5">
            <button
              v-for="option in practiceQuiz.options"
              :key="option.id"
              class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200"
              :class="practiceSelectedOption === option.id
                ? 'border-macaron-cta bg-pink-50'
                : 'border-macaron-border bg-macaron-card hover:border-macaron-border'"
              @click="practiceSelectedOption = option.id"
            >
              <span
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors"
                :class="practiceSelectedOption === option.id
                  ? 'bg-macaron-cta text-white'
                  : 'bg-macaron-border/40 text-macaron-text-secondary'"
              >
                {{ option.id.toUpperCase() }}
              </span>
              <span class="text-sm text-macaron-text">{{ option.text }}</span>
            </button>
          </div>

          <!-- Practice submit -->
          <button
            v-if="!practiceAnswered"
            class="w-full py-3 rounded-xl font-medium text-white transition-all duration-200"
            :class="practiceSelectedOption
              ? 'bg-macaron-cta hover:bg-macaron-cta-hover shadow-card'
              : 'bg-macaron-border cursor-not-allowed'"
            :disabled="!practiceSelectedOption"
            @click="submitPracticeQuiz"
          >
            {{ practiceSelectedOption ? '提交答案' : '请选择一个答案' }}
          </button>

          <!-- Practice result -->
          <template v-if="practiceAnswered && practiceResult">
            <div class="space-y-2 mb-4">
              <div
                v-for="option in practiceQuiz.options"
                :key="option.id"
                class="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors"
                :class="[getOptionResultClass(option.id, practiceResult), {
                  'quiz-anim-correct': answerAnimation === 'correct' && option.id === practiceResult?.selectedAnswer,
                  'quiz-anim-wrong': answerAnimation === 'wrong' && option.id === practiceResult?.selectedAnswer,
                }]"
              >
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  :class="getOptionCircleClass(option.id, practiceResult)"
                >
                  {{ option.id.toUpperCase() }}
                </span>
                <span class="text-sm">{{ option.text }}</span>
              </div>
            </div>

            <div class="bg-amber-50 rounded-xl p-4 mb-4">
              <div class="font-medium text-amber-800 text-sm mb-1">解析</div>
              <p class="text-sm text-amber-900 leading-relaxed">{{ practiceQuiz.explanation }}</p>
            </div>

            <div class="flex gap-3">
              <button
                class="flex-1 py-3 rounded-xl font-medium text-white bg-macaron-cta hover:bg-macaron-cta-hover shadow-card transition-colors"
                @click="startPractice"
              >
                <Icon name="lucide:arrow-right" class="inline w-4 h-4 mr-1 align-text-bottom" />
                下一题
              </button>
              <button
                class="flex-1 py-3 rounded-xl font-medium border-2 border-macaron-border text-macaron-text-secondary hover:bg-macaron-border/30 transition-colors"
                @click="exitPractice"
              >
                结束练习
              </button>
            </div>
          </template>
        </div>

        <!-- Generating practice quiz -->
        <div v-else-if="generating" class="card-base text-center py-10">
          <div class="text-4xl mb-3"><Icon name="lucide:sparkles" class="text-4xl animate-pulse" /></div>
          <p class="text-macaron-text font-medium mb-2">AI 正在出题中，请稍后</p>
          <div class="w-48 mx-auto h-1.5 bg-macaron-border rounded-full overflow-hidden">
            <div class="h-full bg-macaron-cta rounded-full animate-loading-bar" />
          </div>
        </div>

        <!-- No more practice quizzes -->
        <div v-else class="card-base text-center py-8">
          <div class="text-4xl mb-3"><Icon name="lucide:trophy" class="text-4xl" /></div>
          <p class="text-macaron-text-secondary text-sm mb-4">题库已全部练习完毕，明天再来吧</p>
          <button
            class="px-6 py-2.5 rounded-xl font-medium text-sm border-2 border-macaron-border text-macaron-text-secondary hover:bg-macaron-border/30 transition-colors"
            @click="exitPractice"
          >
            返回
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 2: Thought Experiments -->
    <div v-if="activeTab === 'fact'">
      <!-- Loading -->
      <div v-if="funFactLoading" class="card-base text-center py-16">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-macaron-cta animate-spin mx-auto mb-3" />
        <p class="text-sm text-macaron-text-secondary">AI 正在生成冷知识...</p>
      </div>

      <!-- Error -->
      <div v-else-if="funFactError" class="card-base text-center py-12">
        <Icon name="lucide:alert-circle" class="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-500 mb-4">{{ funFactError }}</p>
        <button
          class="px-6 py-2 rounded-xl text-sm font-medium text-white bg-macaron-cta hover:bg-macaron-cta-hover transition-colors"
          @click="generateFunFact"
        >
          重试
        </button>
      </div>

      <!-- No AI config -->
      <div v-else-if="!aiConfig && !currentFunFact" class="card-base text-center py-12">
        <Icon name="lucide:sparkles" class="w-8 h-8 text-macaron-cta mx-auto mb-3" />
        <h3 class="text-lg font-bold text-macaron-text mb-2">需要配置 AI</h3>
        <p class="text-sm text-macaron-text-secondary mb-4">冷知识由 AI 生成，请先在创作页面配置 AI 服务</p>
        <NuxtLink
          to="/create"
          class="inline-block px-6 py-2 rounded-xl text-sm font-medium text-white bg-macaron-cta hover:bg-macaron-cta-hover transition-colors no-underline"
        >
          去配置
        </NuxtLink>
      </div>

      <!-- Fun fact card -->
      <div v-else-if="currentFunFact" class="card-base">
        <!-- Category Badge -->
        <div class="flex items-center gap-2 mb-4">
          <span
            class="text-xs px-2.5 py-1 rounded-full font-medium"
            :style="{
              backgroundColor: getCategoryMeta(currentFunFact.category).color + '30',
              color: darkenColor(getCategoryMeta(currentFunFact.category).color)
            }"
          >
            {{ getCategoryMeta(currentFunFact.category).name }}
          </span>
        </div>

        <!-- Title -->
        <h2 class="text-lg font-bold text-macaron-text mb-4">{{ currentFunFact.title }}</h2>

        <!-- Surprising fact -->
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-5 border border-amber-100">
          <p class="text-sm text-amber-900 leading-relaxed">{{ currentFunFact.fact }}</p>
        </div>

        <!-- Why? button -->
        <div v-if="!factRevealed" class="mb-5">
          <button
            class="w-full py-3 rounded-xl font-medium text-white bg-macaron-cta hover:bg-macaron-cta-hover shadow-card transition-all duration-300 flex items-center justify-center gap-2"
            @click="factRevealed = true"
          >
            <Icon name="lucide:lightbulb" class="w-4 h-4" />
            为什么？
          </button>
        </div>

        <!-- Explanation (revealed) -->
        <div v-if="factRevealed" class="mb-5 animate-fade-in">
          <div class="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100">
            <div class="font-medium text-sky-800 text-sm mb-2 flex items-center gap-1.5">
              <Icon name="lucide:book-open" class="w-3.5 h-3.5" />
              原来如此
            </div>
            <p class="text-sm text-sky-900 leading-relaxed">{{ currentFunFact.explanation }}</p>
          </div>
        </div>

        <!-- Related cards -->
        <div v-if="funFactRelatedCards.length > 0" class="mb-5">
          <div class="text-sm font-medium text-macaron-text mb-2">相关知识卡片</div>
          <div class="space-y-2">
            <NuxtLink
              v-for="card in funFactRelatedCards"
              :key="card.id"
              :to="`/cards/${card.slug}`"
              class="flex items-center gap-3 px-4 py-3 rounded-xl bg-macaron-card border border-macaron-border hover:border-macaron-cta/50 transition-colors no-underline"
            >
              <span
                class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: getCategoryMeta(card.category).color }"
              />
              <div>
                <div class="text-sm font-medium text-macaron-text">{{ card.title }}</div>
                <div class="text-xs text-macaron-text-secondary">{{ card.oneLiner }}</div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            class="flex-1 py-3 rounded-xl font-medium text-white bg-macaron-cta hover:bg-macaron-cta-hover shadow-card transition-colors"
            @click="tryAnotherFact"
          >
            换一个冷知识
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCategoryMeta } from '~/types'
import type { KnowledgeCard, AIProvider } from '~/types'
import type { DailyQuiz, QuizResult, FunFact, ShownFunFact } from '~/types/quizzes'
import {
  getTodaysQuiz,
  saveQuizResult,
  getQuizResults,
  getQuizStreak,
  getQuizStats,
  cacheDailyQuiz,
  savePracticeResult,
  getPracticeStats,
} from '~/utils/quizzes'
import { getCardById, getAllCards } from '~/utils/cards'

const activeTab = ref<'quiz' | 'fact'>('quiz')
const streak = ref(0)
const stats = ref({ totalAnswered: 0, correctCount: 0, accuracy: 0 })

// Quiz state - loaded via useAsyncData
const { data: quizData } = await useAsyncData('experiment-quiz', async () => {
  const quiz = await getTodaysQuiz()
  if (!quiz) return null
  const relatedCards = (await Promise.all(
    quiz.relatedCards.map(id => getCardById(id))
  )).filter((c): c is KnowledgeCard => c !== undefined)
  return { quiz, relatedCards }
})

const todaysQuiz = ref(quizData.value?.quiz ?? null)
const relatedQuizCards = ref<KnowledgeCard[]>(quizData.value?.relatedCards ?? [])
const selectedOption = ref<string | null>(null)
const alreadyAnswered = ref(false)
const todayResult = ref<QuizResult | undefined>(undefined)

// Thought experiment state - removed, replaced with fun fact
const currentFunFact = ref<FunFact | null>(null)
const funFactRelatedCards = ref<KnowledgeCard[]>([])
const funFactLoading = ref(false)
const funFactError = ref('')
const factRevealed = ref(false)

// Practice mode state
const isPracticeMode = ref(false)
const practiceQuiz = ref<DailyQuiz | null>(null)
const practiceRelatedCards = ref<KnowledgeCard[]>([])
const practiceSelectedOption = ref<string | null>(null)
const practiceAnswered = ref(false)
const practiceResult = ref<QuizResult | undefined>()
const practicedIds = ref<string[]>([])
const practiceStats = ref({ totalAnswered: 0, correctCount: 0, accuracy: 0 })

// Fun fact localStorage helpers
const FUNFACT_TODAY_KEY = 'wanxiang-funfact-today'
const FUNFACT_SHOWN_KEY = 'wanxiang-funfact-shown'

function getTodayFunFactCache(): FunFact | null {
  if (import.meta.server) return null
  const today = new Date().toISOString().split('T')[0]
  const cached = localStorage.getItem(`${FUNFACT_TODAY_KEY}-${today}`)
  if (cached) {
    try { return JSON.parse(cached) } catch { /* ignore */ }
  }
  return null
}

function cacheTodayFunFact(fact: FunFact): void {
  if (import.meta.server) return
  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem(`${FUNFACT_TODAY_KEY}-${today}`, JSON.stringify(fact))
}

function getShownFactTitles(): string[] {
  if (import.meta.server) return []
  const raw = localStorage.getItem(FUNFACT_SHOWN_KEY)
  if (!raw) return []
  try {
    const shown: ShownFunFact[] = JSON.parse(raw)
    // Clean entries older than 7 days
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const valid = shown.filter(s => new Date(s.shownAt).getTime() > weekAgo)
    localStorage.setItem(FUNFACT_SHOWN_KEY, JSON.stringify(valid))
    return valid.map(s => s.title)
  } catch { return [] }
}

function addToShownFacts(fact: FunFact): void {
  if (import.meta.server) return
  const raw = localStorage.getItem(FUNFACT_SHOWN_KEY)
  const shown: ShownFunFact[] = raw ? JSON.parse(raw) : []
  shown.push({ id: fact.id, title: fact.title, shownAt: new Date().toISOString() })
  // Keep only last 50 entries
  if (shown.length > 50) shown.splice(0, shown.length - 50)
  localStorage.setItem(FUNFACT_SHOWN_KEY, JSON.stringify(shown))
}

// Animation
const answerAnimation = ref<'correct' | 'wrong' | null>(null)

// AI generation state
const generating = ref(false)
const generateError = ref('')
const aiConfig = ref<{ provider: AIProvider; apiKey: string; model: string } | null>(null)

// === AI Quiz Generation ===

async function loadAiConfig(): Promise<{ provider: AIProvider; apiKey: string; model: string } | null> {
  if (!import.meta.client) return null
  try {
    const { useSupabase: useSb, useSupabaseUser } = await import('~/utils/supabase')
    const user = useSupabaseUser()
    if (!user.value) return null
    const client = useSb()
    const { data } = await client
      .from('ai_configs')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('is_active', true)
      .limit(1)
    if (data && data.length > 0) {
      const cfg = { provider: data[0].provider as AIProvider, apiKey: data[0].api_key, model: data[0].model }
      aiConfig.value = cfg
      return cfg
    }
  } catch { /* ignore */ }
  return null
}

function pickRandomCards(cards: KnowledgeCard[], count: number, excludeIds: string[] = []): KnowledgeCard[] {
  const pool = cards.filter(c => !excludeIds.includes(c.id))
  const picked: KnowledgeCard[] = []
  const used = new Set<string>()
  while (picked.length < count && used.size < pool.length) {
    const idx = Math.floor(Math.random() * pool.length)
    if (!used.has(pool[idx].id)) {
      used.add(pool[idx].id)
      picked.push(pool[idx])
    }
  }
  return picked
}

async function generateQuizFromAI(excludeCardIds: string[] = [], difficulty = ''): Promise<DailyQuiz | null> {
  const cfg = aiConfig.value || await loadAiConfig()
  if (!cfg) return null

  const allCards = await getAllCards()
  if (!allCards.length) return null

  const sourceCards = pickRandomCards(allCards, 2, excludeCardIds)
  if (!sourceCards.length) return null

  const diff = difficulty || ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)]

  generating.value = true
  generateError.value = ''

  try {
    const resp = await $fetch<{ quiz: DailyQuiz }>('/api/ai/generate-quiz', {
      method: 'POST',
      body: {
        provider: cfg.provider,
        apiKey: cfg.apiKey,
        model: cfg.model,
        cards: sourceCards.map(c => ({ id: c.id, title: c.title, content: c.content.slice(0, 500), category: c.category, oneLiner: c.oneLiner })),
        difficulty: diff,
      },
    })
    return resp.quiz
  } catch (e: any) {
    generateError.value = e?.data?.statusMessage || e?.message || 'AI出题失败'
    return null
  } finally {
    generating.value = false
  }
}

// === Fun Fact Generation ===

async function generateFunFact(): Promise<void> {
  const cfg = aiConfig.value || await loadAiConfig()
  if (!cfg) {
    funFactError.value = '请先配置 AI 服务'
    return
  }

  const allCards = await getAllCards()
  if (!allCards.length) {
    funFactError.value = '暂无知识卡片'
    return
  }

  funFactLoading.value = true
  funFactError.value = ''
  factRevealed.value = false

  try {
    const excludedTitles = getShownFactTitles()
    const cardTitles = allCards.map(c => ({ id: c.id, title: c.title, category: c.category }))

    const resp = await $fetch<{ fact: any }>('/api/ai/generate-fun-fact', {
      method: 'POST',
      body: {
        provider: cfg.provider,
        apiKey: cfg.apiKey,
        model: cfg.model,
        cardTitles,
        excludedTitles,
      },
    })

    const fact: FunFact = {
      id: `fact-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: resp.fact.title,
      fact: resp.fact.fact,
      explanation: resp.fact.explanation,
      relatedCards: resp.fact.relatedCards || [],
      category: resp.fact.category,
    }

    currentFunFact.value = fact
    cacheTodayFunFact(fact)
    addToShownFacts(fact)

    // Load related cards
    funFactRelatedCards.value = (await Promise.all(
      fact.relatedCards.map(id => getCardById(id))
    )).filter((c): c is KnowledgeCard => c !== undefined)
  } catch (e: any) {
    funFactError.value = e?.data?.statusMessage || e?.message || '生成冷知识失败'
  } finally {
    funFactLoading.value = false
  }
}

async function tryAnotherFact(): Promise<void> {
  if (currentFunFact.value) {
    addToShownFacts(currentFunFact.value)
  }
  await generateFunFact()
}

function getOptionResultClass(optionId: string, result: QuizResult): string {
  if (optionId === result.selectedAnswer && result.isCorrect) {
    return 'border-green-400 bg-green-50'
  }
  if (optionId === result.selectedAnswer && !result.isCorrect) {
    return 'border-red-400 bg-red-50'
  }
  if (optionId === todaysQuiz.value?.correctAnswer) {
    return 'border-green-400 bg-green-50'
  }
  return 'border-macaron-border bg-macaron-card opacity-60'
}

function getOptionCircleClass(optionId: string, result: QuizResult): string {
  if (optionId === result.selectedAnswer && result.isCorrect) {
    return 'bg-green-500 text-white'
  }
  if (optionId === result.selectedAnswer && !result.isCorrect) {
    return 'bg-red-500 text-white'
  }
  if (optionId === todaysQuiz.value?.correctAnswer) {
    return 'bg-green-500 text-white'
  }
  return 'bg-macaron-border/40 text-macaron-text-secondary'
}

function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '专业',
  }
  return labels[difficulty] ?? difficulty
}

function darkenColor(hex: string, amount = 0.3): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.floor(((num >> 16) & 0xFF) * (1 - amount)))
  const g = Math.max(0, Math.floor(((num >> 8) & 0xFF) * (1 - amount)))
  const b = Math.max(0, Math.floor((num & 0xFF) * (1 - amount)))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

function submitQuiz() {
  if (!selectedOption.value || !todaysQuiz.value || alreadyAnswered.value) return

  const isCorrect = selectedOption.value === todaysQuiz.value.correctAnswer
  const result: QuizResult = {
    quizId: todaysQuiz.value.id,
    selectedAnswer: selectedOption.value,
    isCorrect,
    answeredAt: new Date().toISOString(),
  }

  saveQuizResult(result)
  alreadyAnswered.value = true
  todayResult.value = result
  streak.value = getQuizStreak()
  stats.value = getQuizStats()

  answerAnimation.value = isCorrect ? 'correct' : 'wrong'
  setTimeout(() => { answerAnimation.value = null }, 800)
}

// === Practice Mode ===

async function startPractice() {
  isPracticeMode.value = true
  practiceQuiz.value = null
  practiceSelectedOption.value = null
  practiceAnswered.value = false
  practiceResult.value = undefined

  // Try AI generation first
  const excluded = practicedIds.value
  const quiz = await generateQuizFromAI(excluded)
  if (quiz) {
    practiceQuiz.value = quiz
    practicedIds.value.push(quiz.id)
    practiceRelatedCards.value = (await Promise.all(
      (quiz.relatedCards || []).map(id => getCardById(id))
    )).filter((c): c is KnowledgeCard => c !== undefined)
  } else if (aiConfig.value) {
    // AI failed
    practiceQuiz.value = null
  } else {
    // No AI configured, try Supabase fallback
    const { getPracticeQuiz } = await import('~/utils/quizzes')
    const fallbackExcluded = [todaysQuiz.value?.id, ...practicedIds.value].filter(Boolean) as string[]
    const fallback = await getPracticeQuiz(fallbackExcluded)
    if (fallback) {
      practiceQuiz.value = fallback
      practicedIds.value.push(fallback.id)
      practiceRelatedCards.value = (await Promise.all(
        fallback.relatedCards.map(id => getCardById(id))
      )).filter((c): c is KnowledgeCard => c !== undefined)
    } else {
      practiceQuiz.value = null
    }
  }
}

function submitPracticeQuiz() {
  if (!practiceSelectedOption.value || !practiceQuiz.value || practiceAnswered.value) return

  const isCorrect = practiceSelectedOption.value === practiceQuiz.value.correctAnswer
  const result: QuizResult = {
    quizId: practiceQuiz.value.id,
    selectedAnswer: practiceSelectedOption.value,
    isCorrect,
    answeredAt: new Date().toISOString(),
    isPractice: true,
  }

  savePracticeResult(result)
  practicedIds.value.push(practiceQuiz.value.id)
  practiceAnswered.value = true
  practiceResult.value = result
  practiceStats.value = getPracticeStats()

  answerAnimation.value = isCorrect ? 'correct' : 'wrong'
  setTimeout(() => { answerAnimation.value = null }, 800)
}

function exitPractice() {
  isPracticeMode.value = false
  practiceQuiz.value = null
  practiceRelatedCards.value = []
  practiceSelectedOption.value = null
  practiceAnswered.value = false
  practiceResult.value = undefined
}

onMounted(async () => {
  if (import.meta.client) {
    streak.value = getQuizStreak()
    stats.value = getQuizStats()
    practiceStats.value = getPracticeStats()

    // Check if already answered today
    const results = getQuizResults()
    const today = new Date().toISOString().split('T')[0]
    const todayRes = results.find(r => r.answeredAt.split('T')[0] === today)
    if (todayRes) {
      alreadyAnswered.value = true
      todayResult.value = todayRes
    }

    // Load AI config
    await loadAiConfig()

    // Auto-generate daily quiz via AI if no cached quiz exists
    if (!todaysQuiz.value) {
      if (aiConfig.value) {
        const quiz = await generateQuizFromAI()
        if (quiz) {
          todaysQuiz.value = quiz
          cacheDailyQuiz(quiz)
          relatedQuizCards.value = (await Promise.all(
            (quiz.relatedCards || []).map(id => getCardById(id))
          )).filter((c): c is KnowledgeCard => c !== undefined)
        }
      }
    }

    // Load cached fun fact or auto-generate one
    const cachedFact = getTodayFunFactCache()
    if (cachedFact) {
      currentFunFact.value = cachedFact
      funFactRelatedCards.value = (await Promise.all(
        cachedFact.relatedCards.map(id => getCardById(id))
      )).filter((c): c is KnowledgeCard => c !== undefined)
    } else if (aiConfig.value) {
      await generateFunFact()
    }
  }
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
