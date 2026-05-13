<template>
  <div class="h-[calc(100dvh-7.5rem)] max-w-3xl mx-auto">
    <!-- No AI config -->
    <div v-if="!activeConfig && !isLoading" class="flex items-center justify-center h-full px-6">
      <div class="text-center">
        <div class="w-16 h-16 rounded-2xl bg-macaron-badge-bg flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:eye" class="w-8 h-8 text-macaron-text-secondary" />
        </div>
        <h2 class="text-lg font-semibold text-macaron-text mb-2">先配置 AI 模型</h2>
        <p class="text-sm text-macaron-text-secondary mb-5 max-w-xs mx-auto">
          请在「研究员 → AI 配置」中启用一个模型，才能开始洞察研究
        </p>
        <NuxtLink
          to="/profile/ai"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-macaron-cta text-white text-sm font-medium hover:bg-macaron-cta-hover transition-colors no-underline"
        >
          <Icon name="lucide:settings" class="w-4 h-4" />
          去配置
        </NuxtLink>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="isLoading" class="flex items-center justify-center h-full">
      <div class="flex gap-1">
        <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 0ms" />
        <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 150ms" />
        <span class="w-2 h-2 rounded-full bg-macaron-cta animate-bounce" style="animation-delay: 300ms" />
      </div>
    </div>

    <!-- Welcome state -->
    <div v-else-if="pageState === 'welcome'" class="flex flex-col h-full overflow-y-auto">
      <ResearchWelcome
        @start="handleStart"
      />

      <!-- Recent projects -->
      <div v-if="projects.length > 0" class="px-4 pb-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-macaron-text flex items-center gap-2">
            <Icon name="lucide:folder-open" class="w-4 h-4 text-macaron-cta" />
            研究项目
          </h3>
        </div>
        <div class="space-y-2">
          <ResearchProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            @select="selectProject(project.id)"
            @delete="removeProject(project.id)"
          />
        </div>
      </div>
    </div>

    <!-- Project detail state -->
    <div v-else-if="pageState === 'project' && currentProject" class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-macaron-border shrink-0">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full bg-macaron-badge-bg text-macaron-text-secondary hover:text-macaron-cta transition-colors bg-transparent border-none cursor-pointer"
          @click="goToWelcome"
        >
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
        </button>
        <div class="flex-1 min-w-0">
          <h2 class="text-sm font-semibold text-macaron-text truncate">{{ currentProject.topic }}</h2>
          <p class="text-xs text-macaron-text-secondary">{{ completedStepCount }}/5 步完成</p>
        </div>
      </div>

      <!-- Step bar -->
      <ResearchStepBar
        :steps="currentProject.steps"
        :current-step-id="currentStepId"
        @select="selectStep"
      />

      <!-- Step content -->
      <div class="flex-1 overflow-y-auto px-4 py-4">
        <!-- Error message -->
        <div v-if="errorMessage" class="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {{ errorMessage }}
        </div>

        <!-- Step 1: Roadmap -->
        <ResearchRoadmap
          v-if="currentStepId === 1"
          :step="currentProject.steps[0]"
          :topic="currentProject.topic"
          :is-generating="isGenerating"
          @generate="generateRoadmap"
          @toggle-read="toggleItemRead"
          @update-note="updateItemNote"
        />

        <!-- Step 2: Notes -->
        <ResearchNotes
          v-else-if="currentStepId === 2"
          :step="currentProject.steps[1]"
          :is-generating="isGenerating"
          @add-note="handleAddNote"
          @ask-question="askQuestion"
          @complete="completeReadingPhase"
        />

        <!-- Step 3: Panoramic -->
        <ResearchPanoramic
          v-else-if="currentStepId === 3"
          :step="currentProject.steps[2]"
          :notes-count="((currentProject.steps[1]?.data as any[])?.length) || 0"
          :is-generating="isGenerating"
          @generate="generatePanoramic"
        />

        <!-- Step 4: Output -->
        <ResearchOutputView
          v-else-if="currentStepId === 4"
          :step="currentProject.steps[3]"
          :is-generating="isGenerating"
          @generate="generateOutput"
        />

        <!-- Step 5: Self-test -->
        <ResearchSelfTest
          v-else-if="currentStepId === 5"
          :step="currentProject.steps[4]"
          :is-generating="isGenerating"
          @generate="generateSelfTest"
          @submit="handleSubmitAnswer"
          @complete="handleCompleteResearch"
        />
      </div>

      <!-- Step navigation -->
      <ResearchStepNav
        :current-step-id="currentStepId"
        :steps="currentProject.steps"
        @prev="currentStepId > 1 && selectStep((currentStepId - 1) as any)"
        @next="currentStepId < 5 && selectStep((currentStepId + 1) as any)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResearchNote, OutputFormat } from '~/types/research'

const {
  pageState,
  projects,
  isLoading,
  errorMessage,
  activeConfig,
  currentProject,
  currentStepId,
  completedStepCount,
  loadProjects,
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
  isGenerating,
} = useResearch()

loadProjects()

function handleStart(topic: string, description: string) {
  startProject(topic, description)
}

function handleAddNote(note: ResearchNote) {
  addNote(note)
}

function handleSubmitAnswer(questionId: string, answer: string, confidence: 'sure' | 'rough' | 'lost') {
  submitAnswer(questionId, answer, confidence)
}

function handleCompleteResearch() {
  completeResearch()
  goToWelcome()
}
</script>
