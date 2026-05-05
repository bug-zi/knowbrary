import type { DialogueMessage, DialogueReport, DialogueSession, DialogueTopic } from '~/types/dialogue'

const STORAGE_KEY = 'wanxiang-dialogues'

export function getDialogueSessions(): DialogueSession[] {
  if (import.meta.server) return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    const sessions: DialogueSession[] = JSON.parse(stored)
    return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }
  catch {
    return []
  }
}

export function getDialogueSession(id: string): DialogueSession | null {
  return getDialogueSessions().find(s => s.id === id) || null
}

function saveAllSessions(sessions: DialogueSession[]): void {
  if (import.meta.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function saveDialogueSession(session: DialogueSession): void {
  const sessions = getDialogueSessions()
  const idx = sessions.findIndex(s => s.id === session.id)
  if (idx >= 0) {
    sessions[idx] = session
  }
  else {
    sessions.unshift(session)
  }
  saveAllSessions(sessions)
}

export function deleteDialogueSession(id: string): void {
  const sessions = getDialogueSessions().filter(s => s.id !== id)
  saveAllSessions(sessions)
}

export function createDialogueSession(topic?: DialogueTopic | null): DialogueSession {
  const now = new Date().toISOString()
  const session: DialogueSession = {
    id: crypto.randomUUID(),
    title: '',
    topic: topic || null,
    messages: [],
    createdAt: now,
    updatedAt: now,
    status: 'active',
    report: null,
  }
  saveDialogueSession(session)
  return session
}

export function addMessageToSession(sessionId: string, message: DialogueMessage): DialogueSession | null {
  const sessions = getDialogueSessions()
  const session = sessions.find(s => s.id === sessionId)
  if (!session) return null

  session.messages.push(message)
  session.updatedAt = new Date().toISOString()

  // Auto-set title from first user message
  if (!session.title && message.role === 'user') {
    session.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
  }

  saveAllSessions(sessions)
  return session
}

export function endDialogueSession(sessionId: string): void {
  const sessions = getDialogueSessions()
  const session = sessions.find(s => s.id === sessionId)
  if (!session) return

  session.status = 'ended'
  session.updatedAt = new Date().toISOString()
  saveAllSessions(sessions)
}

export function saveDialogueReport(sessionId: string, report: DialogueReport): void {
  const sessions = getDialogueSessions()
  const session = sessions.find(s => s.id === sessionId)
  if (!session) return

  session.report = report
  session.updatedAt = new Date().toISOString()
  saveAllSessions(sessions)
}
