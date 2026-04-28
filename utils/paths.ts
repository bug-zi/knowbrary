import type { LearningPath } from '~/types/paths'
import { useSupabase } from './supabase'

const pathModules = import.meta.glob('~/content/paths/**/*.json', { eager: true })

let _allPaths: LearningPath[] | null = null

function mapDbPath(row: any, nodes: any[] = [], edges: any[] = []): LearningPath {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category_slug || row.category_id || '',
    categorySlug: row.category_slug || row.category_id || '',
    icon: row.icon,
    color: row.color,
    difficulty: row.difficulty,
    estimatedTime: row.estimated_time,
    nodes: nodes.map(n => ({
      id: n.id,
      cardId: n.card_id,
      type: n.node_type,
      position: { x: n.position_x, y: n.position_y },
    })),
    edges: edges.map(e => ({
      from: e.from_node_id,
      to: e.to_node_id,
      type: e.edge_type,
    })),
    author: row.author,
    tags: row.tags || [],
  }
}

export function getLocalPaths(): LearningPath[] {
  return Object.values(pathModules).map((m: any) => m.default as LearningPath).filter(Boolean)
}

export async function getAllPaths(): Promise<LearningPath[]> {
  if (_allPaths) return _allPaths

  const local = getLocalPaths()

  try {
    const sb = useSupabase()
    const { data: dbPaths, error } = await sb.from('paths').select('*').order('created_at', { ascending: false })
    if (error || !dbPaths || dbPaths.length === 0) {
      _allPaths = local
      return _allPaths
    }

    const dbMapped: LearningPath[] = []
    for (const row of dbPaths) {
      const [nodesRes, edgesRes] = await Promise.all([
        sb.from('path_nodes').select('*').eq('path_id', row.id),
        sb.from('path_edges').select('*').eq('path_id', row.id),
      ])
      dbMapped.push(mapDbPath(row, nodesRes.data || [], edgesRes.data || []))
    }

    _allPaths = [...local, ...dbMapped]
  } catch {
    _allPaths = local
  }

  return _allPaths
}

export async function getPathBySlug(slug: string): Promise<LearningPath | undefined> {
  const paths = await getAllPaths()
  return paths.find(p => p.slug === slug)
}

export async function insertPath(path: LearningPath): Promise<{ ok: boolean; error?: string }> {
  const sb = useSupabase()
  const p = path as any

  const pathId = `path-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const categorySlug = p.categorySlug || p.category_slug || p.categoryId || ''
  const nodes = (p.nodes || []) as any[]

  // Step 1: Create placeholder cards for nodes that don't have a cardId
  // path_nodes.card_id has FK constraint to cards(id), so we need real cards
  const nodeIdToCardId: Record<string, string> = {}
  for (const n of nodes) {
    const existingCardId = n.cardId || n.card_id
    if (existingCardId) {
      nodeIdToCardId[n.id] = existingCardId
      continue
    }

    const cardId = `ai-${pathId}-${n.id}`
    const { error: cardErr } = await sb.from('cards').insert({
      id: cardId,
      slug: `${p.slug || pathId}-${n.id}`,
      title: n.cardTitle || n.title || '未命名概念',
      one_liner: n.cardOneLiner || n.oneLiner || '',
      category_id: categorySlug,
      tags: p.tags || [],
      difficulty: p.difficulty || 'beginner',
      card_type: 'concept',
      content: n.cardTitle ? `# ${n.cardTitle}\n\n${n.cardOneLiner || ''}` : '',
      key_data: [],
      references: [],
      related_card_ids: [] as string[],
    })
    if (cardErr) {
      console.error('Failed to insert placeholder card:', cardErr.message)
      return { ok: false, error: `创建节点卡片失败: ${cardErr.message}` }
    }
    nodeIdToCardId[n.id] = cardId
  }

  // Step 2: Insert path
  const { error: pathError } = await sb.from('paths').insert({
    id: pathId,
    slug: `${p.slug || 'ai-path'}-${Date.now()}`,
    title: p.title,
    description: p.description || '',
    category_id: categorySlug,
    category_slug: categorySlug,
    icon: p.icon || 'tree',
    color: p.color || '#FFB3BA',
    difficulty: p.difficulty || 'beginner',
    estimated_time: p.estimatedTime || p.estimated_time || '30 分钟',
    author: p.author || 'AI 创作',
    tags: p.tags || [],
  })

  if (pathError) {
    console.error('Failed to insert path:', pathError.message)
    return { ok: false, error: `创建路径失败: ${pathError.message}` }
  }

  // Step 3: Insert nodes with real card IDs
  if (nodes.length > 0) {
    const rows = nodes.map((n: any) => ({
      id: n.id,
      path_id: pathId,
      card_id: nodeIdToCardId[n.id] || n.cardId || n.card_id || '',
      node_type: n.type || n.node_type || 'required',
      position_x: n.position?.x ?? n.position_x ?? 0,
      position_y: n.position?.y ?? n.position_y ?? 0,
    }))

    const { error: nodesError } = await sb.from('path_nodes').insert(rows)
    if (nodesError) {
      console.error('Failed to insert path nodes:', nodesError.message)
      return { ok: false, error: `创建节点失败: ${nodesError.message}` }
    }
  }

  // Step 4: Insert edges
  const edges = (p.edges || []) as any[]
  if (edges.length > 0) {
    const rows = edges.map((e: any, i: number) => ({
      id: `edge-${pathId}-${i}`,
      path_id: pathId,
      from_node_id: e.from || e.from_node_id,
      to_node_id: e.to || e.to_node_id,
      edge_type: e.type || e.edge_type || 'prerequisite',
    }))

    const { error: edgesError } = await sb.from('path_edges').insert(rows)
    if (edgesError) {
      console.error('Failed to insert path edges:', edgesError.message)
      return { ok: false, error: `创建边失败: ${edgesError.message}` }
    }
  }

  // Clear cached paths
  _allPaths = null
  return { ok: true }
}

export async function deletePath(pathId: string): Promise<{ ok: boolean; error?: string }> {
  const sb = useSupabase()
  // First, find placeholder card IDs to clean up
  const { data: nodes } = await sb.from('path_nodes').select('card_id').eq('path_id', pathId)
  // Delete edges and nodes
  await sb.from('path_edges').delete().eq('path_id', pathId)
  await sb.from('path_nodes').delete().eq('path_id', pathId)
  // Delete placeholder cards created for this path
  if (nodes) {
    for (const n of nodes) {
      if (n.card_id?.startsWith('ai-')) {
        await sb.from('cards').delete().eq('id', n.card_id)
      }
    }
  }
  const { error } = await sb.from('paths').delete().eq('id', pathId)
  if (error) {
    console.error('Failed to delete path:', error.message)
    return { ok: false, error: error.message }
  }
  _allPaths = null
  return { ok: true }
}
