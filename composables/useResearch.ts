import type { AIProvider } from '~/types'
import type {
  ResearchProject,
  ResearchStepId,
  ResearchNote,
  ResearchRoadmap,
  PanoramicAnalysis,
  ResearchOutput,
  SelfAssessment,
  OutputFormat,
} from '~/types/research'
import {
  getResearchProjects,
  createResearchProject,
  deleteResearchProject,
  updateStepStatus,
  updateStepData,
  toggleRoadmapItemRead,
  updateRoadmapItemNote,
  addNoteToProject,
  updateNoteAiResponse,
  updateSelfTestAnswer,
  completeResearchProject,
} from '~/utils/research'

type PageState = 'welcome' | 'project'

export function useResearch() {
  const pageState = ref<PageState>('welcome')
  const currentProjectId = ref<string | null>(null)
  const currentStepId = ref<ResearchStepId>(1)
  const projects = ref<ResearchProject[]>([])
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const errorMessage = ref('')

  const activeConfig = ref<{ provider: AIProvider; apiKey: string; model: string } | null>(null)

  const user = useSupabaseUser()
  const client = useSupabase()

  if (import.meta.client) {
    watch(user, (u) => {
      if (u) loadActiveConfig()
    }, { immediate: true })
  }

  const currentProject = computed<ResearchProject | null>(() => {
    if (!currentProjectId.value) return null
    return projects.value.find(p => p.id === currentProjectId.value) || null
  })

  const currentStep = computed(() => {
    if (!currentProject.value) return null
    return currentProject.value.steps.find(s => s.stepId === currentStepId.value) || null
  })

  const completedStepCount = computed(() => {
    if (!currentProject.value) return 0
    return currentProject.value.steps.filter(s => s.status === 'completed').length
  })

  function loadProjects() {
    projects.value = getResearchProjects()
  }

  async function loadActiveConfig() {
    if (!user.value) {
      activeConfig.value = null
      return
    }
    const { data } = await client
      .from('ai_configs')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('is_active', true)
      .limit(1)
    if (data && data.length > 0) {
      activeConfig.value = {
        provider: data[0].provider as AIProvider,
        apiKey: data[0].api_key,
        model: data[0].model,
      }
    }
  }

  function startProject(topic: string, description: string) {
    const project = createResearchProject(topic, description)
    loadProjects()
    currentProjectId.value = project.id
    currentStepId.value = 1
    pageState.value = 'project'
    return project
  }

  function selectProject(id: string) {
    const project = projects.value.find(p => p.id === id)
    if (!project) return
    currentProjectId.value = id
    // Jump to first active step
    const activeStep = project.steps.find(s => s.status === 'active')
    currentStepId.value = activeStep ? activeStep.stepId : 1
    pageState.value = 'project'
  }

  function selectStep(stepId: ResearchStepId) {
    if (!currentProject.value) return
    const step = currentProject.value.steps.find(s => s.stepId === stepId)
    if (step && step.status !== 'locked') {
      currentStepId.value = stepId
    }
  }

  // Step 1: Generate roadmap
  async function generateRoadmap() {
    if (!activeConfig.value || !currentProjectId.value) return
    isGenerating.value = true
    errorMessage.value = ''

    try {
      const project = currentProject.value!
      const result = await $fetch<{ roadmap: ResearchRoadmap; searchPerformed: boolean; searchError: string }>('/api/ai/research/roadmap', {
        method: 'POST',
        body: {
          provider: activeConfig.value.provider,
          apiKey: activeConfig.value.apiKey,
          model: activeConfig.value.model,
          topic: project.topic,
          description: project.description,
        },
      })

      updateStepStatus(currentProjectId.value, 1, result.roadmap, 'completed')
      loadProjects()
    }
    catch (err: any) {
      errorMessage.value = err.data?.statusMessage || err.message || '路线图生成失败，请重试'
    }
    finally {
      isGenerating.value = false
    }
  }

  // Step 1: Toggle roadmap item read
  function toggleItemRead(itemId: string) {
    if (!currentProjectId.value) return
    toggleRoadmapItemRead(currentProjectId.value, itemId)
    loadProjects()
  }

  // Step 1: Update roadmap item note
  function updateItemNote(itemId: string, note: string) {
    if (!currentProjectId.value) return
    updateRoadmapItemNote(currentProjectId.value, itemId, note)
    loadProjects()
  }

  // Step 2: Add note
  function addNote(note: ResearchNote) {
    if (!currentProjectId.value) return
    addNoteToProject(currentProjectId.value, note)
    loadProjects()

    // Ensure step 2 is at least active
    const step = currentProject.value?.steps.find(s => s.stepId === 2)
    if (step?.status === 'active' && !step.data) {
      // Keep it active, data is being accumulated
    }
  }

  // Step 2: Ask AI a question
  async function askQuestion(noteId: string, question: string) {
    if (!activeConfig.value || !currentProjectId.value) return

    try {
      const project = currentProject.value!
      const step2 = project.steps.find(s => s.stepId === 2)
      const existingNotes: ResearchNote[] = (step2?.data as ResearchNote[]) || []

      const result = await $fetch<{ answer: string }>('/api/ai/research/qa', {
        method: 'POST',
        body: {
          provider: activeConfig.value.provider,
          apiKey: activeConfig.value.apiKey,
          model: activeConfig.value.model,
          topic: project.topic,
          question,
          contextNotes: existingNotes.map(n => ({ type: n.type, content: n.content })),
        },
      })

      updateNoteAiResponse(currentProjectId.value, noteId, result.answer)
      loadProjects()
    }
    catch (err: any) {
      errorMessage.value = err.data?.statusMessage || err.message || '提问失败，请重试'
    }
  }

  // Step 2: Complete reading phase
  function completeReadingPhase() {
    if (!currentProjectId.value) return
    const step2 = currentProject.value?.steps.find(s => s.stepId === 2)
    if (step2?.data && (step2.data as ResearchNote[]).length > 0) {
      updateStepStatus(currentProjectId.value, 2, step2.data, 'completed')
      loadProjects()
    }
  }

  // Step 3: Generate panoramic analysis
  async function generatePanoramic() {
    if (!activeConfig.value || !currentProjectId.value) return
    isGenerating.value = true
    errorMessage.value = ''

    try {
      const project = currentProject.value!
      const roadmap = project.steps.find(s => s.stepId === 1)?.data as ResearchRoadmap
      const notes = (project.steps.find(s => s.stepId === 2)?.data as ResearchNote[]) || []

      const result = await $fetch<{ analysis: PanoramicAnalysis }>('/api/ai/research/panoramic', {
        method: 'POST',
        body: {
          provider: activeConfig.value.provider,
          apiKey: activeConfig.value.apiKey,
          model: activeConfig.value.model,
          topic: project.topic,
          description: project.description,
          roadmap: { items: roadmap?.items || [] },
          notes: notes.map(n => ({ type: n.type, content: n.content, aiResponse: n.aiResponse })),
        },
      })

      updateStepStatus(currentProjectId.value, 3, result.analysis, 'completed')
      loadProjects()
    }
    catch (err: any) {
      errorMessage.value = err.data?.statusMessage || err.message || '全景分析失败，请重试'
    }
    finally {
      isGenerating.value = false
    }
  }

  // Step 4: Generate output
  async function generateOutput(format: OutputFormat) {
    if (!activeConfig.value || !currentProjectId.value) return
    isGenerating.value = true
    errorMessage.value = ''

    try {
      const project = currentProject.value!
      const roadmap = project.steps.find(s => s.stepId === 1)?.data as ResearchRoadmap
      const notes = (project.steps.find(s => s.stepId === 2)?.data as ResearchNote[]) || []
      const analysis = project.steps.find(s => s.stepId === 3)?.data as PanoramicAnalysis

      const result = await $fetch<{ output: ResearchOutput }>('/api/ai/research/output', {
        method: 'POST',
        body: {
          provider: activeConfig.value.provider,
          apiKey: activeConfig.value.apiKey,
          model: activeConfig.value.model,
          topic: project.topic,
          format,
          roadmap: { items: (roadmap?.items || []).map(i => ({ title: i.title, description: i.description, isRead: i.isRead })) },
          notes: notes.map(n => ({ type: n.type, content: n.content })),
          analysis: analysis || { knowledgeMap: '', patterns: [], blindSpots: [] },
        },
      })

      updateStepStatus(currentProjectId.value, 4, result.output, 'completed')
      loadProjects()
    }
    catch (err: any) {
      errorMessage.value = err.data?.statusMessage || err.message || '产出生成失败，请重试'
    }
    finally {
      isGenerating.value = false
    }
  }

  // Step 5: Generate self-test
  async function generateSelfTest() {
    if (!activeConfig.value || !currentProjectId.value) return
    isGenerating.value = true
    errorMessage.value = ''

    try {
      const project = currentProject.value!
      const roadmap = project.steps.find(s => s.stepId === 1)?.data as ResearchRoadmap
      const notes = (project.steps.find(s => s.stepId === 2)?.data as ResearchNote[]) || []
      const analysis = project.steps.find(s => s.stepId === 3)?.data as PanoramicAnalysis
      const output = project.steps.find(s => s.stepId === 4)?.data as ResearchOutput

      const result = await $fetch<{ assessment: SelfAssessment }>('/api/ai/research/selftest', {
        method: 'POST',
        body: {
          provider: activeConfig.value.provider,
          apiKey: activeConfig.value.apiKey,
          model: activeConfig.value.model,
          topic: project.topic,
          roadmap: { items: (roadmap?.items || []).map(i => ({ title: i.title, description: i.description })) },
          notes: notes.map(n => ({ type: n.type, content: n.content })),
          analysis: analysis || { blindSpots: [] },
          output: output || { sections: [] },
        },
      })

      updateStepStatus(currentProjectId.value, 5, result.assessment, 'active')
      loadProjects()
    }
    catch (err: any) {
      errorMessage.value = err.data?.statusMessage || err.message || '自测题生成失败，请重试'
    }
    finally {
      isGenerating.value = false
    }
  }

  // Step 5: Submit answer + get gap analysis
  async function submitAnswer(
    questionId: string,
    answer: string,
    confidence: 'sure' | 'rough' | 'lost',
  ) {
    if (!activeConfig.value || !currentProjectId.value) return

    try {
      const project = currentProject.value!
      const assessment = project.steps.find(s => s.stepId === 5)?.data as SelfAssessment
      const question = assessment?.questions.find(q => q.id === questionId)
      if (!question) return

      const result = await $fetch<{ gapAnalysis: string }>('/api/ai/research/gapanalysis', {
        method: 'POST',
        body: {
          provider: activeConfig.value.provider,
          apiKey: activeConfig.value.apiKey,
          model: activeConfig.value.model,
          question: question.question,
          userAnswer: answer,
          suggestedAnswer: question.suggestedAnswer,
          confidence,
        },
      })

      updateSelfTestAnswer(currentProjectId.value, questionId, answer, confidence, result.gapAnalysis)
      loadProjects()
    }
    catch (err: any) {
      errorMessage.value = err.data?.statusMessage || err.message || '答案分析失败'
    }
  }

  // Step 5: Complete all
  function completeResearch() {
    if (!currentProjectId.value) return
    completeResearchProject(currentProjectId.value)
    loadProjects()
  }

  function removeProject(id: string) {
    deleteResearchProject(id)
    loadProjects()
    if (currentProjectId.value === id) {
      goToWelcome()
    }
  }

  function goToWelcome() {
    currentProjectId.value = null
    currentStepId.value = 1
    pageState.value = 'welcome'
    errorMessage.value = ''
  }

  return {
    pageState,
    currentProjectId,
    currentStepId,
    projects,
    isLoading,
    isGenerating,
    errorMessage,
    activeConfig,
    currentProject,
    currentStep,
    completedStepCount,
    loadProjects,
    loadActiveConfig,
    startProject,
    selectProject,
    selectStep,
    generateRoadmap,
    toggleItemRead,
    updateItemNote,
    addNote,
    askQuestion,
    completeReadingPhase,
    generatePanoramic,
    generateOutput,
    generateSelfTest,
    submitAnswer,
    completeResearch,
    removeProject,
    goToWelcome,
  }
}
