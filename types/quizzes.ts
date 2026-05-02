export interface QuizOption {
  id: string
  text: string
}

export interface DailyQuiz {
  id: string
  date: string // '2026-04-27' format
  question: string
  scenario: string
  options: QuizOption[]
  correctAnswer: string // option id
  explanation: string
  relatedCards: string[] // card IDs
  category: string
  difficulty: string
}

export interface ThoughtExperiment {
  id: string
  title: string
  description: string
  choices: { id: string; text: string; analysis: string }[]
  finalAnalysis: string
  relatedCards: string[]
  category: string
}

export interface QuizResult {
  quizId: string
  selectedAnswer: string
  isCorrect: boolean
  answeredAt: string
  isPractice?: boolean
}

export interface ThoughtReflection {
  experimentId: string
  choiceId: string
  reflection: string
  createdAt: string
  updatedAt: string
}

export interface FunFact {
  id: string
  title: string
  fact: string
  explanation: string
  relatedCards: string[]
  category: string
}

export interface ShownFunFact {
  id: string
  title: string
  shownAt: string // ISO date string
}
