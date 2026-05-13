import type { ResearchProject, ResearchStep, ResearchStepId, StepStatus, ResearchNote } from '~/types/research'

const STORAGE_KEY = 'wanxiang-research'

export function getResearchProjects(): ResearchProject[] {
  if (import.meta.server) return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    const projects: ResearchProject[] = JSON.parse(stored)
    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }
  catch {
    return []
  }
}

export function getResearchProject(id: string): ResearchProject | null {
  return getResearchProjects().find(p => p.id === id) || null
}

function saveAllProjects(projects: ResearchProject[]): void {
  if (import.meta.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function saveResearchProject(project: ResearchProject): void {
  const projects = getResearchProjects()
  const idx = projects.findIndex(p => p.id === project.id)
  if (idx >= 0) {
    projects[idx] = project
  }
  else {
    projects.unshift(project)
  }
  saveAllProjects(projects)
}

export function deleteResearchProject(id: string): void {
  const projects = getResearchProjects().filter(p => p.id !== id)
  saveAllProjects(projects)
}

function createInitialSteps(): ResearchStep[] {
  return [
    { stepId: 1, status: 'active', data: null },
    { stepId: 2, status: 'locked', data: null },
    { stepId: 3, status: 'locked', data: null },
    { stepId: 4, status: 'locked', data: null },
    { stepId: 5, status: 'locked', data: null },
  ]
}

export function createResearchProject(topic: string, description: string): ResearchProject {
  const now = new Date().toISOString()
  const project: ResearchProject = {
    id: crypto.randomUUID(),
    topic,
    description,
    steps: createInitialSteps(),
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    status: 'in-progress',
  }
  saveResearchProject(project)
  return project
}

export function updateStepStatus(
  projectId: string,
  stepId: ResearchStepId,
  data: any,
  newStatus: StepStatus,
): ResearchProject | null {
  const projects = getResearchProjects()
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  const step = project.steps.find(s => s.stepId === stepId)
  if (!step) return null

  step.status = newStatus
  step.data = data

  // Unlock next step when completing current
  if (newStatus === 'completed' && stepId < 5) {
    const nextStep = project.steps.find(s => s.stepId === (stepId + 1) as ResearchStepId)
    if (nextStep && nextStep.status === 'locked') {
      nextStep.status = 'active'
    }
  }

  project.updatedAt = new Date().toISOString()
  saveAllProjects(projects)
  return project
}

export function updateStepData(
  projectId: string,
  stepId: ResearchStepId,
  data: any,
): ResearchProject | null {
  const projects = getResearchProjects()
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  const step = project.steps.find(s => s.stepId === stepId)
  if (!step) return null

  step.data = data
  project.updatedAt = new Date().toISOString()
  saveAllProjects(projects)
  return project
}

// Step 1 helpers: toggle roadmap item read status
export function toggleRoadmapItemRead(projectId: string, itemId: string): ResearchProject | null {
  const projects = getResearchProjects()
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  const step = project.steps.find(s => s.stepId === 1)
  if (!step?.data) return null

  const roadmap = step.data as { items: any[] }
  const item = roadmap.items.find((i: any) => i.id === itemId)
  if (item) {
    item.isRead = !item.isRead
    project.updatedAt = new Date().toISOString()
    saveAllProjects(projects)
  }
  return project
}

// Step 1 helpers: update roadmap item note
export function updateRoadmapItemNote(projectId: string, itemId: string, note: string): ResearchProject | null {
  const projects = getResearchProjects()
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  const step = project.steps.find(s => s.stepId === 1)
  if (!step?.data) return null

  const roadmap = step.data as { items: any[] }
  const item = roadmap.items.find((i: any) => i.id === itemId)
  if (item) {
    item.userNote = note
    project.updatedAt = new Date().toISOString()
    saveAllProjects(projects)
  }
  return project
}

// Step 2 helpers: add note
export function addNoteToProject(projectId: string, note: ResearchNote): ResearchProject | null {
  const projects = getResearchProjects()
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  const step = project.steps.find(s => s.stepId === 2)
  if (!step) return null

  if (!step.data) {
    step.data = [note]
  }
  else {
    (step.data as ResearchNote[]).push(note)
  }

  project.updatedAt = new Date().toISOString()
  saveAllProjects(projects)
  return project
}

// Step 2 helpers: update note AI response
export function updateNoteAiResponse(projectId: string, noteId: string, aiResponse: string): ResearchProject | null {
  const projects = getResearchProjects()
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  const step = project.steps.find(s => s.stepId === 2)
  if (!step?.data) return null

  const notes = step.data as ResearchNote[]
  const note = notes.find(n => n.id === noteId)
  if (note) {
    note.aiResponse = aiResponse
    project.updatedAt = new Date().toISOString()
    saveAllProjects(projects)
  }
  return project
}

// Step 5 helpers: update self-test answer
export function updateSelfTestAnswer(
  projectId: string,
  questionId: string,
  answer: string,
  confidence: 'sure' | 'rough' | 'lost',
  gapAnalysis: string | null,
): ResearchProject | null {
  const projects = getResearchProjects()
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  const step = project.steps.find(s => s.stepId === 5)
  if (!step?.data) return null

  const assessment = step.data as { questions: any[] }
  const q = assessment.questions.find((q: any) => q.id === questionId)
  if (q) {
    q.userAnswer = answer
    q.userConfidence = confidence
    q.gapAnalysis = gapAnalysis
    project.updatedAt = new Date().toISOString()
    saveAllProjects(projects)
  }
  return project
}

// Mark project as completed
export function completeResearchProject(projectId: string): ResearchProject | null {
  const projects = getResearchProjects()
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  project.status = 'completed'
  project.completedAt = new Date().toISOString()
  project.updatedAt = new Date().toISOString()
  saveAllProjects(projects)
  return project
}
