export interface PathNode {
  id: string
  cardId: string              // 关联的知识卡片
  type: 'required' | 'optional' | 'bonus'
  position: { x: number; y: number }  // 树形布局坐标
}

export interface PathEdge {
  from: string
  to: string
  type: 'prerequisite' | 'related'
}

export interface LearningPath {
  id: string
  slug: string
  title: string
  description: string
  category: string
  categorySlug: string
  icon: string
  color: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  nodes: PathNode[]
  edges: PathEdge[]
  author: string
  tags: string[]
}
