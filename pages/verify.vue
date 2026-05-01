<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <!-- Input state -->
    <FactCheckInput
      v-if="state === 'input'"
      :ai-ready="!!activeConfig"
      @submit="startFactCheck"
    />

    <!-- Loading state -->
    <div v-else-if="state === 'loading'" class="text-center py-20 space-y-4">
      <div class="flex justify-center">
        <div class="w-20 h-20 rounded-2xl bg-macaron-badge-bg flex items-center justify-center animate-pulse">
          <Icon name="lucide:shield-check" class="w-10 h-10 text-macaron-cta" />
        </div>
      </div>
      <h2 class="text-lg font-semibold text-macaron-text">{{ loadingStatus }}</h2>
      <div class="w-48 h-1.5 bg-macaron-border rounded-full mx-auto overflow-hidden">
        <div class="h-full bg-macaron-cta rounded-full animate-pulse" style="width: 60%" />
      </div>
      <p class="text-xs text-macaron-text-secondary">
        使用 {{ providerName }} {{ activeConfig?.model }}
      </p>
    </div>

    <!-- Error state -->
    <div v-else-if="state === 'error'" class="text-center py-16 space-y-4">
      <div class="flex justify-center">
        <div class="w-16 h-16 rounded-2xl bg-macaron-badge-bg flex items-center justify-center">
          <Icon name="lucide:alert-circle" class="w-8 h-8 text-macaron-text-secondary" />
        </div>
      </div>
      <h2 class="text-lg font-semibold text-macaron-text">核查失败</h2>
      <p class="text-sm text-macaron-text-secondary max-w-sm mx-auto">{{ errorMessage }}</p>
      <button
        class="px-6 py-2.5 rounded-xl bg-macaron-cta text-white font-semibold hover:bg-macaron-cta-hover transition-colors"
        @click="state = 'input'"
      >
        重新输入
      </button>
    </div>

    <!-- Report state -->
    <FactCheckReport
      v-else-if="state === 'report' && currentReport"
      :report="currentReport"
      @back="state = 'input'"
      @saved="onReportSaved"
    />

    <!-- History section -->
    <div v-if="state === 'input'" class="mt-8">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-macaron-text flex items-center gap-2">
          <Icon name="lucide:history" class="w-4 h-4 text-macaron-cta" />
          最近核查
        </h3>
        <NuxtLink
          v-if="history.length"
          to="/verify/history"
          class="text-xs text-macaron-cta hover:underline"
        >
          查看全部记录
        </NuxtLink>
      </div>
      <FactCheckHistory
        v-if="history.length"
        :records="history"
        @select="onSelectHistory"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CATEGORIES, AI_PROVIDERS, type AIProvider } from '~/types'
import type { FactCheckReport, FactCheckRecord } from '~/types/fact-check'
import { fetchHistoryFromSupabase } from '~/utils/fact-checks'

definePageMeta({ layout: 'default' })

const client = useSupabase()

type PageState = 'input' | 'loading' | 'report' | 'error'
const state = ref<PageState>('input')
const currentReport = ref<FactCheckReport | null>(null)
const errorMessage = ref('')
const history = ref<FactCheckRecord[]>([])

const activeConfig = ref<{ provider: AIProvider; apiKey: string; model: string } | null>(null)

const loadingMessages = [
  '正在理解你的说法...',
  '正在联网搜索相关资料...',
  '交叉验证信息源...',
  '生成核查报告...',
]
const loadingStatus = ref(loadingMessages[0])
let loadingTimer: ReturnType<typeof setInterval> | null = null

const providerName = computed(() => {
  if (!activeConfig.value) return ''
  return AI_PROVIDERS[activeConfig.value.provider]?.name || activeConfig.value.provider
})

// Load active AI config
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

async function loadHistory() {
  history.value = await fetchHistoryFromSupabase()
}

onMounted(async () => {
  await Promise.all([loadActiveConfig(), syncFromSupabase()])
  await loadHistory()
})

function startLoadingAnimation() {
  let idx = 0
  loadingStatus.value = loadingMessages[0]
  loadingTimer = setInterval(() => {
    idx = (idx + 1) % loadingMessages.length
    loadingStatus.value = loadingMessages[idx]
  }, 3000)
}

function stopLoadingAnimation() {
  if (loadingTimer) {
    clearInterval(loadingTimer)
    loadingTimer = null
  }
}

async function startFactCheck(claim: string) {
  if (!activeConfig.value) return

  state.value = 'loading'
  startLoadingAnimation()

  try {
    const result = await $fetch<{
      report: FactCheckReport
      searchResults?: any[]
    }>('/api/ai/fact-check', {
      method: 'POST',
      body: {
        provider: activeConfig.value.provider,
        apiKey: activeConfig.value.apiKey,
        model: activeConfig.value.model,
        claim,
      },
    })

    currentReport.value = result.report
    state.value = 'report'
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || '未知错误，请稍后重试'
    state.value = 'error'
  } finally {
    stopLoadingAnimation()
  }
}

function onSelectHistory(report: any) {
  currentReport.value = report
  state.value = 'report'
}

async function onReportSaved() {
  await loadHistory()
}
</script>
