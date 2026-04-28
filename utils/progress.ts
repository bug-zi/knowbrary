import type { LearningPath, PathNode } from '~/types/paths'

const PROGRESS_KEY = 'wanxiang-progress'
const LEARNED_KEY = 'wanxiang-learned'

export function getLearnedCardIds(): string[] {
  if (import.meta.server) return []
  const stored = localStorage.getItem(LEARNED_KEY)
  return stored ? JSON.parse(stored) : []
}

export function markCardLearned(cardId: string) {
  const learned = getLearnedCardIds()
  if (!learned.includes(cardId)) {
    learned.push(cardId)
    localStorage.setItem(LEARNED_KEY, JSON.stringify(learned))
  }
}

export function isCardLearned(cardId: string): boolean {
  return getLearnedCardIds().includes(cardId)
}

export function getNodeState(node: PathNode, path: LearningPath): 'completed' | 'available' | 'locked' {
  const learned = getLearnedCardIds()

  if (learned.includes(node.cardId)) return 'completed'

  // Check if all prerequisite nodes are completed
  const prereqs = path.edges.filter(e => e.to === node.id && e.type === 'prerequisite')
  const allPrereqsDone = prereqs.every(e => {
    const prereqNode = path.nodes.find(n => n.id === e.from)
    return prereqNode && learned.includes(prereqNode.cardId)
  })

  // Root nodes (no incoming edges) are always available
  const hasIncoming = path.edges.some(e => e.to === node.id && e.type === 'prerequisite')
  if (!hasIncoming) return 'available'

  return allPrereqsDone ? 'available' : 'locked'
}

export function getPathProgress(path: LearningPath): { completed: number; total: number; percentage: number } {
  const learned = getLearnedCardIds()
  const requiredNodes = path.nodes.filter(n => n.type === 'required')
  const completed = requiredNodes.filter(n => learned.includes(n.cardId)).length
  const total = requiredNodes.length
  return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
}

export function getOverallProgress(): Record<string, { completed: number; total: number }> {
  if (import.meta.server) return {}
  const stored = localStorage.getItem(PROGRESS_KEY)
  return stored ? JSON.parse(stored) : {}
}
