// ============================================
// Step identifiers & statuses
// ============================================

export type ResearchStepId = 1 | 2 | 3 | 4 | 5

export type StepStatus = 'locked' | 'active' | 'completed'

export type NoteType = 'passage' | 'question' | 'insight' | 'confusion' | 'connection'

export type OutputFormat = 'article' | 'outline' | 'mindmap' | 'keytakeaways'

// ============================================
// Step 1: AI Roadmap
// ============================================

export interface RoadmapItem {
  id: string
  type: 'paper' | 'book' | 'person' | 'concept' | 'resource' | 'recent-development'
  title: string
  description: string
  relevance: string
  priority: 'essential' | 'recommended' | 'optional'
  isRead: boolean
  userNote: string
}

export interface ResearchRoadmap {
  generatedAt: string
  topicSummary: string
  coreQuestion: string
  items: RoadmapItem[]
  suggestedAngles: string[]
}

// ============================================
// Step 2: Reading Notes
// ============================================

export interface ResearchNote {
  id: string
  sourceItemId: string | null
  type: NoteType
  content: string
  aiResponse: string | null
  createdAt: string
}

// ============================================
// Step 3: Panoramic Analysis
// ============================================

export interface PanoramicAnalysis {
  generatedAt: string
  knowledgeMap: string
  patterns: string[]
  contradictions: string[]
  consensusPoints: string[]
  openQuestions: string[]
  blindSpots: string[]
}

// ============================================
// Step 4: Research Output
// ============================================

export interface ResearchOutput {
  generatedAt: string
  format: OutputFormat
  title: string
  sections: { heading: string; content: string; keyPoints: string[] }[]
  totalWordCount: number
}

// ============================================
// Step 5: Self-Assessment
// ============================================

export interface SelfTestQuestion {
  id: string
  question: string
  hint: string
  suggestedAnswer: string
  userAnswer: string
  userConfidence: 'sure' | 'rough' | 'lost'
  gapAnalysis: string | null
}

export interface SelfAssessment {
  generatedAt: string
  questions: SelfTestQuestion[]
  overallGapSummary: string
  suggestedNextSteps: string[]
}

// ============================================
// Research Step (per-step wrapper)
// ============================================

export interface ResearchStep {
  stepId: ResearchStepId
  status: StepStatus
  data: ResearchRoadmap | ResearchNote[] | PanoramicAnalysis | ResearchOutput | SelfAssessment | null
}

// ============================================
// Research Project (top-level container)
// ============================================

export interface ResearchProject {
  id: string
  topic: string
  description: string
  steps: ResearchStep[]
  createdAt: string
  updatedAt: string
  completedAt: string | null
  status: 'in-progress' | 'completed' | 'archived'
}

// ============================================
// Step metadata for UI
// ============================================

export interface StepMeta {
  stepId: ResearchStepId
  label: string
  description: string
  icon: string
}

export const RESEARCH_STEPS: StepMeta[] = [
  {
    stepId: 1,
    label: 'AI 路线图',
    description: '让 AI 帮你梳理核心文献和关键人物',
    icon: 'lucide:map',
  },
  {
    stepId: 2,
    label: '带疑阅读',
    description: '边读边记，追踪困惑，随时提问',
    icon: 'lucide:notebook-pen',
  },
  {
    stepId: 3,
    label: '全景分析',
    description: 'AI 全盘审视你的材料，发现模式和矛盾',
    icon: 'lucide:scan-eye',
  },
  {
    stepId: 4,
    label: '产出整理',
    description: '整理研究笔记，生成结构化输出',
    icon: 'lucide:file-text',
  },
  {
    stepId: 5,
    label: '知不知检验',
    description: '自测暴露盲区，诚实面对理解',
    icon: 'lucide:help-circle',
  },
]
