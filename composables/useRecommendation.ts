import type { KnowledgeCard, InterestProfile, Category } from '~/types'
import { getCategoryMeta } from '~/types'
import { getAllCards } from '~/utils/cards'
import { getFavorites } from '~/utils/favorites'
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
   * Strategy 2: Interest-based tag matching
   * Score unlearned cards by how well their tags match the user's interest profile.
   */
  async function getPersonalizedCards(limit = 6): Promise<KnowledgeCard[]> {
    const cards = await ensureCards()
    const favoriteIds = new Set(getFavorites())
    const learned = new Set(getLearnedCardIds())

    if (favoriteIds.size === 0 && learned.size === 0) return []

    // Build interest tag scores
    const tagScores = new Map<string, number>()
    for (const card of cards) {
      const isFav = favoriteIds.has(card.id)
      const isLearned = learned.has(card.id)
      if (!isFav && !isLearned) continue
      const weight = isFav ? 3 : 1
      for (const tag of card.tags) {
        tagScores.set(tag, (tagScores.get(tag) || 0) + weight)
      }
    }

    // Score unlearned, non-favorite cards
    const scored = cards
      .filter(c => !learned.has(c.id) && !favoriteIds.has(c.id))
      .map(c => ({
        card: c,
        score: c.tags.reduce((sum, t) => sum + (tagScores.get(t) || 0), 0),
      }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)

    // Diversify: avoid too many from same category
    const catCount = new Map<string, number>()
    const result: KnowledgeCard[] = []
    for (const { card } of scored) {
      const catN = catCount.get(card.category) || 0
      if (catN >= 2) continue // max 2 per category
      catCount.set(card.category, catN + 1)
      result.push(card)
      if (result.length >= limit) break
    }

    return result
  }

  /**
   * Strategy 3: Explore unvisited categories
   */
  async function getExploreCards(limit = 4): Promise<KnowledgeCard[]> {
    const cards = await ensureCards()
    const learned = new Set(getLearnedCardIds())
    const favorites = new Set(getFavorites())

    if (learned.size === 0 && favorites.size === 0) return []

    // Find user's visited categories
    const visitedCats = new Set<string>()
    for (const card of cards) {
      if (learned.has(card.id) || favorites.has(card.id)) {
        visitedCats.add(card.category)
      }
    }

    // Find unvisited categories
    const unvisitedCards = cards.filter(c => !visitedCats.has(c.category) && !learned.has(c.id))
    if (unvisitedCards.length === 0) return []

    // Pick top cards from different unvisited categories
    const catCards = new Map<string, KnowledgeCard[]>()
    for (const card of unvisitedCards) {
      const list = catCards.get(card.category) || []
      list.push(card)
      catCards.set(card.category, list)
    }

    const result: KnowledgeCard[] = []
    const categories = [...catCards.keys()]
    // Rotate through categories to diversify
    let idx = 0
    while (result.length < limit && categories.some(c => (catCards.get(c)?.length || 0) > 0)) {
      const cat = categories[idx % categories.length]
      const list = catCards.get(cat)
      if (list && list.length > 0) {
        result.push(list.shift()!)
      }
      idx++
    }

    return result
  }

  /**
   * Get user's interest profile for UI display
   */
  async function getUserInterestProfile(): Promise<InterestProfile> {
    const cards = await ensureCards()
    const favoriteIds = new Set(getFavorites())
    const learned = new Set(getLearnedCardIds())

    const tagScores = new Map<string, number>()
    const catCounts = new Map<string, number>()

    for (const card of cards) {
      const isFav = favoriteIds.has(card.id)
      const isLearned = learned.has(card.id)
      if (!isFav && !isLearned) continue

      const weight = isFav ? 3 : 1
      for (const tag of card.tags) {
        tagScores.set(tag, (tagScores.get(tag) || 0) + weight)
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

    return {
      topTags,
      topCategories,
      totalLearned: learned.size,
      totalFavorites: favoriteIds.size,
    }
  }

  /**
   * Check if user has enough data for recommendations
   */
  function hasUserData(): boolean {
    return getFavorites().length > 0 || getLearnedCardIds().length > 0
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
