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

  // All incoming edges (regardless of type) are treated as prerequisites
  const parentEdges = path.edges.filter(e => e.to === node.id)

  // Root nodes (no incoming edges) are always available
  if (parentEdges.length === 0) return 'available'

  const allParentsDone = parentEdges.every(e => {
    const parentNode = path.nodes.find(n => n.id === e.from)
    return parentNode && learned.includes(parentNode.cardId)
  })

  return allParentsDone ? 'available' : 'locked'
}

export function getPathProgress(path: LearningPath): { completed: number; total: number; percentage: number } {
  const learned = getLearnedCardIds()
  const total = path.nodes.length
  const completed = path.nodes.filter(n => learned.includes(n.cardId)).length
  return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
}

export function getOverallProgress(): Record<string, { completed: number; total: number }> {
  if (import.meta.server) return {}
  const stored = localStorage.getItem(PROGRESS_KEY)
  return stored ? JSON.parse(stored) : {}
}
