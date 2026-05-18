export type TierLevel = 'beginner' | 'intermediate' | 'advanced'

export interface DomainTierConfig {
  categoryId: string
  beginnerTarget: number      // unlock intermediate after completing this many beginner cards
  intermediateTarget: number  // unlock advanced after completing this many intermediate cards
  enabled: boolean
}

export interface TierStatus {
  currentTier: TierLevel
  beginnerCompleted: number
  beginnerTarget: number
  intermediateCompleted: number
  intermediateTarget: number
  advancedCompleted: number
  intermediateUnlocked: boolean
  advancedUnlocked: boolean
}
