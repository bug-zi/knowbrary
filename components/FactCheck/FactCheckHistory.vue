<template>
  <div class="space-y-2">
    <div v-if="!records.length" class="text-xs text-macaron-muted text-center py-4">
      暂无核查记录
    </div>

    <div v-else>
      <button
        v-for="record in records"
        :key="record.id"
        class="w-full text-left card-base !p-3 hover:border-macaron-cta/40 transition-colors cursor-pointer"
        @click="$emit('select', record.report || record)"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm text-macaron-text truncate flex-1">{{ record.claim }}</p>
          <span class="verdict-label text-[10px] !py-0.5 !px-2 flex-shrink-0" :class="record.verdict">
            {{ verdictShort(record.verdict) }}
          </span>
        </div>
        <p class="text-[11px] text-macaron-muted mt-1">{{ formatDate(record.created_at) }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FactCheckRecord } from '~/types/fact-check'

defineProps<{
  records: FactCheckRecord[]
}>()

defineEmits<{
  select: [report: any]
}>()

function verdictShort(v: string) {
  if (v === 'reliable') return '可靠'
  if (v === 'unreliable') return '不准确'
  if (v === 'partially-reliable') return '部分可靠'
  return '无法验证'
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 60) return `${diffMin}分钟前`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}小时前`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `${diffD}天前`
    return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  } catch {
    return ''
  }
}
</script>
