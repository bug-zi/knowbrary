import type { KnowledgeCard, InterestProfile, Category } from '~/types'
import { getCategoryMeta } from '~/types'
import { getAllCards } from '~/utils/cards'
import { getLearnedCardIds } from '~/utils/progress'
import { buildGraphData } from '~/utils/graph-data'

export function useRecommendation() {
  let _cardsCache: KnowledgeCard[] | null = null

  async function ensureCards(): Promise<KnowledgeCard[]> {
    if (!_cardsCache) _cardsCache = await getAllCards()
    return _cardsCache
  }

  function invalidateCache() {
    _cardsCache = null
  }

  /**
   * Strategy 1: Graph neighbor recommendations
   * Get cards directly connected to a given card in the knowledge graph.
   */
  async function getRelatedCards(cardId: string, limit = 6): Promise<KnowledgeCard[]> {
    const [cards, graphData] = await Promise.all([ensureCards(), buildGraphData()])
    const learned = new Set(getLearnedCardIds())
    const cardMap = new Map(cards.map(c => [c.id, c]))

    // Get neighbors from adjacency map
    const neighborIds = graphData.adjacencyMap.get(cardId)
    if (!neighborIds || neighborIds.size === 0) {
      // Fallback: same-tag cards
      return getSameTagCards(cardId, limit)
    }

    // Score neighbors by link weight
    const neighborScores = new Map<string, number>()
    for (const link of graphData.links) {
      const s = typeof link.source === 'string' ? link.source : link.source.id
      const t = typeof link.target === 'string' ? link.target : link.target.id
      if (s === cardId && neighborIds.has(t)) neighborScores.set(t, link.weight)
      else if (t === cardId && neighborIds.has(s)) neighborScores.set(s, link.weight)
    }

    const sorted = [...neighborScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .filter(id => !learned.has(id))

    const result = sorted
      .map(id => cardMap.get(id))
      .filter((c): c is KnowledgeCard => !!c)
      .slice(0, limit)

    // Fallback if not enough
    if (result.length < limit) {
      const fallback = await getSameTagCards(cardId, limit - result.length)
      const existingIds = new Set(result.map(c => c.id))
      for (const c of fallback) {
        if (!existingIds.has(c.id)) result.push(c)
      }
    }

    return result
  }

  /**
   * Fallback: get cards sharing tags with the given card
   */
  async function getSameTagCards(cardId: string, limit: number): Promise<KnowledgeCard[]> {
    const cards = await ensureCards()
    const learned = new Set(getLearnedCardIds())
    const card = cards.find(c => c.id === cardId)
    if (!card) return []

    const cardTags = new Set(card.tags)
    return cards
      .filter(c => c.id !== cardId && !learned.has(c.id))
      .map(c => ({
        card: c,
        score: c.tags.filter(t => cardTags.has(t)).length,
      }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.card)
      .slice(0, limit)
  }

  /**
   * Strategy 2: Review recommendations
   * Recommends cards for review based on user's reviewed-card interest tags.
   * Falls back to random diverse cards when no review history exists.
   */
  async function getPersonalizedCards(limit = 6): Promise<KnowledgeCard[]> {
    const cards = await ensureCards()
    const reviewed = new Set(getLearnedCardIds())

    if (cards.length === 0) return []

    // Build interest tag scores from reviewed cards
    const tagScores = new Map<string, number>()
    for (const card of cards) {
      if (!reviewed.has(card.id)) continue
      for (const tag of card.tags) {
        tagScores.set(tag, (tagScores.get(tag) || 0) + 1)
      }
    }

    // Score unreviewed cards by tag overlap with user interests
    const scored = cards
      .filter(c => !reviewed.has(c.id))
      .map(c => ({
        card: c,
        score: c.tags.reduce((sum, t) => sum + (tagScores.get(t) || 0), 0),
      }))
      .sort((a, b) => b.score - a.score)

    // Diversify: max 2 per category
    const catCount = new Map<string, number>()
    const result: KnowledgeCard[] = []
    for (const { card } of scored) {
      const catN = catCount.get(card.category) || 0
      if (catN >= 2) continue
      catCount.set(card.category, catN + 1)
      result.push(card)
      if (result.length >= limit) break
    }

    // If not enough scored cards (no review history), pick random diverse cards
    if (result.length < limit) {
      const existingIds = new Set(result.map(c => c.id))
      const remaining = cards.filter(c => !existingIds.has(c.id))
      // Shuffle and add
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]]
      }
      for (const c of remaining) {
        const catN = catCount.get(c.category) || 0
        if (catN >= 2) continue
        catCount.set(c.category, catN + 1)
        result.push(c)
        if (result.length >= limit) break
      }
    }

    return result
  }

  /**
   * Strategy 3: Suggest creation directions
   * Find categories where the user has few cards, suggesting areas to explore
   * by creating new cards.
   */
  async function getExploreCards(limit = 4): Promise<{ category: Category; name: string; cardCount: number }[]> {
    const cards = await ensureCards()

    if (cards.length === 0) return []

    // Count cards per category
    const catCounts = new Map<string, number>()
    for (const card of cards) {
      catCounts.set(card.category, (catCounts.get(card.category) || 0) + 1)
    }

    // Suggest categories with fewest cards (most room to explore)
    const suggestions = [...catCounts.entries()]
      .sort((a, b) => a[1] - b[1])
      .slice(0, limit)
      .map(([category, cardCount]) => ({
        category: category as Category,
        name: getCategoryMeta(category as Category).name,
        cardCount,
      }))

    return suggestions
  }

  /**
   * Get user's interest profile for UI display
   */
  async function getUserInterestProfile(): Promise<InterestProfile> {
    const cards = await ensureCards()

    const tagScores = new Map<string, number>()
    const catCounts = new Map<string, number>()

    for (const card of cards) {
      for (const tag of card.tags) {
        tagScores.set(tag, (tagScores.get(tag) || 0) + 1)
      }
      catCounts.set(card.category, (catCounts.get(card.category) || 0) + 1)
    }

    const topTags = [...tagScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, score]) => ({ tag, score }))

    const topCategories = [...catCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([category, count]) => ({
        category,
        name: getCategoryMeta(category as Category).name,
        count,
      }))

    const reviewedCount = getLearnedCardIds().length

    return {
      topTags,
      topCategories,
      totalCards: cards.length,
      totalReviewed: reviewedCount,
    }
  }

  /**
   * Check if user has enough data for recommendations
   */
  function hasUserData(): boolean {
    return getLearnedCardIds().length > 0
  }

  return {
    getRelatedCards,
    getPersonalizedCards,
    getExploreCards,
    getUserInterestProfile,
    hasUserData,
    invalidateCache,
  }
}
