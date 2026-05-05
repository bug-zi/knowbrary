<template>
  <div class="h-[calc(100dvh-7.5rem)] max-w-3xl mx-auto">
    <!-- No AI config -->
    <div v-if="!activeConfig && !isLoading" class="flex items-center justify-center h-full px-6">
      <div class="text-center">
        <div class="w-16 h-16 rounded-2xl bg-macaron-badge-bg flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:message-circle-heart" class="w-8 h-8 text-macaron-text-secondary" />
        </div>
        <h2 class="text-lg font-semibold text-macaron-text mb-2">先配置 AI 模型</h2>
        <p class="text-sm text-macaron-text-secondary mb-5 max-w-xs mx-auto">
          请在「研究员 → AI 配置」中启用一个模型，才能开始谈心
        </p>
        <NuxtLink
          to="/profile/ai"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors no-underline"
        >
          <Icon name="lucide:settings" class="w-4 h-4" />
          去配置
        </NuxtLink>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="isLoading" class="flex items-center justify-center h-full">
      <div class="flex gap-1">
        <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 0ms" />
        <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 150ms" />
        <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 300ms" />
      </div>
    </div>

    <!-- Welcome state -->
    <div v-else-if="pageState === 'welcome'" class="flex flex-col h-full overflow-y-auto">
      <DialogueWelcome
        @select-topic="handleSelectTopic"
      />

      <!-- Recent sessions -->
      <div v-if="sessions.length > 0" class="px-4 pb-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-macaron-text flex items-center gap-2">
            <Icon name="lucide:history" class="w-4 h-4 text-macaron-cta" />
            对话记录
          </h3>
        </div>
        <div class="space-y-2">
          <div
            v-for="session in sessions.slice(0, 5)"
            :key="session.id"
            class="card-base p-3.5 cursor-pointer hover:border-macaron-cta/30 transition-all"
            @click="selectSession(session.id)"
          >
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-sm font-medium text-macaron-text truncate">{{ session.title || '未命名对话' }}</h4>
              <div class="flex items-center gap-1.5 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full" :class="session.status === 'active' ? 'bg-green-400' : 'bg-macaron-text-secondary/30'" />
                <Icon v-if="session.report" name="lucide:file-text" class="w-3.5 h-3.5 text-macaron-cta/60" />
                <button
                  class="w-6 h-6 flex items-center justify-center rounded-full text-macaron-text-secondary/40 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors bg-transparent border-none cursor-pointer"
                  @click.stop="removeSession(session.id)"
                >
                  <Icon name="lucide:trash-2" class="w-3 h-3" />
                </button>
              </div>
            </div>
            <p v-if="session.messages.length" class="text-xs text-macaron-text-secondary truncate mt-1">
              {{ session.messages[session.messages.length - 1].content }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat state -->
    <DialogueChat
      v-else-if="pageState === 'chat'"
      :session="currentSession"
      :is-typing="isTyping"
      :error="errorMessage"
      @back="handleChatBack"
      @send="sendMessage"
      @end="endConversation"
      @delete="handleDeleteCurrent"
    />

    <!-- Report state -->
    <DialogueReport
      v-else-if="pageState === 'report'"
      :report="currentSession?.report || null"
      @back="goToWelcome"
    />
  </div>

  <!-- History FAB (only on welcome state) -->
  <button
    v-if="pageState === 'welcome' && activeConfig && sessions.length > 0"
    class="fixed right-5 bottom-24 w-12 h-12 rounded-full bg-macaron-cta text-white shadow-lg flex items-center justify-center z-40 border-none cursor-pointer hover:bg-macaron-cta-hover active:scale-95 transition-all"
    @click="showHistory = true"
  >
    <Icon name="lucide:history" class="w-5 h-5" />
  </button>

  <!-- History overlay -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="showHistory" class="fixed inset-0 z-[150] bg-macaron-bg">
        <DialogueList
          :sessions="sessions"
          @back="showHistory = false"
          @select-session="handleSelectSession"
          @delete-session="handleDeleteSession"
        />
      </div>
    </Transition>
  </Teleport>

  <!-- Report generating overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isGeneratingReport" class="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center">
        <div class="bg-macaron-card rounded-2xl p-6 w-64 text-center border border-macaron-border shadow-xl">
          <div class="flex gap-1 justify-center mb-3">
            <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 0ms" />
            <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 150ms" />
            <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 300ms" />
          </div>
          <p class="text-sm text-macaron-text font-medium">正在回顾我们的对话...</p>
          <p class="text-xs text-macaron-text-secondary mt-1">AI 正在生成交流报告</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { DialogueTopic } from '~/types/dialogue'
import { DIALOGUE_TOPICS } from '~/types/dialogue'

definePageMeta({ layout: 'default' })

const {
  pageState,
  currentSession,
  sessions,
  isTyping,
  isGeneratingReport,
  errorMessage,
  activeConfig,
  loadSessions,
  loadActiveConfig,
  startNewSession,
  selectSession,
  sendMessage,
  endConversation,
  goToWelcome,
  removeSession,
} = useDialogue()

const { syncFromSupabase } = useAiConfig()

const isLoading = ref(true)
const showHistory = ref(false)

async function handleSelectTopic(topic: DialogueTopic | null) {
  const session = startNewSession(topic)

  // If topic has an example prompt, send it as the first user message
  if (topic) {
    const topicMeta = DIALOGUE_TOPICS.find(t => t.id === topic)
    if (topicMeta?.examplePrompt) {
      await sendMessage(topicMeta.examplePrompt)
    }
  }
}

function handleChatBack() {
  goToWelcome()
}

function handleSelectSession(id: string) {
  showHistory.value = false
  selectSession(id)
}

function handleDeleteCurrent() {
  if (currentSession.value) {
    removeSession(currentSession.value.id)
  }
}

function handleDeleteSession(id: string) {
  removeSession(id)
}

onMounted(async () => {
  await syncFromSupabase()
  loadSessions()
  isLoading.value = false
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
