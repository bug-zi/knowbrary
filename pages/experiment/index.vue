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
        :class="activeTab === 'thought'
          ? 'bg-macaron-cta text-white shadow-card'
          : 'bg-macaron-card text-macaron-text-secondary border border-macaron-border hover:bg-macaron-border/30'"
        @click="activeTab = 'thought'"
      >
        思想实验
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
              :class="getOptionResultClass(option.id, todayResult)"
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

          <!-- Come back tomorrow -->
          <div class="text-center mt-6 pt-4 border-t border-macaron-border">
            <p class="text-sm text-macaron-text-secondary">明天的题目已经准备好了，记得回来挑战哦</p>
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
                color: getCategoryMeta(todaysQuiz.category).color === '#FFFFBA' ? '#92600A' : darkenColor(getCategoryMeta(todaysQuiz.category).color)
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

      <!-- No quiz available -->
      <div v-else class="card-base text-center py-12">
        <div class="text-5xl mb-4"><Icon name="lucide:clipboard-list" class="text-5xl" /></div>
        <p class="text-macaron-text-secondary">暂时没有题目，请稍后再来</p>
      </div>
    </div>

    <!-- Tab 2: Thought Experiments -->
    <div v-if="activeTab === 'thought'">
      <div v-if="currentThought" class="card-base">
        <!-- Category Badge -->
        <div class="flex items-center gap-2 mb-4">
          <span
            class="text-xs px-2.5 py-1 rounded-full font-medium"
            :style="{
              backgroundColor: getCategoryMeta(currentThought.category).color + '30',
              color: getCategoryMeta(currentThought.category).color === '#FFFFBA' ? '#92600A' : darkenColor(getCategoryMeta(currentThought.category).color)
            }"
          >
            {{ getCategoryMeta(currentThought.category).name }}
          </span>
        </div>

        <!-- Title -->
        <h2 class="text-lg font-bold text-macaron-text mb-3">{{ currentThought.title }}</h2>

        <!-- Description -->
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-5">
          <p class="text-sm text-macaron-text leading-relaxed whitespace-pre-line">{{ currentThought.description }}</p>
        </div>

        <!-- Choices (before selection) -->
        <div v-if="!selectedChoiceId" class="space-y-3 mb-5">
          <button
            v-for="choice in currentThought.choices"
            :key="choice.id"
            class="w-full text-left px-4 py-3.5 rounded-xl border-2 border-macaron-border bg-macaron-card hover:border-purple-300 hover:bg-macaron-border/30 transition-all duration-200"
            @click="selectThoughtChoice(choice.id)"
          >
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {{ choice.id.toUpperCase() }}
              </span>
              <span class="text-sm text-macaron-text">{{ choice.text }}</span>
            </div>
          </button>
        </div>

        <!-- After choice selection -->
        <template v-else>
          <!-- Show all choices with selection state -->
          <div class="space-y-2 mb-4">
            <div
              v-for="choice in currentThought.choices"
              :key="choice.id"
              class="flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-colors"
              :class="choice.id === selectedChoiceId
                ? 'border-purple-400 bg-purple-50'
                : 'border-macaron-border bg-macaron-card opacity-60'"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                :class="choice.id === selectedChoiceId
                  ? 'bg-purple-500 text-white'
                  : 'bg-macaron-border/40 text-macaron-text-secondary'"
              >
                {{ choice.id.toUpperCase() }}
              </span>
              <span class="text-sm text-macaron-text">{{ choice.text }}</span>
            </div>
          </div>

          <!-- Selected choice analysis -->
          <div class="bg-purple-50 rounded-xl p-4 mb-4">
            <div class="font-medium text-purple-800 text-sm mb-1">你的选择分析</div>
            <p class="text-sm text-purple-900 leading-relaxed">{{ selectedChoiceAnalysis }}</p>
          </div>

          <!-- Final analysis (show after a button click) -->
          <div v-if="showFinalAnalysis" class="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-4 mb-4">
            <div class="font-medium text-indigo-800 text-sm mb-1">深入思考</div>
            <p class="text-sm text-indigo-900 leading-relaxed whitespace-pre-line">{{ currentThought.finalAnalysis }}</p>
          </div>

          <!-- Related cards -->
          <div v-if="showFinalAnalysis && relatedThoughtCards.length > 0" class="mb-4">
            <div class="text-sm font-medium text-macaron-text mb-2">相关知识卡片</div>
            <div class="space-y-2">
              <NuxtLink
                v-for="card in relatedThoughtCards"
                :key="card.id"
                :to="`/cards/${card.slug}`"
                class="flex items-center gap-3 px-4 py-3 rounded-xl bg-macaron-card border border-macaron-border hover:border-purple-300 transition-colors no-underline"
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

          <!-- Action buttons -->
          <div class="flex gap-3">
            <button
              v-if="!showFinalAnalysis"
              class="flex-1 py-3 rounded-xl font-medium text-white bg-purple-500 hover:bg-purple-600 shadow-card transition-colors"
              @click="showFinalAnalysis = true"
            >
              查看完整分析
            </button>
            <button
              class="flex-1 py-3 rounded-xl font-medium transition-colors"
              :class="showFinalAnalysis
                ? 'text-white bg-macaron-cta hover:bg-macaron-cta-hover shadow-card'
                : 'border-2 border-purple-300 text-purple-600 hover:bg-macaron-border/30'"
              @click="tryAnotherThought"
            >
              换一个思想实验
            </button>
          </div>
        </template>
      </div>

      <!-- No thought experiments -->
      <div v-else class="card-base text-center py-12">
        <div class="text-5xl mb-4"><Icon name="lucide:message-circle" class="text-5xl" /></div>
        <p class="text-macaron-text-secondary">暂时没有思想实验，请稍后再来</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCategoryMeta } from '~/types'
