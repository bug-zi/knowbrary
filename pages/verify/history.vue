<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <button
          class="p-2 rounded-lg hover:bg-macaron-hover-bg transition-colors text-macaron-text-secondary hover:text-macaron-text"
          @click="navigateTo('/verify')"
        >
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-macaron-text">核查记录</h1>
          <p class="text-xs text-macaron-text-secondary mt-0.5">共 {{ records.length }} 条记录</p>
        </div>
      </div>
      <button
        v-if="records.length"
        class="text-xs px-3 py-1.5 rounded-full border border-macaron-border text-macaron-text-secondary hover:border-macaron-cta/40 hover:text-macaron-cta transition-colors"
        @click="confirmClear"
      >
        清空记录
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!records.length && !loading" class="text-center py-20 space-y-4">
      <div class="flex justify-center">
        <div class="w-16 h-16 rounded-2xl bg-macaron-badge-bg flex items-center justify-center">
          <Icon name="lucide:inbox" class="w-8 h-8 text-macaron-muted" />
        </div>
      </div>
      <p class="text-sm text-macaron-text-secondary">暂无核查记录</p>
      <button
        class="px-5 py-2 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors"
        @click="navigateTo('/verify')"
      >
        开始核查
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <Icon name="lucide:loader-2" class="w-6 h-6 text-macaron-muted animate-spin mx-auto" />
    </div>

    <!-- Record list -->
    <div v-if="!loading && records.length" class="space-y-3">
      <button
        v-for="record in records"
        :key="record.id"
        class="w-full text-left card-base !p-4 hover:border-macaron-cta/40 transition-colors cursor-pointer"
        @click="selectedRecord = record"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-macaron-text line-clamp-2">{{ record.claim }}</p>
            <p class="text-xs text-macaron-text-secondary mt-1.5 line-clamp-2">{{ record.summary }}</p>
          </div>
          <span class="verdict-label text-[10px] !py-0.5 !px-2 flex-shrink-0" :class="record.verdict">
            {{ verdictLabel(record.verdict) }}
          </span>
        </div>
        <div class="flex items-center gap-3 mt-2.5 text-[11px] text-macaron-muted">
          <span class="flex items-center gap-1">
            <Icon name="lucide:clock" class="w-3 h-3" />
            {{ formatDate(record.created_at) }}
          </span>
          <span class="flex items-center gap-1">
            <Icon name="lucide:gauge" class="w-3 h-3" />
            置信度 {{ record.confidence }}%
          </span>
        </div>
      </button>
    </div>

    <!-- Report overlay -->
    <div
      v-if="selectedRecord"
      class="fixed inset-0 z-50 bg-macaron-bg overflow-y-auto"
    >
      <div class="max-w-3xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between mb-4">
          <button
            class="flex items-center gap-1.5 text-macaron-cta hover:text-macaron-text transition-colors text-sm font-medium"
            @click="selectedRecord = null"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
            返回记录列表
          </button>
          <button
            class="text-xs px-3 py-1.5 rounded-full border border-macaron-border text-macaron-text-secondary hover:text-macaron-cta hover:border-macaron-cta/40 transition-colors"
            @click="confirmDelete(selectedRecord.id)"
          >
            删除此记录
          </button>
        </div>
        <FactCheckReport
          :report="selectedRecord.report"
          :disable-save="true"
          @back="selectedRecord = null"
        />
      </div>
    </div>

    <!-- Confirm dialog -->
    <div
      v-if="showConfirm"
      class="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center px-4"
      @click.self="showConfirm = false"
    >
      <div class="card-base !p-6 max-w-sm w-full text-center space-y-4">
        <Icon name="lucide:trash-2" class="w-8 h-8 text-macaron-text-secondary mx-auto" />
        <p class="text-sm text-macaron-text">{{ confirmMessage }}</p>
        <div class="flex gap-3">
          <button
            class="flex-1 py-2.5 rounded-xl border border-macaron-border text-sm text-macaron-text-secondary hover:bg-macaron-hover-bg transition-colors"
            @click="showConfirm = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-2.5 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors"
            @click="executeConfirm"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FactCheckRecord } from '~/types/fact-check'
import { fetchHistoryFromSupabase } from '~/utils/fact-checks'

definePageMeta({ layout: 'default' })

const records = ref<FactCheckRecord[]>([])
const loading = ref(true)
const selectedRecord = ref<FactCheckRecord | null>(null)

const showConfirm = ref(false)
const confirmMessage = ref('')
let confirmAction: (() => Promise<void>) | null = null

onMounted(async () => {
  records.value = await fetchHistoryFromSupabase(50)
  loading.value = false
})

function verdictLabel(v: string) {
  if (v === 'reliable') return '可靠'
  if (v === 'unreliable') return '不准确'
  if (v === 'partially-reliable') return '部分可靠'
  return '无法验证'
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function confirmClear() {
  confirmMessage.value = '确定要清空所有核查记录吗？此操作不可撤销。'
  confirmAction = async () => {
    const supabase = useSupabase()
    await supabase.from('fact_checks').delete().neq('id', '')
    records.value = []
  }
  showConfirm.value = true
}

function confirmDelete(id: string) {
  confirmMessage.value = '确定要删除这条核查记录吗？'
  confirmAction = async () => {
    const supabase = useSupabase()
    await supabase.from('fact_checks').delete().eq('id', id)
    records.value = records.value.filter(r => r.id !== id)
    selectedRecord.value = null
  }
  showConfirm.value = true
}

async function executeConfirm() {
  showConfirm.value = false
  if (confirmAction) {
    await confirmAction()
    confirmAction = null
  }
}
</script>
