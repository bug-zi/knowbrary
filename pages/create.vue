<template>
  <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
    <h1 class="text-2xl font-bold text-macaron-text">AI 创作</h1>

    <!-- Step 1: Choose type -->
    <section v-if="step === 1" class="space-y-4">
      <h2 class="text-lg font-semibold text-macaron-text">选择创作类型</h2>
      <div class="grid grid-cols-2 gap-4">
        <button
          class="card-base text-center py-8 hover:border-macaron-cta transition-colors cursor-pointer"
          :class="selectedType === 'card' ? 'border-macaron-cta ring-2 ring-macaron-cta/20' : ''"
          @click="selectedType = 'card'"
        >
          <div class="text-4xl mb-2">📇</div>
          <div class="font-semibold text-macaron-text">知识卡片</div>
          <div class="text-xs text-macaron-text-secondary mt-1">生成单张知识科普卡片</div>
        </button>
        <button
          class="card-base text-center py-8 hover:border-macaron-cta transition-colors cursor-pointer"
          :class="selectedType === 'path' ? 'border-macaron-cta ring-2 ring-macaron-cta/20' : ''"
          @click="selectedType = 'path'"
        >
          <div class="text-4xl mb-2">🌳</div>
          <div class="font-semibold text-macaron-text">技能树</div>
          <div class="text-xs text-macaron-text-secondary mt-1">生成学习路径和技能节点</div>
        </button>
      </div>
      <button
        class="w-full py-3 rounded-xl text-white font-semibold transition-colors"
        :class="selectedType ? 'bg-macaron-cta hover:bg-macaron-cta-hover' : 'bg-macaron-border cursor-not-allowed'"
        :disabled="!selectedType"
        @click="step = 2"
      >
        下一步
      </button>
    </section>

    <!-- Step 2: Choose category -->
    <section v-if="step === 2" class="space-y-4">
      <div class="flex items-center gap-3">
        <button class="text-macaron-text-secondary hover:text-macaron-text transition-colors" @click="step = 1">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h2 class="text-lg font-semibold text-macaron-text">选择领域</h2>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="rounded-xl p-3 text-center border-2 transition-all cursor-pointer"
          :class="selectedCategory === cat.id
            ? 'border-macaron-cta bg-macaron-cta/5'
            : 'border-macaron-border bg-macaron-card hover:border-macaron-cta/40'"
          @click="selectedCategory = cat.id"
        >
          <div class="text-2xl mb-1"><Icon :name="cat.icon" class="text-2xl" /></div>
          <div class="text-xs font-medium text-macaron-text truncate">{{ cat.name }}</div>
        </button>
      </div>
      <button
        class="w-full py-3 rounded-xl text-white font-semibold transition-colors"
        :class="selectedCategory ? 'bg-macaron-cta hover:bg-macaron-cta-hover' : 'bg-macaron-border cursor-not-allowed'"
        :disabled="!selectedCategory"
        @click="startGenerate"
      >
        开始生成
      </button>
    </section>

    <!-- Step 3: Generating -->
    <section v-if="step === 3" class="text-center py-16 space-y-4">
      <div class="text-5xl animate-bounce">🪄</div>
      <h2 class="text-xl font-semibold text-macaron-text">AI 正在创作中...</h2>
      <p class="text-sm text-macaron-text-secondary">正在调用 {{ providerName }} {{ config?.model }}，请稍候</p>
      <div class="w-48 h-1.5 bg-macaron-border rounded-full mx-auto overflow-hidden">
        <div class="h-full bg-macaron-cta rounded-full animate-pulse" style="width: 60%" />
      </div>
    </section>

    <!-- Step 4: Preview -->
    <section v-if="step === 4" class="space-y-4">
      <div class="flex items-center gap-3">
        <button class="text-macaron-text-secondary hover:text-macaron-text transition-colors" @click="step = 2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h2 class="text-lg font-semibold text-macaron-text">预览生成结果</h2>
      </div>

      <!-- Card preview -->
      <div v-if="selectedType === 'card' && generatedCard" class="card-base space-y-4">
        <div>
          <h3 class="text-xl font-bold text-macaron-text">{{ generatedCard.title }}</h3>
          <p class="text-sm text-macaron-text-secondary mt-1">{{ generatedCard.oneLiner }}</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <span :class="`badge-${generatedCard.difficulty}`">
            {{ generatedCard.difficulty === 'beginner' ? '入门' : generatedCard.difficulty === 'intermediate' ? '进阶' : '专业' }}
          </span>
          <span class="text-xs text-macaron-text-secondary">{{ generatedCard.cardType }}</span>
          <span
            v-for="tag in generatedCard.tags"
            :key="tag"
            class="text-xs px-2 py-0.5 rounded-full bg-macaron-bg text-macaron-text-secondary"
          >
            {{ tag }}
          </span>
        </div>

        <div class="prose prose-sm max-w-none text-macaron-text" v-html="renderMarkdown(generatedCard.content)" />

        <div v-if="generatedCard.keyData?.length" class="space-y-2">
          <h4 class="font-semibold text-macaron-text text-sm">核心数据</h4>
          <div
            v-for="(kd, i) in generatedCard.keyData"
            :key="i"
            class="flex items-center gap-2 text-sm"
          >
            <span class="font-medium text-macaron-cta">{{ kd.label }}</span>
            <span class="text-macaron-text">{{ kd.value }}</span>
            <span v-if="kd.description" class="text-macaron-text-secondary">- {{ kd.description }}</span>
          </div>
        </div>
      </div>

      <!-- Path preview -->
      <div v-if="selectedType === 'path' && generatedPath" class="card-base space-y-4">
        <div>
          <h3 class="text-xl font-bold text-macaron-text">{{ generatedPath.title }}</h3>
          <p class="text-sm text-macaron-text-secondary mt-1">{{ generatedPath.description }}</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <Icon :name="generatedPath.icon" class="text-lg" />
          <span :class="`badge-${generatedPath.difficulty}`">
            {{ generatedPath.difficulty === 'beginner' ? '入门' : generatedPath.difficulty === 'intermediate' ? '进阶' : '专业' }}
          </span>
          <span class="text-xs text-macaron-text-secondary">{{ generatedPath.estimatedTime }}</span>
        </div>

        <div class="space-y-2">
          <h4 class="font-semibold text-macaron-text text-sm">技能节点 ({{ generatedPath.nodes?.length || 0 }})</h4>
          <div
            v-for="node in generatedPath.nodes"
            :key="node.id"
            class="flex items-center gap-2 text-sm p-2 rounded-lg bg-macaron-bg"
          >
            <span
              class="w-2 h-2 rounded-full"
              :class="node.type === 'required' ? 'bg-macaron-cta' : node.type === 'optional' ? 'bg-blue-400' : 'bg-yellow-400'"
            />
            <span class="font-medium text-macaron-text">{{ node.cardTitle }}</span>
            <span class="text-xs text-macaron-text-secondary">
              ({{ node.type === 'required' ? '必修' : node.type === 'optional' ? '选修' : '加分' }})
            </span>
            <span v-if="node.cardId" class="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">已有卡片</span>
            <span v-else class="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">新建卡片</span>
          </div>
        </div>
      </div>

      <!-- Error display -->
      <div v-if="generateError" class="card-base border-red-200 bg-red-50">
        <p class="text-sm text-red-600">{{ generateError }}</p>
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 py-3 rounded-xl border-2 border-macaron-border text-macaron-text font-semibold hover:bg-macaron-bg transition-colors"
          @click="startGenerate"
        >
          🔄 重新生成
        </button>
        <button
          v-if="!generateError"
          class="flex-1 py-3 rounded-xl bg-macaron-cta text-white font-semibold hover:bg-macaron-cta-hover transition-colors"
          @click="saveResult"
        >
          💾 保存到数据库
        </button>
      </div>
    </section>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-all"
      :class="toast.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { CATEGORIES, AI_PROVIDERS, type AIProvider, type AIConfig } from '~/types'