import type { KnowledgeCard } from '~/types'
import type { QuizResult } from '~/types/quizzes'
import {
  getTodaysQuiz,
  getRandomThoughtExperiment,
  saveQuizResult,
  getQuizResults,
  getQuizStreak,
  getQuizStats,
} from '~/utils/quizzes'
import { getCardById } from '~/utils/cards'

const activeTab = ref<'quiz' | 'thought'>('quiz')
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

// Thought experiment state - loaded via useAsyncData
const { data: thoughtData } = await useAsyncData('experiment-thought', async () => {
  const thought = await getRandomThoughtExperiment()
  if (!thought) return null
  const relatedCards = (await Promise.all(
    thought.relatedCards.map(id => getCardById(id))
  )).filter((c): c is KnowledgeCard => c !== undefined)
  return { thought, relatedCards }
})

const currentThought = ref(thoughtData.value?.thought ?? null)
const relatedThoughtCards = ref<KnowledgeCard[]>(thoughtData.value?.relatedCards ?? [])
const selectedChoiceId = ref<string | null>(null)
const showFinalAnalysis = ref(false)

// Selected choice analysis text
const selectedChoiceAnalysis = computed(() => {
  if (!currentThought.value || !selectedChoiceId.value) return ''
  const choice = currentThought.value.choices.find(c => c.id === selectedChoiceId.value)
  return choice?.analysis ?? ''
})

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

function darkenColor(hex: string): string {
  // Simple darken: just return a dark text color based on the pastel background
  // Map common pastel colors to readable dark colors
  const colorMap: Record<string, string> = {
    '#FFB3BA': '#9B3545',
    '#BAFFC9': '#2D7A3E',
    '#BAE1FF': '#2D6A8E',
    '#FFFFBA': '#8A8A2D',
    '#E8BAFF': '#7A2D9B',
    '#BAFFEE': '#2D7A6A',
    '#FFD4BA': '#8E5A2D',
    '#C9FFBA': '#4A7A2D',
    '#D4BAFF': '#5A2D8E',
    '#FFDAB9': '#8E5A2D',
    '#FFB3DE': '#9B3570',
    '#B3FFF0': '#2D7A6A',
    '#C9D4FF': '#2D3D8E',
    '#BAFFD4': '#2D7A4A',
    '#FFDFBA': '#8E5A2D',
    '#D4FFBA': '#4A7A2D',
    '#FFE4BA': '#8E5A2D',
    '#FFB3B3': '#9B3535',
    '#D4D4BA': '#5A5A2D',
    '#BAD4FF': '#2D4A8E',
    '#FFBAD4': '#9B2D5A',
    '#B4D4FF': '#2D4A8E',
    '#D4BAE8': '#5A2D7A',
  }
  return colorMap[hex] ?? '#555555'
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
}

function selectThoughtChoice(choiceId: string) {
  selectedChoiceId.value = choiceId
  showFinalAnalysis.value = false
}

async function tryAnotherThought() {
  const excludeId = currentThought.value?.id
  const thought = await getRandomThoughtExperiment(excludeId)
  currentThought.value = thought ?? null
  selectedChoiceId.value = null
  showFinalAnalysis.value = false
  if (thought) {
    relatedThoughtCards.value = (await Promise.all(
      thought.relatedCards.map(id => getCardById(id))
    )).filter((c): c is KnowledgeCard => c !== undefined)
  } else {
    relatedThoughtCards.value = []
  }
}

onMounted(() => {
  if (import.meta.client) {
    streak.value = getQuizStreak()
    stats.value = getQuizStats()

    // Check if already answered today
    const results = getQuizResults()
    const today = new Date().toISOString().split('T')[0]
    const todayRes = results.find(r => r.answeredAt.split('T')[0] === today)
    if (todayRes) {
      alreadyAnswered.value = true
      todayResult.value = todayRes
    }
  }
})
</script>
