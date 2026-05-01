<template>
  <div class="space-y-4">
    <!-- Top bar -->
    <div class="flex items-center justify-between">
      <button
        class="flex items-center gap-1.5 text-macaron-cta hover:text-macaron-text transition-colors text-sm font-medium"
        @click="$emit('back')"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
        辨真报告
      </button>
      <button
        class="text-xs px-3 py-1.5 rounded-full border border-macaron-cta/40 text-macaron-cta hover:bg-macaron-cta/5 transition-colors"
        @click="$emit('back')"
      >
        核查新说法
      </button>
    </div>

    <!-- A. Verdict banner -->
    <div class="verdict-banner" :class="report.verdict">
      <div class="flex items-center gap-3 mb-3">
        <Icon :name="verdictIcon" class="w-7 h-7 text-macaron-cta" />
        <div>
          <span class="verdict-label" :class="report.verdict">{{ verdictText }}</span>
        </div>
      </div>
      <p class="text-sm text-macaron-text mb-3 leading-relaxed">"{{ report.claim }}"</p>
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-macaron-text-secondary">置信度</span>
          <span class="font-semibold text-macaron-text">{{ report.confidence }}%</span>
        </div>
        <div class="h-1.5 bg-macaron-progress-track rounded-full overflow-hidden">
          <div
            class="h-full rounded-full bg-macaron-cta transition-all duration-700"
            :style="{ width: `${report.confidence}%` }"
          />
        </div>
      </div>
    </div>

    <!-- B. Summary -->
    <div class="card-base">
      <h3 class="text-sm font-semibold text-macaron-text mb-2 flex items-center gap-2">
        <Icon name="lucide:file-text" class="w-4 h-4 text-macaron-cta" />
        综合评估
      </h3>
      <p class="text-sm text-macaron-text-secondary leading-relaxed">{{ report.summary }}</p>
    </div>

    <!-- C. Breakdown -->
    <div v-if="report.breakdown?.length" class="card-base">
      <h3 class="text-sm font-semibold text-macaron-text mb-3 flex items-center gap-2">
        <Icon name="lucide:list-checks" class="w-4 h-4 text-macaron-cta" />
        说法拆解
      </h3>
      <div class="space-y-3">
        <div
          v-for="(item, i) in report.breakdown"
          :key="i"
          class="flex items-start gap-2.5"
        >
          <Icon :name="breakdownIcon(item.verdict)" class="w-4 h-4 mt-0.5 flex-shrink-0" :class="breakdownColor(item.verdict)" />
          <div>
            <p class="text-sm text-macaron-text">{{ item.aspect }}</p>
            <p class="text-xs text-macaron-text-secondary mt-0.5">{{ item.finding }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- D. Evidence -->
    <div v-if="report.evidenceFor?.length || report.evidenceAgainst?.length" class="card-base">
      <h3 class="text-sm font-semibold text-macaron-text mb-3 flex items-center gap-2">
        <Icon name="lucide:scale" class="w-4 h-4 text-macaron-cta" />
        证据分析
      </h3>
      <div class="space-y-4">
        <!-- Evidence for -->
        <div v-if="report.evidenceFor?.length">
          <p class="text-xs font-medium text-macaron-text-secondary mb-2">支持证据</p>
          <div class="space-y-2">
            <div
              v-for="(e, i) in report.evidenceFor"
              :key="'for-' + i"
              class="flex items-start gap-2"
            >
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-macaron-badge-bg text-macaron-badge-text font-medium mt-0.5 flex-shrink-0">{{ strengthLabel(e.strength) }}</span>
              <p class="text-sm text-macaron-text leading-relaxed">{{ e.point }}</p>
            </div>
          </div>
        </div>
        <!-- Evidence against -->
        <div v-if="report.evidenceAgainst?.length">
          <p class="text-xs font-medium text-macaron-text-secondary mb-2">反对证据</p>
          <div class="space-y-2">
            <div
              v-for="(e, i) in report.evidenceAgainst"
              :key="'against-' + i"
              class="flex items-start gap-2"
            >
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-macaron-badge-bg text-macaron-badge-text font-medium mt-0.5 flex-shrink-0">{{ strengthLabel(e.strength) }}</span>
              <p class="text-sm text-macaron-text leading-relaxed">{{ e.point }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- E. Sources -->
    <div v-if="report.sources?.length" class="card-base">
      <h3 class="text-sm font-semibold text-macaron-text mb-3 flex items-center gap-2">
        <Icon name="lucide:book-open" class="w-4 h-4 text-macaron-cta" />
        参考来源
      </h3>
      <div class="space-y-2.5">
        <div
          v-for="(src, i) in report.sources"
          :key="i"
          class="flex items-start gap-2.5"
        >
          <Icon :name="sourceIcon(src.type)" class="w-4 h-4 mt-0.5 text-macaron-cta flex-shrink-0" />
          <div class="min-w-0">
            <a
              v-if="src.url"
              :href="src.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-macaron-cta hover:underline break-all"
            >{{ src.title }}</a>
            <p v-else class="text-sm text-macaron-text">{{ src.title }}</p>
            <p v-if="src.snippet" class="text-xs text-macaron-text-secondary mt-0.5 line-clamp-2">{{ src.snippet }}</p>
            <span class="text-[10px] text-macaron-muted">{{ sourceReliability(src.reliability) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- F. Key takeaways -->
    <div v-if="report.keyTakeaways?.length" class="card-base">
      <h3 class="text-sm font-semibold text-macaron-text mb-3 flex items-center gap-2">
        <Icon name="lucide:lightbulb" class="w-4 h-4 text-macaron-cta" />
        要点总结
      </h3>
      <div class="space-y-2">
        <div
          v-for="(point, i) in report.keyTakeaways"
          :key="i"
          class="flex items-start gap-2"
        >
          <Icon name="lucide:chevron-right" class="w-4 h-4 mt-0.5 text-macaron-cta flex-shrink-0" />
          <p class="text-sm text-macaron-text leading-relaxed">{{ point }}</p>
        </div>
      </div>
    </div>

    <!-- Save + Footer -->
    <div class="flex items-center justify-between pt-2">
      <span class="text-[11px] text-macaron-muted">核查时间：{{ formatDate(report.checkedAt) }}</span>
      <div class="flex items-center gap-3">
        <span class="text-[11px] text-macaron-muted flex items-center gap-1">
          <Icon name="lucide:info" class="w-3 h-3" />
          AI 生成结果仅供参考
        </span>
      </div>
    </div>

    <!-- Save button -->
    <button
      v-if="!disableSave"
      class="w-full py-3 rounded-xl border-2 border-dashed border-macaron-border text-sm font-medium text-macaron-text-secondary hover:border-macaron-cta hover:text-macaron-cta hover:bg-macaron-badge-bg transition-colors mt-3"
      :class="{
        'border-macaron-cta/40 text-macaron-cta bg-macaron-badge-bg cursor-default': saved,
        'border-red-300 text-red-500': saveError,
        'cursor-pointer': !saved && !saving,
      }"
      :disabled="saving || saved"
      @click="handleSave"
    >
      <span v-if="saving" class="flex items-center justify-center gap-2">
        <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin" />
        保存中...
      </span>
      <span v-else-if="saved" class="flex items-center justify-center gap-2">
        <Icon name="lucide:check" class="w-4 h-4" />
        已保存到记录
      </span>
      <span v-else-if="saveError" class="flex items-center justify-center gap-2">
        <Icon name="lucide:alert-circle" class="w-4 h-4" />
        保存失败，点击重试
      </span>
      <span v-else class="flex items-center justify-center gap-2">
        <Icon name="lucide:bookmark-plus" class="w-4 h-4" />
        保存到核查记录
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { FactCheckReport } from '~/types/fact-check'
import { saveReportToSupabase } from '~/utils/fact-checks'

const props = defineProps<{
  report: FactCheckReport
  disableSave?: boolean
}>()

const emit = defineEmits<{
  back: []
  saved: []
}>()

const saving = ref(false)
const saved = ref(false)
const saveError = ref(false)

async function handleSave() {
  saving.value = true
  saveError.value = false
  const ok = await saveReportToSupabase(props.report)
  saving.value = false
  if (ok) {
    saved.value = true
    emit('saved')
  } else {
    saveError.value = true
  }
}

const verdictMap: Record<string, { text: string; icon: string }> = {
  reliable: { text: '基本可靠', icon: 'lucide:shield-check' },
  unreliable: { text: '不准确', icon: 'lucide:shield-x' },
  'partially-reliable': { text: '部分可靠', icon: 'lucide:shield-alert' },
  unverifiable: { text: '无法验证', icon: 'lucide:shield-off' },
}

const verdictText = computed(() => verdictMap[props.report.verdict]?.text || '未知')
const verdictIcon = computed(() => verdictMap[props.report.verdict]?.icon || 'lucide:shield-off')

function breakdownIcon(v: string) {
  if (v === 'confirmed') return 'lucide:check-circle'
  if (v === 'refuted') return 'lucide:x-circle'
  return 'lucide:help-circle'
}

function breakdownColor(v: string) {
  if (v === 'confirmed') return 'text-macaron-cta'
  if (v === 'refuted') return 'text-macaron-text-secondary'
  return 'text-macaron-muted'
}

function strengthLabel(s: string) {
  if (s === 'strong') return '强'
  if (s === 'moderate') return '中'
  return '弱'
}

function sourceIcon(type: string) {
  if (type === 'official') return 'lucide:shield-check'
  if (type === 'academic') return 'lucide:graduation-cap'
  if (type === 'media') return 'lucide:newspaper'
  return 'lucide:book-open'
}

function sourceReliability(r: string) {
  if (r === 'high') return '高可信'
  if (r === 'medium') return '中等可信'
  return '低可信'
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}
</script>