import type { Category, KnowledgeCard } from '~/types'
import type { LearningPath } from '~/types/paths'
import { getAllCards, insertCard } from '~/utils/cards'
import { insertPath } from '~/utils/paths'

definePageMeta({ layout: 'default' })

const categories = CATEGORIES
const client = useSupabase()

const step = ref(1)
const selectedType = ref<'card' | 'path' | null>(null)
const selectedCategory = ref<Category | null>(null)
const generating = ref(false)
const generateError = ref('')
const activeConfig = ref<{ provider: AIProvider; apiKey: string; model: string } | null>(null)
const generatedCard = ref<any>(null)
const generatedPath = ref<any>(null)

const toast = ref({ show: false, message: '', success: true })

const providerName = computed(() => {
  if (!activeConfig.value) return ''
  return AI_PROVIDERS[activeConfig.value.provider]?.name || activeConfig.value.provider
})

// Load active AI config from Supabase
const { syncFromSupabase } = useAiConfig()

async function loadActiveConfig() {
  const user = useSupabaseUser()
  if (!user.value) { activeConfig.value = null; return }
  const { data } = await client
    .from('ai_configs')
    .select('*')
    .eq('user_id', user.value.id)
    .eq('is_active', true)
    .limit(1)
  if (data && data.length > 0) {
    activeConfig.value = {
      provider: data[0].provider as AIProvider,
      apiKey: data[0].api_key,
      model: data[0].model,
    }
  }
}

