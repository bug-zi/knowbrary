<template>
  <div class="min-h-dvh pb-24 md:min-h-0 md:h-[calc(100dvh-6rem)] md:pb-0 md:overflow-hidden">
    <!-- Decorative top gradient -->
    <div class="fixed top-0 left-0 right-0 h-64 pointer-events-none z-0"
      style="background: linear-gradient(180deg, var(--macaron-surface-hover-alt) 0%, transparent 100%);"
    />

    <div class="relative z-10 max-w-2xl mx-auto px-4 pt-6 md:h-full md:flex md:flex-col md:justify-center md:pt-2">
      <!-- Page header -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-macaron-cta/10">
            <Icon name="lucide:sparkles" class="w-5 h-5 text-macaron-cta" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-macaron-text tracking-tight">AI 创作</h1>
            <p class="text-xs text-macaron-text-secondary">选择类型，生成知识内容</p>
          </div>
        </div>

        <!-- Step indicator -->
        <div class="flex items-center gap-1">
          <template v-for="i in 3" :key="i">
            <div
              class="h-1 rounded-full transition-all duration-500 ease-out"
              :class="step >= i ? 'bg-macaron-cta flex-1' : 'bg-macaron-border flex-1'"
              :style="{ opacity: step >= i ? 1 : 0.4 }"
            />
          </template>
        </div>
        <div class="flex items-center justify-between mt-1.5 px-0.5">
          <span class="text-[10px] font-medium" :class="step >= 1 ? 'text-macaron-cta' : 'text-macaron-muted'">选择类型</span>
          <span class="text-[10px] font-medium" :class="step >= 2 ? 'text-macaron-cta' : 'text-macaron-muted'">选择领域</span>
          <span class="text-[10px] font-medium" :class="step >= 3 ? 'text-macaron-cta' : 'text-macaron-muted'">生成内容</span>
        </div>
      </div>

      <!-- Step 1: Choose type -->
      <section v-if="step === 1" class="space-y-5">
        <h2 class="text-base font-semibold text-macaron-text">选择创作类型</h2>
        <div class="grid grid-cols-2 gap-3">
          <button
            class="create-type-card group relative overflow-hidden rounded-2xl p-5 text-center border-2 transition-all duration-300 ease-out cursor-pointer active:scale-[0.97] hover:-translate-y-1"
            :class="selectedType === 'card'
              ? 'border-macaron-cta shadow-lg shadow-macaron-cta/15'
              : 'border-macaron-border/70 bg-macaron-card hover:border-macaron-cta/50 hover:shadow-lg hover:shadow-macaron-cta/8'"
            @click="selectedType = 'card'"
          >
            <div class="absolute inset-0 transition-opacity duration-500 ease-out pointer-events-none"
              :class="selectedType === 'card' ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'"
              style="background: linear-gradient(180deg, var(--macaron-cta-light) 0%, transparent 50%);"
            />
            <div class="relative">
              <div class="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out"
                :class="selectedType === 'card'
                  ? 'bg-macaron-cta scale-110 shadow-md shadow-macaron-cta/30'
                  : 'bg-macaron-badge-bg group-hover:bg-macaron-cta/15 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-macaron-cta/15'"
              >
                <Icon name="lucide:file-text" class="w-7 h-7 transition-colors duration-300" :class="selectedType === 'card' ? 'text-white' : 'text-macaron-cta'" />
              </div>
              <div class="font-semibold text-macaron-text text-sm transition-colors duration-300">知识卡片</div>
              <div class="text-xs text-macaron-text-secondary mt-1 leading-relaxed">生成单张知识科普卡片</div>
            </div>
            <div v-if="selectedType === 'card'" class="absolute top-2.5 right-2.5">
              <div class="w-5 h-5 rounded-full bg-macaron-cta flex items-center justify-center">
                <Icon name="lucide:check" class="w-3 h-3 text-white" />
              </div>
            </div>
          </button>
          <button
            class="create-type-card group relative overflow-hidden rounded-2xl p-5 text-center border-2 transition-all duration-300 ease-out cursor-pointer active:scale-[0.97] hover:-translate-y-1"
            :class="selectedType === 'path'
              ? 'border-macaron-cta shadow-lg shadow-macaron-cta/15'
              : 'border-macaron-border/70 bg-macaron-card hover:border-macaron-cta/50 hover:shadow-lg hover:shadow-macaron-cta/8'"
            @click="selectedType = 'path'"
          >
            <div class="absolute inset-0 transition-opacity duration-500 ease-out pointer-events-none"
              :class="selectedType === 'path' ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'"
              style="background: linear-gradient(180deg, var(--macaron-cta-light) 0%, transparent 50%);"
            />
            <div class="relative">
              <div class="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out"
                :class="selectedType === 'path'
                  ? 'bg-macaron-cta scale-110 shadow-md shadow-macaron-cta/30'
                  : 'bg-macaron-badge-bg group-hover:bg-macaron-cta/15 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-macaron-cta/15'"
              >
                <Icon name="lucide:git-branch" class="w-7 h-7 transition-colors duration-300" :class="selectedType === 'path' ? 'text-white' : 'text-macaron-cta'" />
              </div>
              <div class="font-semibold text-macaron-text text-sm transition-colors duration-300">技能树</div>
              <div class="text-xs text-macaron-text-secondary mt-1 leading-relaxed">生成学习路径和技能节点</div>
            </div>
            <div v-if="selectedType === 'path'" class="absolute top-2.5 right-2.5">
              <div class="w-5 h-5 rounded-full bg-macaron-cta flex items-center justify-center">
                <Icon name="lucide:check" class="w-3 h-3 text-white" />
              </div>
            </div>
          </button>
        </div>
        <button
          class="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-300 cursor-pointer"
          :class="selectedType
            ? 'bg-macaron-cta hover:bg-macaron-cta-hover shadow-lg shadow-macaron-cta/20 active:scale-[0.98]'
            : 'bg-macaron-muted-light cursor-not-allowed text-macaron-muted'"
          :disabled="!selectedType"
          @click="step = 2"
        >
          <span v-if="selectedType" class="flex items-center justify-center gap-2">
            下一步
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </span>
          <span v-else>请先选择创作类型</span>
        </button>
      </section>

      <!-- Step 2: Choose category -->
      <section v-if="step === 2" class="space-y-4">
        <div class="flex items-center gap-3">
          <button
            class="w-9 h-9 rounded-xl flex items-center justify-center border border-macaron-border bg-macaron-card text-macaron-text-secondary hover:text-macaron-text hover:border-macaron-cta/40 transition-all duration-200 cursor-pointer active:scale-95"
            @click="step = 1"
            aria-label="返回上一步"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
          </button>
          <div>
            <h2 class="text-base font-semibold text-macaron-text">选择领域</h2>
            <p class="text-xs text-macaron-text-secondary">选择一个学科方向开始创作</p>
          </div>
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="category-btn group rounded-2xl py-3 px-2 text-center border-2 transition-all duration-300 cursor-pointer active:scale-95"
            :class="selectedCategory === cat.id
              ? 'border-macaron-cta bg-macaron-cta/8 shadow-md shadow-macaron-cta/10'
              : 'border-macaron-border/60 bg-macaron-card hover:border-macaron-cta/25 hover:shadow-sm'"
            @click="selectedCategory = cat.id"
          >
            <div class="w-10 h-10 mx-auto mb-1.5 rounded-xl flex items-center justify-center transition-all duration-300"
              :class="selectedCategory === cat.id ? 'bg-macaron-cta scale-110' : 'bg-macaron-badge-bg group-hover:scale-105'"
            >
              <Icon :name="cat.icon" class="text-xl" :class="selectedCategory === cat.id ? 'text-white' : 'text-macaron-cta'" />
            </div>
            <div class="text-[11px] font-medium text-macaron-text truncate leading-tight">{{ cat.name }}</div>
          </button>
        </div>
        <button
          class="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-300 cursor-pointer"
          :class="selectedCategory
            ? 'bg-macaron-cta hover:bg-macaron-cta-hover shadow-lg shadow-macaron-cta/20 active:scale-[0.98]'
            : 'bg-macaron-muted-light cursor-not-allowed text-macaron-muted'"
          :disabled="!selectedCategory"
          @click="startGenerate"
        >
          <span v-if="selectedCategory" class="flex items-center justify-center gap-2">
            <Icon name="lucide:wand-2" class="w-4 h-4" />
            开始生成
          </span>
          <span v-else>请先选择一个领域</span>
        </button>
      </section>

      <!-- Step 3: Generating -->
      <section v-if="step === 3" class="text-center py-20 space-y-5">
        <div class="relative w-24 h-24 mx-auto">
          <div class="absolute inset-0 rounded-full bg-macaron-cta/10 animate-ping-slow" />
          <div class="absolute inset-2 rounded-full bg-macaron-cta/15 animate-ping-slow" style="animation-delay: 0.5s;" />
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-macaron-cta/10 flex items-center justify-center">
              <Icon name="lucide:sparkles" class="w-8 h-8 text-macaron-cta animate-pulse" />
            </div>
          </div>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-macaron-text">AI 正在创作中</h2>
          <p class="text-sm text-macaron-text-secondary mt-1">正在调用 {{ providerName }} {{ activeConfig?.model || '' }}，请稍候</p>
        </div>
        <div class="w-56 h-1.5 bg-macaron-border rounded-full mx-auto overflow-hidden">
          <div class="h-full bg-macaron-cta rounded-full animate-shimmer" />
        </div>
      </section>

      <!-- Step 4: Card error state (normal flow) -->
      <section v-if="step === 4 && selectedType === 'card' && !generatedCard" class="space-y-4">
        <div class="flex items-center gap-3">
          <button
            class="w-9 h-9 rounded-xl flex items-center justify-center border border-macaron-border bg-macaron-card text-macaron-text-secondary hover:text-macaron-text hover:border-macaron-cta/40 transition-all duration-200 cursor-pointer active:scale-95"
            @click="step = 2"
            aria-label="返回"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
          </button>
          <h2 class="text-base font-semibold text-macaron-text">预览生成结果</h2>
        </div>
        <div v-if="generateError" class="card-base border-red-200/80 bg-red-50/80 dark:bg-red-900/20 dark:border-red-800/40">
          <div class="flex items-start gap-3">
            <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-red-600 dark:text-red-400">{{ generateError }}</p>
          </div>
        </div>
        <button
          class="w-full py-3.5 rounded-2xl border-2 border-macaron-border text-macaron-text font-semibold text-sm hover:bg-macaron-hover-bg transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
          @click="startGenerate"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4" />
          重新生成
        </button>
      </section>

      <!-- Step 4: Path preview (normal flow) -->
      <section v-if="step === 4 && selectedType === 'path'" class="space-y-4">
        <div class="flex items-center gap-3">
          <button
            class="w-9 h-9 rounded-xl flex items-center justify-center border border-macaron-border bg-macaron-card text-macaron-text-secondary hover:text-macaron-text hover:border-macaron-cta/40 transition-all duration-200 cursor-pointer active:scale-95"
            @click="step = 2"
            aria-label="返回"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
          </button>
          <h2 class="text-base font-semibold text-macaron-text">预览生成结果</h2>
        </div>

        <div v-if="generatedPath" class="card-base space-y-4">
          <div>
            <h3 class="text-xl font-bold text-macaron-text">{{ generatedPath.title }}</h3>
            <p class="text-sm text-macaron-text-secondary mt-1">{{ generatedPath.description }}</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <Icon :name="generatedPath.icon" class="text-lg" />
            <span :class="`badge-${generatedPath.difficulty}`">
              {{ generatedPath.difficulty === 'beginner' ? '入门' : generatedPath.difficulty === 'intermediate' ? '进阶' : '专业' }}
            </span>
            <span class="text-xs text-macaron-text-secondary">{{ generatedPath.estimatedTime }}</span>
          </div>

          <div class="space-y-2">
            <h4 class="font-semibold text-macaron-text text-sm">技能节点 ({{ generatedPath.nodes?.length || 0 }})</h4>
            <div
              v-for="node in generatedPath.nodes"
              :key="node.id"
              class="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-macaron-bg transition-colors"
            >
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :class="node.type === 'required' ? 'bg-macaron-cta' : node.type === 'optional' ? 'bg-blue-400' : 'bg-yellow-400'"
              />
              <span class="font-medium text-macaron-text flex-1 min-w-0 truncate">{{ node.cardTitle }}</span>
              <span class="text-xs text-macaron-text-secondary flex-shrink-0">
                {{ node.type === 'required' ? '必修' : node.type === 'optional' ? '选修' : '加分' }}
              </span>
              <span v-if="node.cardId" class="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex-shrink-0">已有</span>
              <span v-else class="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 flex-shrink-0">新建</span>
            </div>
          </div>
        </div>

        <div v-if="generateError" class="card-base border-red-200/80 bg-red-50/80 dark:bg-red-900/20 dark:border-red-800/40">
          <div class="flex items-start gap-3">
            <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-red-600 dark:text-red-400">{{ generateError }}</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 py-3.5 rounded-2xl border-2 border-macaron-border text-macaron-text font-semibold text-sm hover:bg-macaron-hover-bg transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            @click="startGenerate"
          >
            <Icon name="lucide:refresh-cw" class="w-4 h-4" />
            重新生成
          </button>
          <button
            v-if="!generateError"
            class="flex-1 py-3.5 rounded-2xl bg-macaron-cta text-white font-semibold text-sm hover:bg-macaron-cta-hover shadow-lg shadow-macaron-cta/20 transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            @click="saveResult"
          >
            <Icon name="lucide:save" class="w-4 h-4" />
            保存到数据库
          </button>
        </div>
      </section>
    </div>

    <!-- Full-screen card carousel preview -->
    <div v-if="step === 4 && selectedType === 'card' && generatedCard" class="fixed inset-0 z-50 overflow-hidden">
      <!-- Background -->
      <div class="fixed inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('/bg1.png'); z-index: 0;">
        <div class="absolute inset-0 bg-macaron-card/40" />
      </div>

      <div class="relative z-10 max-w-2xl mx-auto px-3 pt-20 pb-1 h-full flex flex-col">
        <!-- Top bar -->
        <div class="flex items-center justify-between mb-1.5">
          <button
            class="flex items-center gap-1.5 text-macaron-cta hover:text-macaron-text transition-colors text-sm font-medium"
            @click="step = 2"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
            返回编辑
          </button>
          <span class="text-xs text-macaron-text-secondary tabular-nums font-medium">
            {{ previewSlide + 1 }} / {{ previewTotalSlides }}
          </span>
          <div class="flex items-center gap-0.5">
            <button
              class="p-1.5 rounded-lg hover:bg-macaron-hover-bg transition-colors text-macaron-muted hover:text-macaron-cta"
              @click="startGenerate"
              aria-label="重新生成"
            >
              <Icon name="lucide:refresh-cw" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="h-1 bg-macaron-progress-track rounded-full mb-2 overflow-hidden flex-shrink-0">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out bg-macaron-cta"
            :style="{ width: `${((previewSlide + 1) / previewTotalSlides) * 100}%` }"
          />
        </div>

        <!-- Slide area -->
        <div class="relative flex-1 min-h-0 flex items-center">
          <div
            ref="previewSlideContainer"
            class="w-full overflow-hidden cursor-pointer"
            @click="onPreviewSlideClick"
            @touchstart="onPreviewTouchStart"
            @touchmove="onPreviewTouchMove"
            @touchend="onPreviewTouchEnd"
          >
            <div
              class="flex transition-transform duration-300 ease-out"
              :style="{ transform: `translateX(-${previewSlide * 100}%)` }"
            >
              <!-- Slide 0: Header -->
              <div class="w-full flex-shrink-0 px-0.5">
                <div class="card-detail-card overflow-hidden min-h-[30dvh] max-h-[calc(100dvh-10rem)] overflow-y-auto flex flex-col">
                  <div class="p-4 md:p-5">
                    <div class="flex items-center gap-1.5 mb-2.5 flex-wrap">
                      <span class="card-warm-badge">
                        <Icon :name="previewCategoryMeta.icon" class="inline w-3.5 h-3.5 align-text-bottom" />
                        {{ previewCategoryMeta.name }}
                      </span>
                      <span :class="`badge-${generatedCard.difficulty}`">
                        <Icon :name="DIFFICULTY_LABELS[generatedCard.difficulty].icon" class="inline w-3.5 h-3.5 align-text-bottom" />
                        {{ DIFFICULTY_LABELS[generatedCard.difficulty].label }}
                      </span>
                      <span class="card-warm-tag">
                        {{ CARD_TYPE_LABELS[generatedCard.cardType] }}
                      </span>
                    </div>
                    <h1 class="text-xl md:text-2xl font-bold text-macaron-text leading-tight tracking-tight">
                      {{ generatedCard.title }}
                    </h1>
                    <p class="mt-2.5 text-sm md:text-base text-macaron-text-secondary leading-relaxed">
                      {{ generatedCard.oneLiner }}
                    </p>
                    <div v-if="generatedCard.tags?.length" class="flex flex-wrap gap-1.5 mt-3">
                      <span v-for="tag in generatedCard.tags.slice(0, 6)" :key="tag" class="card-warm-tag">
                        {{ tag }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5 mt-4 text-macaron-muted/80">
                      <Icon name="lucide:chevrons-right" class="w-3.5 h-3.5" />
                      <span class="text-xs">左右滑动或点击卡片继续阅读</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Content slides -->
              <div v-for="(chunk, i) in previewContentChunks" :key="'content-' + i" class="w-full flex-shrink-0 px-0.5">
                <div class="card-detail-card overflow-hidden min-h-[30dvh] flex flex-col">
                  <div class="p-4 md:p-5 flex-1 flex flex-col max-h-[calc(100dvh-12rem)] overflow-y-auto">
                    <div class="flex-1 flex flex-col justify-center">
                      <div class="prose prose-sm max-w-none card-prose" v-html="chunk" />
                    </div>
                    <div class="mt-3 pt-2 border-t border-macaron-border/50 flex items-center justify-between flex-shrink-0">
                      <span class="text-xs text-macaron-muted/70">{{ generatedCard.title }}</span>
                      <span class="text-xs text-macaron-muted/70 tabular-nums">{{ 1 + i + 1 }} / {{ previewTotalSlides }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Key Data slide -->
              <div v-if="generatedCard.keyData?.length" class="w-full flex-shrink-0 px-0.5">
                <div class="card-detail-card overflow-hidden min-h-[30dvh] flex flex-col">
                  <div class="p-4 md:p-5 flex-1 flex flex-col max-h-[calc(100dvh-12rem)] overflow-y-auto">
                    <h2 class="text-lg font-semibold text-macaron-text mb-3 flex items-center gap-2 flex-shrink-0">
                      <Icon name="lucide:bar-chart-3" class="w-5 h-5 text-macaron-cta" />
                      关键数据
                    </h2>
                    <div class="space-y-2 flex-1">
                      <div
                        v-for="data in generatedCard.keyData"
                        :key="data.label"
                        class="p-3 rounded-xl bg-macaron-card/40 backdrop-blur-sm"
                      >
                        <div class="font-medium text-macaron-text text-sm">{{ data.label }}</div>
                        <div class="text-xl font-bold mt-1.5" :style="{ color: previewCategoryMeta.color }">{{ data.value }}</div>
                        <div v-if="data.description" class="text-xs text-macaron-text-secondary mt-1.5 leading-relaxed">{{ data.description }}</div>
                      </div>
                    </div>
                    <div class="mt-3 pt-2 border-t border-macaron-border/50 flex items-center justify-between flex-shrink-0">
                      <span class="text-xs text-macaron-muted/70">{{ generatedCard.title }}</span>
                      <span class="text-xs text-macaron-muted/70 tabular-nums">{{ previewKeyDataSlideIndex + 1 }} / {{ previewTotalSlides }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- References slide -->
              <div v-if="generatedCard.references?.length" class="w-full flex-shrink-0 px-0.5">
                <div class="card-detail-card overflow-hidden min-h-[30dvh] flex flex-col">
                  <div class="p-4 md:p-5 flex-1 flex flex-col max-h-[calc(100dvh-12rem)] overflow-y-auto">
                    <h2 class="text-lg font-semibold text-macaron-text mb-3 flex items-center gap-2 flex-shrink-0">
                      <Icon name="lucide:book-open" class="w-5 h-5 text-macaron-cta" />
                      来源引用
                    </h2>
                    <div class="space-y-2 flex-1">
                      <div
                        v-for="ref in generatedCard.references"
                        :key="ref.id"
                        class="p-3 rounded-xl bg-macaron-surface-alt text-sm leading-relaxed"
                      >
                        <span class="text-macaron-text-secondary font-mono text-xs">[{{ ref.id }}]</span>
                        <span class="text-macaron-text ml-1.5">{{ ref.title }}</span>
                        <span v-if="ref.author" class="text-macaron-text-secondary"> — {{ ref.author }}</span>
                      </div>
                    </div>
                    <div class="mt-3 pt-2 border-t border-macaron-border/50 flex items-center justify-between flex-shrink-0">
                      <span class="text-xs text-macaron-muted/70">{{ generatedCard.title }}</span>
                      <span class="text-xs text-macaron-muted/70 tabular-nums">{{ previewRefSlideIndex + 1 }} / {{ previewTotalSlides }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom pagination -->
        <div class="flex items-center justify-center gap-1.5 mt-2 flex-shrink-0 pb-1">
          <button
            v-for="i in previewTotalSlides"
            :key="i"
            class="rounded-full transition-all duration-300"
            :class="i - 1 === previewSlide ? 'w-5 h-2' : 'w-2 h-2'"
            :style="{ backgroundColor: i - 1 === previewSlide ? previewCategoryMeta.color : 'var(--macaron-muted-light)' }"
            @click="previewSlide = i - 1"
            :aria-label="`第${i}页`"
          />
        </div>

        <!-- Completion decision overlay -->
        <Transition name="completion">
          <div
            v-if="showPreviewCompletion"
            class="fixed inset-0 z-40 flex items-end justify-center pb-20 bg-black/10 backdrop-blur-[2px]"
            @click.self="showPreviewCompletion = false"
          >
            <div class="bg-macaron-card rounded-t-3xl rounded-b-2xl mx-3 max-w-md w-full shadow-2xl border border-macaron-border/60 max-h-[75vh] overflow-y-auto">
              <div class="p-5">
                <!-- Header -->
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center bg-macaron-cta">
                    <Icon name="lucide:sparkles" class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-macaron-text">阅读完成</h3>
                    <p class="text-xs text-macaron-text-secondary">你已看完「{{ generatedCard.title }}」的所有内容</p>
                  </div>
                </div>

                <!-- Step 1: Archive or Save -->
                <template v-if="completionStep === 1">
                  <div class="flex gap-2.5">
                    <button
                      class="flex-1 py-2.5 rounded-xl font-medium text-sm border border-macaron-border text-macaron-text hover:bg-macaron-hover-bg transition-all duration-200 active:scale-[0.97] cursor-pointer"
                      @click="handleArchive"
                    >
                      <Icon name="lucide:archive" class="inline w-3.5 h-3.5 align-text-bottom mr-1" />
                      归档
                    </button>
                    <button
                      class="flex-1 py-2.5 rounded-xl font-medium text-sm text-white transition-all duration-200 active:scale-[0.97] cursor-pointer"
                      style="background: linear-gradient(135deg, #D4A574, #C49A6C)"
                      @click="handleAddToLibrary"
                    >
                      <Icon name="lucide:library" class="inline w-3.5 h-3.5 align-text-bottom mr-1" />
                      添加到知识库
                    </button>
                  </div>
                </template>

                <!-- Step 2: Deep Learning + Extended Learning -->
                <template v-if="completionStep === 2">
                  <!-- Deep Learning -->
                  <div class="flex items-center gap-2.5 mb-2.5">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-macaron-cta/10">
                      <Icon name="lucide:brain" class="w-4 h-4 text-macaron-cta" />
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-macaron-text">继续深入学习</div>
                      <div class="text-[11px] text-macaron-text-secondary">生成更深入的同主题卡片</div>
                    </div>
                  </div>
                  <button
                    class="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-1.5"
                    :class="deepDiveLoading ? 'bg-macaron-border text-macaron-muted cursor-wait' : 'bg-macaron-cta/10 text-macaron-cta hover:bg-macaron-cta/15'"
                    :disabled="deepDiveLoading"
                    @click="handleDeepDive"
                  >
                    <template v-if="deepDiveLoading">
                      <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                      正在生成深入内容...
                    </template>
                    <template v-else>
                      <Icon name="lucide:arrow-down-circle" class="w-4 h-4" />
                      开始深入学习
                    </template>
                  </button>

                  <!-- Divider -->
                  <div class="border-t border-macaron-border/40 my-4" />

                  <!-- Extended Learning -->
                  <div class="flex items-center gap-2.5 mb-2.5">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-macaron-cta/10">
                      <Icon name="lucide:compass" class="w-4 h-4 text-macaron-cta" />
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-macaron-text">拓展延伸</div>
                      <div class="text-[11px] text-macaron-text-secondary">发现相关知识方向</div>
                    </div>
                  </div>

                  <!-- Loading state -->
                  <div v-if="relatedTopicsLoading" class="flex items-center justify-center py-4 gap-2 text-sm text-macaron-text-secondary">
                    <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                    正在发现知识方向...
                  </div>

                  <!-- Error state -->
                  <div v-if="relatedTopicsError" class="text-xs text-red-500 flex items-center gap-1.5">
                    <Icon name="lucide:alert-circle" class="w-3.5 h-3.5 flex-shrink-0" />
                    {{ relatedTopicsError }}
                    <button class="ml-auto text-macaron-cta underline cursor-pointer" @click="handleFetchRelatedTopics">重试</button>
                  </div>

                  <!-- Related topics list -->
                  <div v-if="relatedTopics.length > 0" class="space-y-2">
                    <button
                      v-for="(topic, idx) in relatedTopics"
                      :key="idx"
                      class="w-full text-left p-3 rounded-xl border border-macaron-border/50 bg-macaron-bg/50 hover:bg-macaron-hover-bg hover:border-macaron-cta/30 transition-all duration-200 active:scale-[0.97] cursor-pointer"
                      @click="handleRelatedTopicClick(topic)"
                    >
                      <div class="flex items-start gap-2.5">
                        <div class="w-6 h-6 rounded-lg flex items-center justify-center bg-macaron-badge-bg flex-shrink-0 mt-0.5">
                          <span class="text-xs font-bold text-macaron-cta">{{ idx + 1 }}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-medium text-macaron-text">{{ topic.title }}</div>
                          <div class="text-[11px] text-macaron-text-secondary mt-0.5 leading-relaxed">{{ topic.oneLiner }}</div>
                        </div>
                        <Icon name="lucide:chevron-right" class="w-4 h-4 text-macaron-muted flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-all"
      :class="toast.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { CATEGORIES, AI_PROVIDERS, getCategoryMeta, DIFFICULTY_LABELS, CARD_TYPE_LABELS, type AIProvider, type AIConfig } from '~/types'
import type { Category, KnowledgeCard, RelatedTopic } from '~/types'
import type { LearningPath } from '~/types/paths'
import { getAllCards, insertCard } from '~/utils/cards'
import { insertPath } from '~/utils/paths'

definePageMeta({ layout: 'default' })

const categories = CATEGORIES
const client = useSupabase()

const step = ref(1)
const selectedType = ref<'card' | 'path' | null>(null)
const selectedCategory = ref<Category | null>(null)
const generating = ref(false)
const generateError = ref('')
const activeConfig = ref<{ provider: AIProvider; apiKey: string; model: string } | null>(null)
const generatedCard = ref<any>(null)
const generatedPath = ref<any>(null)
const previewSlide = ref(0)
const previewSlideContainer = ref<HTMLElement | null>(null)
const showPreviewCompletion = ref(false)

const toast = ref({ show: false, message: '', success: true })
const sessionGeneratedTitles = ref<string[]>([])

// Deep Learning & Extended Learning state
const deepDiveLoading = ref(false)
const relatedTopicsLoading = ref(false)
const relatedTopics = ref<RelatedTopic[]>([])
const relatedTopicsError = ref('')
const completionStep = ref<1 | 2>(1) // 1 = save choice, 2 = deep/extended learning

const providerName = computed(() => {
  if (!activeConfig.value) return ''
  return AI_PROVIDERS[activeConfig.value.provider]?.name || activeConfig.value.provider
})

// Load active AI config from Supabase
const { syncFromSupabase } = useAiConfig()

async function loadActiveConfig() {
  const user = useSupabaseUser()
  if (!user.value) { activeConfig.value = null; return }
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

onMounted(async () => {
  await Promise.all([loadActiveConfig(), syncFromSupabase()])
})

function showToast(message: string, success = true) {
  toast.value = { show: true, message, success }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function getSectionClass(title: string): string {
  if (title.startsWith('你有没有想过')) return 'section-hook'
  if (title.startsWith('一句话说清楚')) return 'section-summary'
  if (title.startsWith('生活中的影子')) return 'section-life'
  if (title.startsWith('背后的小原理')) return 'section-principle'
  if (title.startsWith('你可能一直搞错')) return 'section-myth'
  if (title.startsWith('所以呢')) return 'section-takeaway'
  return ''
}

function renderMarkdown(text: string): string {
  let html = text
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, (_, title) => {
    const cls = getSectionClass(title)
    return `<h2${cls ? ` class="${cls}"` : ''}>${title}</h2>`
  })
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.split('\n\n').map(block => {
    if (block.startsWith('<h')) return block
    if (block.startsWith('- ')) {
      const items = block.split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('')
      return `<ul>${items}</ul>`
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`
  }).join('')
  return html
}

// --- Preview carousel logic ---
const previewCategoryMeta = computed(() => {
  if (generatedCard.value?.category) return getCategoryMeta(generatedCard.value.category)
  if (selectedCategory.value) return getCategoryMeta(selectedCategory.value)
  return getCategoryMeta('economics')
})

const previewContentChunks = computed(() => {
  if (!generatedCard.value?.content) return []
  const html = renderMarkdown(generatedCard.value.content)
  const chunks: string[] = []
  const parts = html.split(/(?=<h[23])/)

  let buffer = ''
  for (const part of parts) {
    if (part.match(/^<h[23]/) && buffer.trim()) {
      chunks.push(buffer)
      buffer = part
    } else {
      buffer += part
    }
  }
  if (buffer.trim()) chunks.push(buffer)

  if (chunks.length === 1 && chunks[0].length > 800) {
    const paragraphs = chunks[0].split('</p>')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => p + '</p>')
    const result: string[] = []
    let group = ''
    let groupLen = 0
    for (const p of paragraphs) {
      if (groupLen > 400 && group) {
        result.push(group)
        group = ''
        groupLen = 0
      }
      group += p
      groupLen += p.length
    }
    if (group) result.push(group)
    return result.length > 0 ? result : chunks
  }

  return chunks
})

const previewTotalSlides = computed(() => {
  let count = 1 + previewContentChunks.value.length
  if (generatedCard.value?.keyData?.length) count++
  if (generatedCard.value?.references?.length) count++
  return count
})

const previewKeyDataSlideIndex = computed(() => 1 + previewContentChunks.value.length)
const previewRefSlideIndex = computed(() => {
  let idx = previewKeyDataSlideIndex.value
  if (generatedCard.value?.keyData?.length) idx++
  return idx
})

function previewNextSlide() {
  if (previewSlide.value < previewTotalSlides.value - 1) {
    previewSlide.value++
  } else {
    showPreviewCompletion.value = true
  }
}
function previewPrevSlide() {
  if (previewSlide.value > 0) previewSlide.value--
  else showPreviewCompletion.value = false
}
function onPreviewSlideClick(e: MouseEvent) {
  // Don't navigate if user is selecting text
  const sel = window.getSelection()
  if (sel && sel.toString().trim().length > 0) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  if (e.clientX - rect.left < rect.width / 2) previewPrevSlide()
  else previewNextSlide()
}

// Touch swipe
let previewTouchStartX = 0
let previewTouchStartY = 0
let previewTouchMoved = false
function onPreviewTouchStart(e: TouchEvent) {
  previewTouchStartX = e.touches[0].clientX
  previewTouchStartY = e.touches[0].clientY
  previewTouchMoved = false
}
function onPreviewTouchMove(e: TouchEvent) {
  previewTouchMoved = true
  const dx = Math.abs(e.touches[0].clientX - previewTouchStartX)
  const dy = Math.abs(e.touches[0].clientY - previewTouchStartY)
  if (dx > dy && dx > 10) e.preventDefault()
}
function onPreviewTouchEnd(e: TouchEvent) {
  // Don't navigate if user was selecting text
  const sel = window.getSelection()
  if (sel && sel.toString().trim().length > 0) return
  if (!previewTouchMoved) return
  const dx = e.changedTouches[0].clientX - previewTouchStartX
  const dy = e.changedTouches[0].clientY - previewTouchStartY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx < 0) previewNextSlide()
    else previewPrevSlide()
  }
}

// Keyboard nav
function onPreviewKeydown(e: KeyboardEvent) {
  if (step.value !== 4 || selectedType.value !== 'card') return
  if (e.key === 'ArrowRight') { e.preventDefault(); previewNextSlide() }
  if (e.key === 'ArrowLeft') { e.preventDefault(); previewPrevSlide() }
}
onMounted(() => window.addEventListener('keydown', onPreviewKeydown))
onUnmounted(() => window.removeEventListener('keydown', onPreviewKeydown))

// --- Deep Learning & Extended Learning ---
async function handleDeepDive() {
  if (!generatedCard.value) return
  deepDiveLoading.value = true
  showPreviewCompletion.value = false

  await loadActiveConfig()
  if (!activeConfig.value?.apiKey) {
    showToast('请先配置 AI 模型', false)
    deepDiveLoading.value = false
    showPreviewCompletion.value = true
    return
  }

  try {
    const res = await $fetch('/api/ai/deep-dive', {
      method: 'POST',
      body: {
        provider: activeConfig.value.provider,
        apiKey: activeConfig.value.apiKey,
        model: activeConfig.value.model,
        category: generatedCard.value.category || selectedCategory.value,
        cardTitle: generatedCard.value.title,
        cardContent: generatedCard.value.content,
        cardOneLiner: generatedCard.value.oneLiner,
        existingCardTitles: sessionGeneratedTitles.value,
      },
    })
    generatedCard.value = (res as any).card
    previewSlide.value = 0
    if (generatedCard.value?.title) {
      sessionGeneratedTitles.value.push(generatedCard.value.title)
    }
    showToast('深入学习卡片已生成')
  } catch (err: any) {
    showToast(err?.data?.statusMessage || err?.message || '深入学习生成失败', false)
    showPreviewCompletion.value = true
  } finally {
    deepDiveLoading.value = false
  }
}

async function handleFetchRelatedTopics() {
  if (!generatedCard.value) return
  relatedTopicsLoading.value = true
  relatedTopics.value = []
  relatedTopicsError.value = ''

  await loadActiveConfig()
  if (!activeConfig.value?.apiKey) {
    showToast('请先配置 AI 模型', false)
    relatedTopicsLoading.value = false
    return
  }

  try {
    const res = await $fetch('/api/ai/related-topics', {
      method: 'POST',
      body: {
        provider: activeConfig.value.provider,
        apiKey: activeConfig.value.apiKey,
        model: activeConfig.value.model,
        category: generatedCard.value.category || selectedCategory.value,
        cardTitle: generatedCard.value.title,
        cardOneLiner: generatedCard.value.oneLiner,
        cardTags: generatedCard.value.tags || [],
        existingCardTitles: sessionGeneratedTitles.value,
      },
    })
    relatedTopics.value = (res as any).topics || []
  } catch (err: any) {
    relatedTopicsError.value = err?.data?.statusMessage || err?.message || '获取推荐失败'
    showToast(relatedTopicsError.value, false)
  } finally {
    relatedTopicsLoading.value = false
  }
}

async function handleRelatedTopicClick(topic: RelatedTopic) {
  if (!generatedCard.value) return

  // Save current card first
  try {
    const card = generatedCard.value as KnowledgeCard
    const result = await insertCard(card)
    if (!result.ok) {
      showToast('保存失败: ' + result.error, false)
      return
    }
    showToast('已添加到知识库，正在生成新卡片...')
  } catch (err: any) {
    showToast(err?.message || '保存失败', false)
    return
  }

  // Reset and generate new card for the chosen topic
  generatedCard.value = null
  relatedTopics.value = []
  showPreviewCompletion.value = false
  step.value = 3

  await loadActiveConfig()
  if (!activeConfig.value?.apiKey) {
    showToast('请先配置 AI 模型', false)
    step.value = 2
    return
  }

  try {
    const res = await $fetch('/api/ai/generate-card', {
      method: 'POST',
      body: {
        provider: activeConfig.value.provider,
        apiKey: activeConfig.value.apiKey,
        model: activeConfig.value.model,
        category: selectedCategory.value,
        existingCardTitles: sessionGeneratedTitles.value,
        topicHint: { title: topic.title, oneLiner: topic.oneLiner },
      },
    })
    generatedCard.value = (res as any).card
    if (generatedCard.value?.title) {
      sessionGeneratedTitles.value.push(generatedCard.value.title)
    }
    step.value = 4
  } catch (err: any) {
    generateError.value = err?.data?.statusMessage || err?.message || '生成失败'
    step.value = 4
  }
}

// Reset slide on entering step 4
watch(() => step.value, (val) => {
  if (val === 4) { previewSlide.value = 0; showPreviewCompletion.value = false; completionStep.value = 1 }
  relatedTopics.value = []
  relatedTopicsError.value = ''
})

// Archive = discard draft, go back to category selection
function handleArchive() {
  showPreviewCompletion.value = false
  completionStep.value = 1
  setTimeout(() => {
    generatedCard.value = null
    step.value = 2
    showToast('已归档，草稿已丢弃')
  }, 200)
}

// Add to library = save to database
async function handleAddToLibrary() {
  if (!generatedCard.value) return
  try {
    const card = generatedCard.value as KnowledgeCard
    const result = await insertCard(card)
    if (!result.ok) {
      showToast(`保存失败: ${result.error}`, false)
      return
    }
    showToast('已添加到知识库')
    // Transition to step 2: deep learning + extended learning
    completionStep.value = 2
    handleFetchRelatedTopics()
  } catch (err: any) {
    showToast(err?.message || '保存失败', false)
  }
}

async function startGenerate() {
  if (!selectedCategory.value) return

  await loadActiveConfig()
  if (!activeConfig.value || !activeConfig.value.apiKey) {
    showToast('请先在「我的 → AI 配置」中启用一个模型', false)
    return
  }

  generating.value = true
  generateError.value = ''
  step.value = 3

  try {
    if (selectedType.value === 'card') {
      const allCards = await getAllCards()
      const existingTitles = [
        ...allCards
          .filter(c => c.category === selectedCategory.value)
          .map(c => c.title),
        ...sessionGeneratedTitles.value,
      ]

      const res = await $fetch('/api/ai/generate-card', {
        method: 'POST',
        body: {
          provider: activeConfig.value.provider,
          apiKey: activeConfig.value.apiKey,
          model: activeConfig.value.model,
          category: selectedCategory.value,
          existingCardTitles: existingTitles,
        },
      })

      generatedCard.value = (res as any).card
      if (generatedCard.value?.title) {
        sessionGeneratedTitles.value.push(generatedCard.value.title)
      }
    } else {
      const allCards = await getAllCards()
      const categoryCards = allCards
        .filter(c => c.category === selectedCategory.value)
        .map(c => ({ id: c.id, title: c.title, oneLiner: c.oneLiner }))

      const res = await $fetch('/api/ai/generate-path', {
        method: 'POST',
        body: {
          provider: activeConfig.value.provider,
          apiKey: activeConfig.value.apiKey,
          model: activeConfig.value.model,
          category: selectedCategory.value,
          existingPaths: [],
          existingCards: categoryCards,
        },
      })

      generatedPath.value = (res as any).path
    }

    step.value = 4
  } catch (err: any) {
    generateError.value = err?.data?.statusMessage || err?.message || '生成失败，请检查 API 配置'
    step.value = 4
  } finally {
    generating.value = false
  }
}

async function saveResult() {
  try {
    if (selectedType.value === 'card' && generatedCard.value) {
      const card = generatedCard.value as KnowledgeCard
      const result = await insertCard(card)
      if (!result.ok) {
        showToast(`保存失败: ${result.error}`, false)
        return
      }
      showToast('知识卡片已保存！')
    } else if (selectedType.value === 'path' && generatedPath.value) {
      const path = generatedPath.value as LearningPath
      const result = await insertPath(path)
      if (!result.ok) {
        showToast(`保存失败: ${result.error}`, false)
        return
      }
      showToast('技能树已保存！')
    }

    // Reset to step 1 after successful save
    setTimeout(() => {
      step.value = 1
      selectedType.value = null
      selectedCategory.value = null
      generatedCard.value = null
      generatedPath.value = null
    }, 1500)
  } catch (err: any) {
    showToast(err?.message || '保存失败', false)
  }
}
</script>

<style scoped>
.card-prose {
  --tw-prose-body: var(--macaron-prose-body);
  --tw-prose-headings: var(--macaron-prose-heading);
  --tw-prose-bold: var(--macaron-prose-heading);
  --tw-prose-links: var(--macaron-prose-link);
  --tw-prose-bullets: var(--macaron-text-secondary);
  color: var(--macaron-prose-body);
}
.completion-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.completion-leave-active { transition: all 0.3s ease-in; }
.completion-enter-from { opacity: 0; transform: translateY(100%); }
.completion-leave-to { opacity: 0; transform: translateY(100%); }

@keyframes shimmer {
  0% { width: 0%; margin-left: 0%; }
  50% { width: 70%; margin-left: 15%; }
  100% { width: 0%; margin-left: 100%; }
}
.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes ping-slow {
  0% { transform: scale(1); opacity: 0.4; }
  70% { transform: scale(1.8); opacity: 0; }
  100% { transform: scale(1.8); opacity: 0; }
}
.animate-ping-slow {
  animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
