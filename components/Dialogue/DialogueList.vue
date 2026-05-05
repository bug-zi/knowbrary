<template>
  <div class="flex flex-col h-full">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-macaron-border bg-macaron-bg/80 backdrop-blur-sm shrink-0">
      <button
        class="flex items-center gap-1.5 text-sm text-macaron-text-secondary hover:text-macaron-cta transition-colors bg-transparent border-none cursor-pointer"
        @click="$emit('back')"
      >
        <Icon name="lucide:chevron-left" class="w-4 h-4" />
        返回
      </button>
      <h2 class="text-sm font-medium text-macaron-text">对话记录</h2>
      <div class="w-16" />
    </div>

    <!-- Session list -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="sessions.length === 0" class="flex items-center justify-center h-64">
        <div class="text-center">
          <Icon name="lucide:message-circle" class="w-10 h-10 text-macaron-text-secondary/20 mx-auto mb-3" />
          <p class="text-sm text-macaron-text-secondary">还没有对话记录</p>
        </div>
      </div>

      <div v-else>
        <div
          v-for="group in groupedSessions"
          :key="group.label"
          class="mb-2"
        >
          <div class="px-4 py-2 sticky top-0 bg-macaron-bg/90 backdrop-blur-sm">
            <span class="text-xs font-medium text-macaron-text-secondary">{{ group.label }}</span>
          </div>
          <div class="px-4 space-y-2">
            <div
              v-for="session in group.sessions"
              :key="session.id"
              class="card-base p-3.5 cursor-pointer hover:border-macaron-cta/30 transition-all active:scale-[0.98]"
              @click="$emit('selectSession', session.id)"
            >
              <div class="flex items-start justify-between gap-2 mb-1.5">
                <h3 class="text-sm font-medium text-macaron-text truncate flex-1">{{ session.title || '未命名对话' }}</h3>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="session.status === 'active' ? 'bg-green-400' : 'bg-macaron-text-secondary/30'"
                  />
                  <Icon v-if="session.report" name="lucide:file-text" class="w-3.5 h-3.5 text-macaron-cta/60" />
                  <button
                    class="w-6 h-6 flex items-center justify-center rounded-full text-macaron-text-secondary/40 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors bg-transparent border-none cursor-pointer"
                    @click.stop="$emit('deleteSession', session.id)"
                  >
                    <Icon name="lucide:trash-2" class="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p v-if="session.messages.length > 0" class="text-xs text-macaron-text-secondary truncate">
                {{ session.messages[session.messages.length - 1].content }}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-[10px] text-macaron-text-secondary/50">{{ formatTime(session.updatedAt) }}</span>
                <span v-if="session.topic && session.topic !== 'free'" class="text-[10px] px-1.5 py-0.5 rounded bg-macaron-badge-bg text-macaron-text-secondary">
                  {{ topicLabel(session.topic) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DialogueSession, DialogueTopic } from '~/types/dialogue'
import { DIALOGUE_TOPICS } from '~/types/dialogue'

const props = defineProps<{
  sessions: DialogueSession[]
}>()

defineEmits<{
  back: []
  selectSession: [id: string]
  deleteSession: [id: string]
}>()

interface SessionGroup {
  label: string
  sessions: DialogueSession[]
}

const groupedSessions = computed<SessionGroup[]>(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: Record<string, DialogueSession[]> = {
    '今天': [],
    '昨天': [],
    '本周': [],
    '更早': [],
  }

  for (const session of props.sessions) {
    const d = new Date(session.updatedAt)
    if (d >= today) groups['今天'].push(session)
    else if (d >= yesterday) groups['昨天'].push(session)
    else if (d >= weekAgo) groups['本周'].push(session)
    else groups['更早'].push(session)
  }

  return Object.entries(groups)
    .filter(([, sessions]) => sessions.length > 0)
    .map(([label, sessions]) => ({ label, sessions }))
})

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function topicLabel(topic: DialogueTopic): string {
  return DIALOGUE_TOPICS.find(t => t.id === topic)?.label || ''
}
</script>
