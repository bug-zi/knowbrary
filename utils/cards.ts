import type { KnowledgeCard, Category, Difficulty, CardType } from '~/types'
import { useSupabase } from './supabase'

// Client-side cache
let _allCards: KnowledgeCard[] | null = null

function mapCard(row: any): KnowledgeCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    oneLiner: row.one_liner,
    category: row.category_id,
    tags: row.tags || [],
    difficulty: row.difficulty,
    cardType: row.card_type,
    content: row.content,
    keyData: row.key_data || [],
    references: row.references || [],
    relatedCards: row.related_card_ids || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAllCards(): Promise<KnowledgeCard[]> {
  if (_allCards) return _allCards

  const sb = useSupabase()
  const { data, error } = await sb.from('cards').select('*').order('id')

  if (error || !data) {
    console.error('Failed to fetch cards:', error?.message)
    return []
  }

  _allCards = data.map(mapCard)
  return _allCards
}

export async function getCardsByCategory(category: Category): Promise<KnowledgeCard[]> {
  const cards = await getAllCards()
  return cards.filter(card => card.category === category)
}

export async function getCardBySlug(slug: string): Promise<KnowledgeCard | undefined> {
  const cards = await getAllCards()
  return cards.find(card => card.slug === slug)
}

export async function getCardById(id: string): Promise<KnowledgeCard | undefined> {
  const cards = await getAllCards()
  return cards.find(card => card.id === id)
}

export async function searchCards(query: string): Promise<KnowledgeCard[]> {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const cards = await getAllCards()
  return cards.filter(card => {
    return (
      card.title.toLowerCase().includes(q) ||
      card.oneLiner.toLowerCase().includes(q) ||
      card.tags.some(tag => tag.toLowerCase().includes(q)) ||
      card.content.toLowerCase().includes(q)
    )
  })
}

export async function filterCards(options: {
  category?: Category
  difficulty?: Difficulty
  cardType?: CardType
}): Promise<KnowledgeCard[]> {
  let cards = await getAllCards()

  if (options.category) {
    cards = cards.filter(c => c.category === options.category)
  }
  if (options.difficulty) {
    cards = cards.filter(c => c.difficulty === options.difficulty)
  }
  if (options.cardType) {
    cards = cards.filter(c => c.cardType === options.cardType)
  }

  return cards
}

export async function getRelatedCards(card: KnowledgeCard): Promise<KnowledgeCard[]> {
  const cards = await getAllCards()
  return card.relatedCards
    .map(id => cards.find(c => c.id === id))
    .filter(Boolean) as KnowledgeCard[]
}

// Invalidate cache (call after mutations)
export function invalidateCardsCache() {
  _allCards = null
}

export async function insertCard(card: KnowledgeCard): Promise<{ ok: boolean; error?: string }> {
  const sb = useSupabase()

  const c = card as any
  const uid = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const row = {
    id: uid,
    slug: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: c.title,
    one_liner: c.oneLiner || c.one_liner || '',
    category_id: c.category || c.category_id || c.categoryId,
    tags: c.tags || [],
    difficulty: c.difficulty || 'beginner',
    card_type: c.cardType || c.card_type || 'concept',
    content: c.content || '',
    key_data: c.keyData || c.key_data || [],
    references: c.references || [],
    related_card_ids: [] as string[],
  }

  const { error } = await sb.from('cards').insert(row)
  if (error) {
    console.error('Failed to insert card:', error.message)
    return { ok: false, error: error.message }
  }

  invalidateCardsCache()
  return { ok: true }
}

export async function deleteCard(id: string): Promise<{ ok: boolean; error?: string }> {
  const sb = useSupabase()
  const { error } = await sb.from('cards').delete().eq('id', id)
  if (error) {
    console.error('Failed to delete card:', error.message)
    return { ok: false, error: error.message }
  }
  invalidateCardsCache()
  return { ok: true }
}
