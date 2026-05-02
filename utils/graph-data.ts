import type { Category } from '~/types'
import { getAllCards } from './cards'
import { getCategoryMeta } from '~/types'

export interface GraphNode {
  id: string
  label: string
  category: string
  categoryLabel: string
  color: string
  tags: string[]
  connectionCount: number
  // D3 simulation datum fields
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  index?: number
  vx?: number
  vy?: number
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type: 'related' | 'cross-category' | 'tag'
  weight: number        // shared tag count for 'tag' type; 1 for others
  sharedTags?: string[] // which tags created this link
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  adjacencyMap: Map<string, Set<string>>
  maxConnections: number
}

// --- Thresholds ---
const TAG_FANOUT_THRESHOLD = 15  // skip tags appearing on >15 cards

// --- Module-level cache ---
let _graphDataCache: GraphData | null = null

export function invalidateGraphCache(): void {
  _graphDataCache = null
}

export async function buildGraphData(): Promise<GraphData> {
  if (_graphDataCache) return _graphDataCache

  const cards = await getAllCards()
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []
  const linkSet = new Set<string>()
  const adjacencyMap = new Map<string, Set<string>>()
  const connectionCount = new Map<string, number>()

  // O(1) lookup instead of cards.find() inside loop
  const cardMap = new Map(cards.map(c => [c.id, c]))

  for (const card of cards) {
    const meta = getCategoryMeta(card.category)
    nodes.push({
      id: card.id,
      label: card.title,
      category: card.category,
      categoryLabel: meta.name,
      color: meta.color,
      tags: card.tags,
      connectionCount: 0,
    })
    adjacencyMap.set(card.id, new Set())
    connectionCount.set(card.id, 0)
  }

  // --- Manual relatedCards links ---
  for (const card of cards) {
    for (const relatedId of card.relatedCards) {
      const key = [card.id, relatedId].sort().join('::')
      if (linkSet.has(key)) continue
      linkSet.add(key)

      const relatedCard = cardMap.get(relatedId)
      links.push({
        source: card.id,
        target: relatedId,
        type: relatedCard && relatedCard.category !== card.category ? 'cross-category' : 'related',
        weight: 1,
      })

      adjacencyMap.get(card.id)?.add(relatedId)
      if (adjacencyMap.has(relatedId)) {
        adjacencyMap.get(relatedId)!.add(card.id)
      }
      connectionCount.set(card.id, (connectionCount.get(card.id) || 0) + 1)
      connectionCount.set(relatedId, (connectionCount.get(relatedId) || 0) + 1)
    }
  }

  // --- Tag-based auto-linking: inverted index ---
  const tagCardMap = new Map<string, string[]>()
  for (const card of cards) {
    for (const tag of card.tags) {
      const list = tagCardMap.get(tag) || []
      list.push(card.id)
      tagCardMap.set(tag, list)
    }
  }

  // Count shared tags between card pairs
  const sharedTagCount = new Map<string, { count: number; tags: string[]; idA: string; idB: string }>()
  for (const [tag, cardIds] of tagCardMap) {
    if (cardIds.length > TAG_FANOUT_THRESHOLD) continue
    for (let i = 0; i < cardIds.length; i++) {
      for (let j = i + 1; j < cardIds.length; j++) {
        const key = [cardIds[i], cardIds[j]].sort().join('::')
        const existing = sharedTagCount.get(key)
        if (existing) {
          existing.count++
          existing.tags.push(tag)
        } else {
          sharedTagCount.set(key, { count: 1, tags: [tag], idA: cardIds[i], idB: cardIds[j] })
        }
      }
    }
  }

  // Create tag-based links (skip duplicates with relatedCards)
  for (const [key, { count, tags, idA, idB }] of sharedTagCount) {
    if (linkSet.has(key)) continue  // relatedCards links take precedence

    linkSet.add(key)

    const cardA = cardMap.get(idA)
    const cardB = cardMap.get(idB)
    const crossCategory = cardA && cardB && cardA.category !== cardB.category

    links.push({
      source: idA,
      target: idB,
      type: crossCategory ? 'cross-category' : 'tag',
      weight: count,
      sharedTags: tags,
    })

    adjacencyMap.get(idA)?.add(idB)
    if (adjacencyMap.has(idB)) {
      adjacencyMap.get(idB)!.add(idA)
    }
    connectionCount.set(idA, (connectionCount.get(idA) || 0) + 1)
    connectionCount.set(idB, (connectionCount.get(idB) || 0) + 1)
  }

  // Write connection counts into nodes
  let maxConn = 1
  for (const node of nodes) {
    const count = connectionCount.get(node.id) || 0
    node.connectionCount = count
    if (count > maxConn) maxConn = count
  }

  _graphDataCache = { nodes, links, adjacencyMap, maxConnections: maxConn }
  return _graphDataCache
}

export async function getCategoryGraphData(categories: string[]): Promise<GraphData> {
  const full = await buildGraphData()
  const catSet = new Set(categories)
  const nodeIds = new Set(
    full.nodes.filter(n => catSet.has(n.category)).map(n => n.id)
  )

  const filteredNodes = full.nodes.filter(n => catSet.has(n.category))
  const filteredLinks = full.links.filter(l => {
    const s = typeof l.source === 'string' ? l.source : l.source.id
    const t = typeof l.target === 'string' ? l.target : l.target.id
    return nodeIds.has(s) && nodeIds.has(t)
  })

  // Rebuild adjacency map for filtered subset
  const filteredAdjacency = new Map<string, Set<string>>()
  for (const node of filteredNodes) {
    filteredAdjacency.set(node.id, new Set())
  }
  for (const link of filteredLinks) {
    const s = typeof link.source === 'string' ? link.source : link.source.id
    const t = typeof link.target === 'string' ? link.target : link.target.id
    filteredAdjacency.get(s)?.add(t)
    filteredAdjacency.get(t)?.add(s)
  }

  // Recompute maxConnections for filtered set
  let maxConn = 1
  for (const node of filteredNodes) {
    if (node.connectionCount > maxConn) maxConn = node.connectionCount
  }

  return {
    nodes: filteredNodes,
    links: filteredLinks,
    adjacencyMap: filteredAdjacency,
    maxConnections: maxConn,
  }
}
