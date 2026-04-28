import type { Category } from '~/types'
import { getAllCards } from './cards'
import { getCategoryMeta } from '~/types'

export interface GraphNode {
  id: string
  label: string
  category: string
  color: string
  x?: number
  y?: number
}

export interface GraphLink {
  source: string
  target: string
  type: 'related' | 'cross-category'
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export async function buildGraphData(): Promise<GraphData> {
  const cards = await getAllCards()
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []
  const linkSet = new Set<string>()

  for (const card of cards) {
    const meta = getCategoryMeta(card.category)
    nodes.push({
      id: card.id,
      label: card.title,
      category: card.category,
      color: meta.color,
    })

    for (const relatedId of card.relatedCards) {
      const key = [card.id, relatedId].sort().join('-')
      if (linkSet.has(key)) continue
      linkSet.add(key)

      const relatedCard = cards.find(c => c.id === relatedId)
      links.push({
        source: card.id,
        target: relatedId,
        type: relatedCard && relatedCard.category !== card.category ? 'cross-category' : 'related',
      })
    }
  }

  return { nodes, links }
}

export async function getCategoryGraphData(categories: string[]): Promise<GraphData> {
  const full = await buildGraphData()
  const nodeIds = new Set(
    full.nodes.filter(n => categories.includes(n.category)).map(n => n.id)
  )
  return {
    nodes: full.nodes.filter(n => categories.includes(n.category)),
    links: full.links.filter(l => nodeIds.has(l.source as string) && nodeIds.has(l.target as string)),
  }
}
