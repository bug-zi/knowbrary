import type { AIProvider, AIConfig } from '~/types'
import type { DialogueMessage, DialogueReport, DialogueSession, DialogueTopic } from '~/types/dialogue'
import {
  getDialogueSessions,
  getDialogueSession,
  saveDialogueSession,
  deleteDialogueSession,
  createDialogueSession,
  addMessageToSession,
  endDialogueSession,
  saveDialogueReport,
} from '~/utils/dialogue'

type PageState = 'welcome' | 'chat' | 'report'

export function useDialogue() {
  const pageState = ref<PageState>('welcome')
  const currentSessionId = ref<string | null>(null)
  const sessions = ref<DialogueSession[]>([])
  const isTyping = ref(false)
  const isGeneratingReport = ref(false)
  const errorMessage = ref('')

  const activeConfig = ref<{ provider: AIProvider; apiKey: string; model: string } | null>(null)

  // Must be called at setup top level for Nuxt composables to work
  const user = useSupabaseUser()
  const client = useSupabase()

  // Watch for auth state to resolve, then load config
  if (import.meta.client) {
    watch(user, (u) => {
      if (u) loadActiveConfig()
    }, { immediate: true })
  }

  const currentSession = computed<DialogueSession | null>(() => {
    if (!currentSessionId.value) return null
    return sessions.value.find(s => s.id === currentSessionId.value) || null
  })

  function loadSessions() {
    sessions.value = getDialogueSessions()
  }

  async function loadActiveConfig() {
    if (!user.value) {
      activeConfig.value = null
      return
    }
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

  function startNewSession(topic?: DialogueTopic | null) {
    const session = createDialogueSession(topic)
    loadSessions()
    currentSessionId.value = session.id
    pageState.value = 'chat'
    return session
  }

  function selectSession(id: string) {
    const session = sessions.value.find(s => s.id === id)
    if (!session) return
    currentSessionId.value = id
    if (session.report) {
      pageState.value = 'report'
    }
    else if (session.status === 'ended') {
      pageState.value = 'report'
    }
    else {
      pageState.value = 'chat'
    }
  }

  async function sendMessage(content: string) {
    if (!activeConfig.value || !currentSessionId.value) return

    const userMessage: DialogueMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    const updated = addMessageToSession(currentSessionId.value, userMessage)
    if (!updated) return
    loadSessions()

    isTyping.value = true
    errorMessage.value = ''

    try {
      const session = getDialogueSession(currentSessionId.value!)
      if (!session) throw new Error('Session not found')

      const chatMessages = session.messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const result = await $fetch<{ content: string }>('/api/ai/dialogue/chat', {
        method: 'POST',
        body: {
          provider: activeConfig.value!.provider,
          apiKey: activeConfig.value!.apiKey,
          model: activeConfig.value!.model,
          messages: chatMessages,
        },
      })

      const aiMessage: DialogueMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.content,
        timestamp: new Date().toISOString(),
      }

      addMessageToSession(currentSessionId.value!, aiMessage)
      loadSessions()
    }
    catch (err: any) {
      errorMessage.value = err.data?.statusMessage || err.message || '发送失败，请重试'
    }
    finally {
      isTyping.value = false
    }
  }

  async function endConversation() {
    if (!activeConfig.value || !currentSessionId.value) return

    const session = getDialogueSession(currentSessionId.value)
    if (!session || session.messages.length === 0) return

    isGeneratingReport.value = true
    errorMessage.value = ''

    try {
      endDialogueSession(currentSessionId.value)

      const chatMessages = session.messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const result = await $fetch<{ report: DialogueReport }>('/api/ai/dialogue/report', {
        method: 'POST',
        body: {
          provider: activeConfig.value!.provider,
          apiKey: activeConfig.value!.apiKey,
          model: activeConfig.value!.model,
          messages: chatMessages,
          topic: session.topic,
        },
      })

      saveDialogueReport(currentSessionId.value!, result.report)
      loadSessions()
      pageState.value = 'report'
    }
    catch (err: any) {
      errorMessage.value = err.data?.statusMessage || err.message || '报告生成失败'
      // Still mark as ended even if report fails
      loadSessions()
      pageState.value = 'report'
    }
    finally {
      isGeneratingReport.value = false
    }
  }

  function goToWelcome() {
    currentSessionId.value = null
    pageState.value = 'welcome'
    errorMessage.value = ''
  }

  function removeSession(id: string) {
    deleteDialogueSession(id)
    loadSessions()
    if (currentSessionId.value === id) {
      goToWelcome()
    }
  }

  return {
    pageState,
    currentSessionId,
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
  }
}
