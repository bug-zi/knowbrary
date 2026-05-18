import type { DomainTierConfig, TierLevel, TierStatus } from '~/types/domain-tiers'
import type { KnowledgeCard } from '~/types'

// Tier configurations per category — add new domains here to enable progressive learning
const TIER_CONFIGS: Record<string, DomainTierConfig> = {
  cybersecurity: {
    categoryId: 'cybersecurity',
    beginnerTarget: 5,
    intermediateTarget: 5,
    enabled: true,
  },
}

export function getDomainTierConfig(categoryId: string): DomainTierConfig | null {
  const config = TIER_CONFIGS[categoryId]
  if (!config || !config.enabled) return null
  return config
}

export function isDomainTierEnabled(categoryId: string): boolean {
  return getDomainTierConfig(categoryId) !== null
}

export function computeTierStatus(
  learnedCardIds: string[],
  allCardsInCategory: KnowledgeCard[],
  config: DomainTierConfig,
): TierStatus {
  const learnedSet = new Set(learnedCardIds)

  const beginnerCards = allCardsInCategory.filter(c => c.difficulty === 'beginner')
  const intermediateCards = allCardsInCategory.filter(c => c.difficulty === 'intermediate')
  const advancedCards = allCardsInCategory.filter(c => c.difficulty === 'advanced')

  const beginnerCompleted = beginnerCards.filter(c => learnedSet.has(c.id)).length
  const intermediateCompleted = intermediateCards.filter(c => learnedSet.has(c.id)).length
  const advancedCompleted = advancedCards.filter(c => learnedSet.has(c.id)).length

  const intermediateUnlocked = beginnerCompleted >= config.beginnerTarget
  const advancedUnlocked = intermediateCompleted >= config.intermediateTarget

  let currentTier: TierLevel = 'beginner'
  if (advancedUnlocked) currentTier = 'advanced'
  else if (intermediateUnlocked) currentTier = 'intermediate'

  return {
    currentTier,
    beginnerCompleted,
    beginnerTarget: config.beginnerTarget,
    intermediateCompleted,
    intermediateTarget: config.intermediateTarget,
    advancedCompleted,
    intermediateUnlocked,
    advancedUnlocked,
  }
}

export function isTierUnlocked(status: TierStatus, tier: TierLevel): boolean {
  if (tier === 'beginner') return true
  if (tier === 'intermediate') return status.intermediateUnlocked
  if (tier === 'advanced') return status.advancedUnlocked
  return false
}

export function getUnlockRequirement(config: DomainTierConfig, tier: TierLevel): string | null {
  if (tier === 'beginner') return null
  if (tier === 'intermediate') return `完成 ${config.beginnerTarget} 张入门卡片后解锁`
  if (tier === 'advanced') return `完成 ${config.intermediateTarget} 张进阶卡片后解锁`
  return null
}
