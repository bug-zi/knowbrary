export type Category =
  | 'economics'
  | 'psychology'
  | 'law'
  | 'medicine'
  | 'astronomy'
  | 'geography'
  | 'politics'
  | 'biology'
  | 'philosophy'
  | 'literature'
  | 'art'
  | 'music'
  | 'mathematics'
  | 'ecology'
  | 'animals'
  | 'plants'
  | 'food'
  | 'sports'
  | 'military'
  | 'education'
  | 'communication'
  | 'scientific-method'
  | 'data-thinking'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type CardType = 'concept' | 'person' | 'event' | 'experiment' | 'principle' | 'species' | 'geography' | 'culture'

export interface KeyData {
  label: string
  value: string
  description?: string
}

export interface Reference {
  id: number
  title: string
  author?: string
  url?: string
}

export interface KnowledgeCard {
  id: string
  slug: string
  title: string
  oneLiner: string
  category: Category
  tags: string[]
  difficulty: Difficulty
  cardType: CardType
  content: string
  keyData: KeyData[]
  references: Reference[]
  relatedCards: string[]
  createdAt: string
  updatedAt: string
}

export interface CategoryMeta {
  id: Category
  name: string
  icon: string
  color: string
  description: string
  cardCount: number
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'economics', name: '经济学', icon: 'lucide:coins', color: '#FFB3BA', description: '理解市场运作与财富逻辑', cardCount: 0 },
  { id: 'psychology', name: '心理学', icon: 'lucide:brain', color: '#BAFFC9', description: '探索人类行为与思维模式', cardCount: 0 },
  { id: 'law', name: '法学', icon: 'lucide:scale', color: '#BAE1FF', description: '了解法律常识与权利边界', cardCount: 0 },
  { id: 'medicine', name: '医学常识', icon: 'lucide:heart-pulse', color: '#FFFFBA', description: '掌握健康与急救知识', cardCount: 0 },
  { id: 'astronomy', name: '天文学', icon: 'lucide:telescope', color: '#E8BAFF', description: '仰望星空探索宇宙奥秘', cardCount: 0 },
  { id: 'geography', name: '地理学', icon: 'lucide:globe-2', color: '#BAFFEE', description: '认识地球与自然环境', cardCount: 0 },
  { id: 'politics', name: '政治学', icon: 'lucide:landmark', color: '#FFD4BA', description: '理解权力运作与公共治理', cardCount: 0 },
  { id: 'biology', name: '生物学', icon: 'lucide:dna', color: '#C9FFBA', description: '解码生命的运作机制', cardCount: 0 },
  { id: 'philosophy', name: '哲学', icon: 'lucide:message-circle-question', color: '#D4BAFF', description: '思考存在与意义的终极问题', cardCount: 0 },
  { id: 'literature', name: '文学', icon: 'lucide:book-open', color: '#FFDAB9', description: '感受文字的力量与美', cardCount: 0 },
  { id: 'art', name: '艺术鉴赏', icon: 'lucide:palette', color: '#FFB3DE', description: '培养审美与艺术感知力', cardCount: 0 },
  { id: 'music', name: '音乐常识', icon: 'lucide:music', color: '#B3FFF0', description: '了解音乐的语言与历史', cardCount: 0 },
  { id: 'mathematics', name: '数学', icon: 'lucide:sigma', color: '#C9D4FF', description: '用数字理解世界的规律', cardCount: 0 },
  { id: 'ecology', name: '生态与环境', icon: 'lucide:leaf', color: '#BAFFD4', description: '认识生态系统与可持续发展', cardCount: 0 },
  { id: 'animals', name: '动物世界', icon: 'lucide:paw-print', color: '#FFDFBA', description: '发现动物的奇妙世界', cardCount: 0 },
  { id: 'plants', name: '植物图鉴', icon: 'lucide:flower-2', color: '#D4FFBA', description: '认识身边的植物朋友', cardCount: 0 },
  { id: 'food', name: '饮食文化', icon: 'lucide:chef-hat', color: '#FFE4BA', description: '品味食物背后的科学与文化', cardCount: 0 },
  { id: 'sports', name: '体育常识', icon: 'lucide:trophy', color: '#FFB3B3', description: '了解运动规则与体育精神', cardCount: 0 },
  { id: 'military', name: '军事', icon: 'lucide:swords', color: '#D4D4BA', description: '了解军事历史与战略思想', cardCount: 0 },
  { id: 'education', name: '教育学', icon: 'lucide:graduation-cap', color: '#BAD4FF', description: '掌握高效学习的方法论', cardCount: 0 },
  { id: 'communication', name: '传播学', icon: 'lucide:megaphone', color: '#FFBAD4', description: '理解信息传播与媒体影响', cardCount: 0 },
  { id: 'scientific-method', name: '科学方法', icon: 'lucide:microscope', color: '#B4D4FF', description: '学会像科学家一样思考', cardCount: 0 },
  { id: 'data-thinking', name: '数据思维', icon: 'lucide:bar-chart-3', color: '#D4BAE8', description: '用数据驱动决策与判断', cardCount: 0 },
]

export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; icon: string }> = {
  beginner: { label: '入门', icon: 'lucide:lightbulb' },
  intermediate: { label: '进阶', icon: 'lucide:microscope' },
  advanced: { label: '专业', icon: 'lucide:bar-chart-3' },
}

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  concept: '概念',
  person: '人物',
  event: '事件',
  experiment: '实验',
  principle: '原理',
  species: '物种',
  geography: '地理',
  culture: '文化',
}

export function getCategoryMeta(id: Category): CategoryMeta {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0]
}

// ============================================
// 用户认证 & AI 配置
// ============================================

export interface UserProfile {
  id: string
  username: string | null
  fullName: string | null
  avatarUrl: string | null
  bio: string
  createdAt: string
  updatedAt: string
}

export type AIProvider = 'deepseek' | 'zhipu' | 'doubao' | 'qwen' | 'openai'

export interface AIConfig {
  id: string
  userId: string
  provider: AIProvider
  apiKey: string
  model: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const AI_PROVIDERS: Record<AIProvider, { name: string; icon: string; models: string[] }> = {
  deepseek: {
    name: 'DeepSeek',
    icon: 'lucide:brain-circuit',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  zhipu: {
    name: '智谱 (GLM)',
    icon: 'lucide:sparkles',
    models: ['glm-4-plus', 'glm-4-flash', 'glm-4-long'],
  },
  doubao: {
    name: '豆包',
    icon: 'lucide:coffee',
    models: ['doubao-pro-4k', 'doubao-pro-32k', 'doubao-pro-128k'],
  },
  qwen: {
    name: '千问',
    icon: 'lucide:cloud-sun',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  },
  openai: {
    name: 'GPT (OpenAI)',
    icon: 'lucide:bot',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  },
}
