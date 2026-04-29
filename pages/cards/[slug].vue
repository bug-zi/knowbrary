<template>
  <div class="card-detail-page relative overflow-hidden">
    <!-- Background image -->
    <div
      class="fixed inset-0 bg-cover bg-center bg-no-repeat"
      style="background-image: url('/bg1.png'); z-index: 0;"
    >
      <div class="absolute inset-0 bg-macaron-card/40"></div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 max-w-2xl mx-auto px-3 pt-2 pb-1 h-full flex flex-col">
      <template v-if="card">
        <!-- Top bar -->
        <div class="flex items-center justify-between mb-1.5">
          <NuxtLink
            :to="backTo"
            class="flex items-center gap-1.5 text-macaron-cta hover:text-macaron-text transition-colors no-underline text-sm font-medium"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
            {{ backLabel }}
          </NuxtLink>

          <span class="text-xs text-macaron-text-secondary tabular-nums font-medium">
            {{ currentSlide + 1 }} / {{ totalSlides }}
          </span>

          <div class="flex items-center gap-0.5">
            <button
              class="p-1.5 rounded-lg hover:bg-macaron-hover-bg transition-colors"
              @click="handleFavorite"
              :aria-label="isFav ? '取消收藏' : '收藏'"
            >
              <Icon
                name="lucide:star"
                class="w-4 h-4"
                :class="isFav ? 'text-macaron-cta' : 'text-macaron-muted'"
                :style="isFav ? 'fill: var(--macaron-cta)' : ''"
              />
            </button>
            <button
              v-if="card && card.id.startsWith('ai-')"
              class="p-1.5 rounded-lg hover:bg-macaron-danger-hover transition-colors text-macaron-muted hover:text-red-500"
              @click="handleDeleteCard"
              aria-label="删除卡片"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="h-1 bg-macaron-progress-track rounded-full mb-2 overflow-hidden flex-shrink-0">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out bg-macaron-cta"
            :style="{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }"
          />
        </div>

        <!-- Slide area -->
        <div class="relative flex-1 min-h-0">
          <!-- Slide track -->
          <div
            ref="slideContainer"
            class="h-full overflow-hidden cursor-pointer"
            @click="onSlideClick"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <div
              class="flex transition-transform duration-300 ease-out"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
              <!-- Slide 0: Header -->
              <div class="w-full flex-shrink-0 px-0.5">
                <div class="card-detail-card overflow-hidden">
                  <div class="p-4 md:p-5">
                    <!-- Tags row -->
                    <div class="flex items-center gap-1.5 mb-2.5 flex-wrap">
                      <span class="card-warm-badge">
                        <Icon :name="categoryMeta.icon" class="inline w-3.5 h-3.5 align-text-bottom" />
                        {{ categoryMeta.name }}
                      </span>
                      <span :class="`badge-${card.difficulty}`">
                        <Icon :name="DIFFICULTY_LABELS[card.difficulty].icon" class="inline w-3.5 h-3.5 align-text-bottom" />
                        {{ DIFFICULTY_LABELS[card.difficulty].label }}
                      </span>
                      <span class="card-warm-tag">
                        {{ CARD_TYPE_LABELS[card.cardType] }}
                      </span>
                    </div>

                    <!-- Title -->
                    <h1 class="text-xl md:text-2xl font-bold text-macaron-text leading-tight tracking-tight">
                      {{ card.title }}
                    </h1>

                    <!-- One-liner -->
                    <p class="mt-2.5 text-sm md:text-base text-macaron-text-secondary leading-relaxed">
                      {{ card.oneLiner }}
                    </p>

                    <!-- Tags -->
                    <div v-if="card.tags.length" class="flex flex-wrap gap-1.5 mt-3">
                      <span v-for="tag in card.tags.slice(0, 6)" :key="tag" class="card-warm-tag">
                        {{ tag }}
                      </span>
                    </div>

                    <!-- Swipe hint -->
                    <div class="flex items-center gap-1.5 mt-4 text-macaron-muted/80">
                      <Icon name="lucide:chevrons-right" class="w-3.5 h-3.5" />
                      <span class="text-xs">左右滑动或点击卡片继续阅读</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Content slides -->
              <div v-for="(chunk, i) in contentChunks" :key="'content-' + i" class="w-full flex-shrink-0 px-0.5">
                <div class="card-detail-card overflow-hidden">
                  <div class="p-4 md:p-5 max-h-[calc(100dvh-12rem)] overflow-y-auto">
                    <div class="flex-1 prose prose-sm max-w-none card-prose" v-html="chunk" />
                    <div class="mt-3 pt-2 border-t border-macaron-border/50 flex items-center justify-between flex-shrink-0">
                      <span class="text-xs text-macaron-muted/70">{{ card.title }}</span>
                      <span class="text-xs text-macaron-muted/70 tabular-nums">{{ 1 + i + 1 }} / {{ totalSlides }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Key Data slide -->
              <div v-if="card.keyData.length" class="w-full flex-shrink-0 px-0.5">
                <div class="card-detail-card overflow-hidden">
                  <div class="p-4 md:p-5 max-h-[calc(100dvh-12rem)] overflow-y-auto">
                    <h2 class="text-lg font-semibold text-macaron-text mb-3 flex items-center gap-2 flex-shrink-0">
                      <Icon name="lucide:bar-chart-3" class="w-5 h-5 text-macaron-cta" />
                      关键数据
                    </h2>
                    <div class="space-y-2 flex-1">
                      <div
                        v-for="data in card.keyData"
                        :key="data.label"
                        class="p-3 rounded-xl bg-macaron-card/40 backdrop-blur-sm"
                      >
                        <div class="font-medium text-macaron-text text-sm">{{ data.label }}</div>
                        <div class="text-xl font-bold mt-1.5" :style="{ color: categoryMeta.color }">{{ data.value }}</div>
                        <div v-if="data.description" class="text-xs text-macaron-text-secondary mt-1.5 leading-relaxed">{{ data.description }}</div>
                      </div>
                    </div>
                    <div class="mt-3 pt-2 border-t border-macaron-border/50 flex items-center justify-between flex-shrink-0">
                      <span class="text-xs text-macaron-muted/70">{{ card.title }}</span>
                      <span class="text-xs text-macaron-muted/70 tabular-nums">{{ keyDataSlideIndex + 1 }} / {{ totalSlides }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- References slide -->
              <div v-if="card.references.length" class="w-full flex-shrink-0 px-0.5">
                <div class="card-detail-card overflow-hidden">
                  <div class="p-4 md:p-5 max-h-[calc(100dvh-12rem)] overflow-y-auto">
                    <h2 class="text-lg font-semibold text-macaron-text mb-3 flex items-center gap-2 flex-shrink-0">
                      <Icon name="lucide:book-open" class="w-5 h-5 text-macaron-cta" />
                      来源引用
                    </h2>
                    <div class="space-y-2 flex-1">
                      <div
                        v-for="ref in card.references"
                        :key="ref.id"
                        class="p-3 rounded-xl bg-macaron-surface-alt text-sm leading-relaxed"
                      >
                        <span class="text-macaron-text-secondary font-mono text-xs">[{{ ref.id }}]</span>
                        <span class="text-macaron-text ml-1.5">{{ ref.title }}</span>
                        <span v-if="ref.author" class="text-macaron-text-secondary"> — {{ ref.author }}</span>
                      </div>
                    </div>
                    <div class="mt-3 pt-2 border-t border-macaron-border/50 flex items-center justify-between flex-shrink-0">
                      <span class="text-xs text-macaron-muted/70">{{ card.title }}</span>
                      <span class="text-xs text-macaron-muted/70 tabular-nums">{{ refSlideIndex + 1 }} / {{ totalSlides }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Related Cards slide -->
              <div v-if="relatedCards.length" class="w-full flex-shrink-0 px-0.5">
                <div class="card-detail-card overflow-hidden">
                  <div class="p-4 md:p-5 max-h-[calc(100dvh-12rem)] overflow-y-auto">
                    <h2 class="text-lg font-semibold text-macaron-text mb-3 flex items-center gap-2 flex-shrink-0">
                      <Icon name="lucide:link" class="w-5 h-5 text-macaron-cta" />
                      知识邻居
                    </h2>
                    <div class="space-y-2 flex-1">
                      <NuxtLink
                        v-for="related in relatedCards"
                        :key="related.id"
                        :to="`/cards/${related.slug}`"
                        class="flex items-center gap-3 p-3 rounded-xl transition-colors no-underline bg-macaron-surface-alt hover:bg-macaron-hover-bg"
                      >
                        <span
                          class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          :style="{ backgroundColor: getCategoryMeta(related.category).color }"
                        />
                        <span class="text-sm font-medium text-macaron-text">{{ related.title }}</span>
                        <Icon name="lucide:chevron-right" class="w-4 h-4 ml-auto text-macaron-muted/60" />
                      </NuxtLink>
                    </div>
                    <div class="mt-3 pt-2 border-t border-macaron-border/50 flex items-center justify-between flex-shrink-0">
                      <span class="text-xs text-macaron-muted/70">{{ card.title }}</span>
                      <span class="text-xs text-macaron-muted/70 tabular-nums">{{ relatedSlideIndex + 1 }} / {{ totalSlides }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom pagination -->
        <div class="flex items-center justify-center gap-1.5 mt-2 flex-shrink-0 pb-1">
          <button
            v-for="i in totalSlides"
            :key="i"
            class="rounded-full transition-all duration-300"
            :class="i - 1 === currentSlide ? 'w-5 h-2' : 'w-2 h-2'"
            :style="{ backgroundColor: i - 1 === currentSlide ? categoryMeta.color : 'var(--macaron-muted-light)' }"
            @click="goToSlide(i - 1)"
            :aria-label="`第${i}页`"
          />
        </div>
      </template>

      <!-- Not found -->
      <div v-else class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <Icon name="lucide:file-question" class="w-16 h-16 text-macaron-muted-light mx-auto mb-4" />
          <p class="text-macaron-text-secondary text-lg">卡片未找到</p>
          <NuxtLink to="/" class="text-sm text-macaron-text-secondary hover:text-macaron-text mt-2 inline-block no-underline">
            返回首页
          </NuxtLink>
        </div>
      </div>

      <!-- Learning completion overlay -->
      <Transition name="completion">
        <div
          v-if="card && showCompletion"
          class="fixed inset-0 z-40 flex items-end justify-center pb-28 bg-black/10 backdrop-blur-[2px]"
          @click.self="showCompletion = false"
        >
          <div class="bg-macaron-card rounded-t-3xl rounded-b-2xl p-6 mx-4 max-w-sm w-full shadow-2xl border border-macaron-border/60">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center bg-macaron-cta">
                <Icon name="lucide:sparkles" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-base font-bold text-macaron-text">学习完成</h3>
                <p class="text-xs text-macaron-text-secondary">你已阅读完「{{ card.title }}」的所有内容</p>
              </div>
            </div>
            <div class="flex gap-2.5 mt-4">
              <button
                class="flex-1 py-2.5 rounded-xl font-medium text-sm border border-macaron-border text-macaron-text hover:bg-macaron-hover-bg transition-all duration-200 active:scale-[0.97]"
                @click="handleArchive"
              >
                <Icon name="lucide:archive" class="inline w-3.5 h-3.5 align-text-bottom mr-1" />
                归档
              </button>
              <button
                class="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.97]"
                :class="isFav ? 'text-white' : 'text-white'"
                :style="{ background: isFav ? '#BCAAA4' : 'linear-gradient(135deg, #D4A574, #C49A6C)' }"
                @click="handleFavoriteAndClose"
              >
                <Icon name="lucide:star" class="inline w-3.5 h-3.5 align-text-bottom mr-1" :style="isFav ? 'fill: white' : ''" />
                {{ isFav ? '已收藏' : '收藏' }}
              </button>
              <button
                class="flex-1 py-2.5 rounded-xl font-medium text-sm border border-macaron-border text-macaron-text hover:bg-macaron-hover-bg transition-all duration-200 active:scale-[0.97]"
                @click="handleRelearn"
              >
                <Icon name="lucide:rotate-ccw" class="inline w-3.5 h-3.5 align-text-bottom mr-1" />
                重新学习
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Completion success toast -->
      <Transition name="toast">
        <div
          v-if="showCompletionAnimation"
          class="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 bg-macaron-text text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5"
        >
          <Icon name="lucide:check-circle-2" class="w-5 h-5 text-macaron-cta" />
          <span class="font-medium text-sm">{{ completionToastText }}</span>
        </div>
      </Transition>

      <!-- Delete confirmation dialog -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div class="bg-macaron-card rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl border border-macaron-border/60">
          <h3 class="text-lg font-bold text-macaron-text">确认删除</h3>
          <p class="text-sm text-macaron-text-secondary mt-2">删除后无法恢复，确定要删除这张卡片吗？</p>
          <div class="flex gap-3 mt-5">
            <button
              class="flex-1 py-2.5 rounded-xl border border-macaron-border text-macaron-text font-medium hover:bg-macaron-hover-bg transition-colors"
              @click="showDeleteConfirm = false"
            >
              取消
            </button>
            <button
              class="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              @click="confirmDeleteCard"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCardBySlug, getRelatedCards, deleteCard } from '~/utils/cards'
import { getCategoryMeta, DIFFICULTY_LABELS, CARD_TYPE_LABELS } from '~/types'
import { isFavorite, toggleFavorite } from '~/utils/favorites'
import { markCardLearned, isCardLearned } from '~/utils/progress'

const route = useRoute()
const slug = route.params.slug as string

const { data: cardResult } = await useAsyncData(`card-${slug}`, async () => {
  const c = await getCardBySlug(slug)
  if (!c) return null
  const related = await getRelatedCards(c)
  return { card: c, relatedCards: related }
})

const card = cardResult.value?.card ?? null
const relatedCards = cardResult.value?.relatedCards ?? []
const categoryMeta = card ? getCategoryMeta(card.category) : getCategoryMeta('economics')

const fromPath = route.query.from as string | undefined
const backTo = fromPath || `/categories/${card?.category ?? 'economics'}`
const backLabel = fromPath ? '返回路径' : `${categoryMeta.name}`

const isFav = ref(false)
const learnedCompleted = ref(false)
const showCompletion = ref(false)
const showCompletionAnimation = ref(false)
const completionToastText = ref('')
onMounted(() => {
  if (card) {
    isFav.value = isFavorite(card.id)
    learnedCompleted.value = isCardLearned(card.id)
  }
})

function handleFavorite() {
  if (!card) return
  isFav.value = toggleFavorite(card.id)
}

function showToast(text: string) {
  completionToastText.value = text
  showCompletionAnimation.value = true
  setTimeout(() => { showCompletionAnimation.value = false }, 2000)
}

function handleArchive() {
  if (!card) return
  markCardLearned(card.id)
  learnedCompleted.value = true
  showCompletion.value = false
  showToast('已归档')
}

function handleFavoriteAndClose() {
  if (!card) return
  if (!isFav.value) {
    isFav.value = toggleFavorite(card.id)
    showCompletion.value = false
    showToast('已收藏')
  } else {
    showToast('已在收藏夹中')
  }
}

function handleRelearn() {
  if (!card) return
  const key = 'wanxiang-learned'
  const stored = localStorage.getItem(key)
  if (stored) {
    const list: string[] = JSON.parse(stored)
    const filtered = list.filter(id => id !== card!.id)
    localStorage.setItem(key, JSON.stringify(filtered))
  }
  learnedCompleted.value = false
  showCompletion.value = false
  currentSlide.value = 0
}

const showDeleteConfirm = ref(false)
async function handleDeleteCard() {
  if (!card) return
  showDeleteConfirm.value = true
}
async function confirmDeleteCard() {
  if (!card) return
  const result = await deleteCard(card.id)
  if (result.ok) {
    navigateTo(backTo)
  } else {
    alert(result.error || '删除失败')
  }
  showDeleteConfirm.value = false
}

// --- Split content into chunks ---
const contentChunks = computed(() => {
  if (!card) return []
  const html = renderMarkdown(card.content)
  const chunks: string[] = []
  const parts = html.split(/(?=<h[23])/)

  let buffer = ''
  for (const part of parts) {
    if (part.match(/^<h[23]/) && buffer.trim()) {
      chunks.push(buffer)
      buffer = part
    } else {
      buffer += part
    }
  }
  if (buffer.trim()) chunks.push(buffer)

  if (chunks.length === 1 && chunks[0].length > 800) {
    const paragraphs = chunks[0].split('</p>')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => p + '</p>')

    const result: string[] = []
    let group = ''
    let groupLen = 0
    for (const p of paragraphs) {
      if (groupLen > 400 && group) {
        result.push(group)
        group = ''
        groupLen = 0
      }
      group += p
      groupLen += p.length
    }
    if (group) result.push(group)
    return result.length > 0 ? result : chunks
  }

  return chunks
})

function renderMarkdown(text: string): string {
  let html = text
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.split('\n\n').map(block => {
    if (block.startsWith('<h')) return block
    if (block.startsWith('- ')) {
      const items = block.split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('')
      return `<ul>${items}</ul>`
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`
  }).join('')
  return html
}

// --- Slide indices ---
const headerSlideCount = 1
const keyDataSlideIndex = headerSlideCount + contentChunks.value.length
const hasKeyData = computed(() => card && card.keyData.length > 0)
const refSlideIndex = keyDataSlideIndex + (hasKeyData.value ? 1 : 0)
const hasRefs = computed(() => card && card.references.length > 0)
const relatedSlideIndex = refSlideIndex + (hasRefs.value ? 1 : 0)

const totalSlides = computed(() => {
  let count = headerSlideCount + contentChunks.value.length
  if (card?.keyData.length) count++
  if (card?.references.length) count++
  if (relatedCards.length) count++
  return count
})

// --- Slide navigation ---
const currentSlide = ref(0)
const slideContainer = ref<HTMLElement | null>(null)

function nextSlide() {
  if (currentSlide.value < totalSlides.value - 1) {
    currentSlide.value++
  } else if (card) {
    showCompletion.value = true
  }
}
function prevSlide() {
  if (currentSlide.value > 0) currentSlide.value--
}
function onSlideClick(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const clickX = e.clientX - rect.left
  if (clickX < rect.width / 2) prevSlide()
  else nextSlide()
}
function goToSlide(i: number) {
  if (i >= 0 && i < totalSlides.value) currentSlide.value = i
}

// --- Keyboard nav ---
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') { e.preventDefault(); nextSlide() }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide() }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// --- Touch swipe ---
let touchStartX = 0
let touchStartY = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}
function onTouchMove(e: TouchEvent) {
  const dx = Math.abs(e.touches[0].clientX - touchStartX)
  const dy = Math.abs(e.touches[0].clientY - touchStartY)
  if (dx > dy && dx > 10) e.preventDefault()
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx < 0) nextSlide()
    else prevSlide()
  }
}
</script>

<style scoped>
.completion-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.completion-leave-active { transition: all 0.3s ease-in; }
.completion-enter-from { opacity: 0; transform: translateY(100%); }
.completion-leave-to { opacity: 0; transform: translateY(100%); }

.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.3s ease-in; }
.toast-enter-from { opacity: 0; transform: translate(-50%, -20px) scale(0.9); }
.toast-leave-to { opacity: 0; transform: translate(-50%, -20px) scale(0.9); }

.card-prose {
  --tw-prose-body: var(--macaron-prose-body);
  --tw-prose-headings: var(--macaron-prose-heading);
  --tw-prose-bold: var(--macaron-prose-heading);
  --tw-prose-links: var(--macaron-prose-link);
  --tw-prose-bullets: var(--macaron-text-secondary);
  color: var(--macaron-prose-body);
}
</style>
