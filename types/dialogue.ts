export interface DialogueMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string // ISO 8601
}

export interface DialogueReport {
  generatedAt: string
  keyThemes: string[]
  emotionalJourney: string
  insights: { title: string; description: string }[]
  suggestions: { title: string; description: string; difficulty: 'easy' | 'moderate' | 'ongoing' }[]
  affirmations: string[]
  closingThought: string
}

export interface DialogueSession {
  id: string
  title: string
  topic: DialogueTopic | null
  messages: DialogueMessage[]
  createdAt: string
  updatedAt: string
  status: 'active' | 'ended'
  report: DialogueReport | null
}

export type DialogueTopic = 'anxiety' | 'career' | 'inspiration' | 'relationships' | 'self-discovery' | 'philosophy' | 'free'

export interface DialogueTopicMeta {
  id: DialogueTopic
  label: string
  description: string
  icon: string
  examplePrompt: string
}

export const DIALOGUE_TOPICS: DialogueTopicMeta[] = [
  {
    id: 'anxiety',
    label: '生活焦虑',
    description: '关于未来的不安、生活压力',
    icon: 'lucide:cloud-rain',
    examplePrompt: '最近总是感到莫名的焦虑，不知道自己在担心什么，感觉什么都提不起劲...',
  },
  {
    id: 'career',
    label: '职业方向',
    description: '职业发展的困惑与选择',
    icon: 'lucide:compass',
    examplePrompt: '工作好几年了还是不知道自己到底适合做什么，每天都在重复...',
  },
  {
    id: 'inspiration',
    label: '灵感枯竭',
    description: '创意停滞、找不到动力',
    icon: 'lucide:lightbulb-off',
    examplePrompt: '最近做什么都提不起兴趣，感觉灵感被掏空了，脑子里一片空白...',
  },
  {
    id: 'relationships',
    label: '人际困扰',
    description: '关系中的迷茫与挣扎',
    icon: 'lucide:heart-handshake',
    examplePrompt: '总是在关系中感到疲惫，不知道该怎么平衡自己和别人的期待...',
  },
  {
    id: 'self-discovery',
    label: '自我探索',
    description: '想更了解自己、找到方向',
    icon: 'lucide:scan-face',
    examplePrompt: '有时候会想，真正的我到底是什么样的？我好像一直在扮演别人期待的角色...',
  },
  {
    id: 'philosophy',
    label: '人生哲思',
    description: '关于存在意义的深层思考',
    icon: 'lucide:message-circle-question',
    examplePrompt: '人活着的意义到底是什么？有时候觉得一切都是徒劳的...',
  },
]