onMounted(async () => {
  await Promise.all([loadActiveConfig(), syncFromSupabase()])
})

function showToast(message: string, success = true) {
  toast.value = { show: true, message, success }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function renderMarkdown(md: string): string {
  // Simple markdown to HTML for preview
  return md
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n/g, '<br>')
}

async function startGenerate() {
  if (!selectedCategory.value) return

  await loadActiveConfig()
  if (!activeConfig.value || !activeConfig.value.apiKey) {
    showToast('请先在「我的 → AI 配置」中启用一个模型', false)
    return
  }

  generating.value = true
  generateError.value = ''
  step.value = 3

  try {
    if (selectedType.value === 'card') {
      const allCards = await getAllCards()
      const existingTitles = allCards
        .filter(c => c.category === selectedCategory.value)
        .map(c => c.title)

      const res = await $fetch('/api/ai/generate-card', {
        method: 'POST',
        body: {
          provider: activeConfig.value.provider,
          apiKey: activeConfig.value.apiKey,
          model: activeConfig.value.model,
          category: selectedCategory.value,
          existingCardTitles: existingTitles,
        },
      })

      generatedCard.value = (res as any).card
    } else {
      const allCards = await getAllCards()
      const categoryCards = allCards
        .filter(c => c.category === selectedCategory.value)
        .map(c => ({ id: c.id, title: c.title, oneLiner: c.oneLiner }))

      const res = await $fetch('/api/ai/generate-path', {
        method: 'POST',
        body: {
          provider: activeConfig.value.provider,
          apiKey: activeConfig.value.apiKey,
          model: activeConfig.value.model,
          category: selectedCategory.value,
          existingPaths: [],
          existingCards: categoryCards,
        },
      })

      generatedPath.value = (res as any).path
    }

    step.value = 4
  } catch (err: any) {
    generateError.value = err?.data?.statusMessage || err?.message || '生成失败，请检查 API 配置'
    step.value = 4
  } finally {
    generating.value = false
  }
}

async function saveResult() {
  try {
    if (selectedType.value === 'card' && generatedCard.value) {
      const card = generatedCard.value as KnowledgeCard
      const result = await insertCard(card)
      if (!result.ok) {
        showToast(`保存失败: ${result.error}`, false)
        return
      }
      showToast('知识卡片已保存！')
    } else if (selectedType.value === 'path' && generatedPath.value) {
      const path = generatedPath.value as LearningPath
      const result = await insertPath(path)
      if (!result.ok) {
        showToast(`保存失败: ${result.error}`, false)
        return
      }
      showToast('技能树已保存！')
    }

    // Reset to step 1 after successful save
    setTimeout(() => {
      step.value = 1
      selectedType.value = null
      selectedCategory.value = null
      generatedCard.value = null
      generatedPath.value = null
    }, 1500)
  } catch (err: any) {
    showToast(err?.message || '保存失败', false)
  }
}
</script>
