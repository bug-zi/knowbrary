<template>
  <div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
    <!-- Top bar -->
    <div class="flex items-center gap-3 mb-2">
      <button
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-macaron-surface-alt transition-colors bg-transparent border-none cursor-pointer"
        @click="navigateTo('/profile')"
      >
        <Icon name="lucide:chevron-left" class="w-5 h-5 text-macaron-text-secondary" />
      </button>
      <h1 class="text-lg font-bold text-macaron-text">阅读配置</h1>
    </div>

    <!-- Font family -->
    <section class="card-base p-5">
      <h2 class="text-sm font-semibold text-macaron-text mb-1">字体</h2>
      <p class="text-xs text-macaron-text-secondary mb-4">选择阅读时使用的字体风格</p>
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="opt in fontFamilyOptions"
          :key="opt"
          class="py-3 px-3 rounded-xl text-sm border transition-all cursor-pointer"
          :class="settings.fontFamily === opt
            ? 'border-macaron-cta bg-macaron-cta/10 text-macaron-cta font-medium'
            : 'border-macaron-border bg-transparent text-macaron-text-secondary hover:border-macaron-cta/40'"
          @click="updateSetting('fontFamily', opt)"
        >
          <div class="text-base mb-1" :style="{ fontFamily: fontFamilyCSS[opt] }">Aa</div>
          <div class="text-xs">{{ fontFamilyLabels[opt] }}</div>
        </button>
      </div>
    </section>

    <!-- Font size -->
    <section class="card-base p-5">
      <h2 class="text-sm font-semibold text-macaron-text mb-1">字号</h2>
      <p class="text-xs text-macaron-text-secondary mb-4">调整阅读文字的大小</p>
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="opt in fontSizeOptions"
          :key="opt"
          class="py-3 rounded-xl text-sm border transition-all cursor-pointer"
          :class="settings.fontSize === opt
            ? 'border-macaron-cta bg-macaron-cta/10 text-macaron-cta font-medium'
            : 'border-macaron-border bg-transparent text-macaron-text-secondary hover:border-macaron-cta/40'"
          @click="updateSetting('fontSize', opt)"
        >
          <div class="mb-0.5" :style="{ fontSize: fontSizeCSS[opt] }">A</div>
          <div class="text-xs">{{ fontSizeLabels[opt] }}</div>
        </button>
      </div>
    </section>

    <!-- Font weight -->
    <section class="card-base p-5">
      <h2 class="text-sm font-semibold text-macaron-text mb-1">字重</h2>
      <p class="text-xs text-macaron-text-secondary mb-4">调整文字的粗细程度</p>
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="opt in fontWeightOptions"
          :key="opt"
          class="py-3 rounded-xl text-sm border transition-all cursor-pointer"
          :class="settings.fontWeight === opt
            ? 'border-macaron-cta bg-macaron-cta/10 text-macaron-cta font-medium'
            : 'border-macaron-border bg-transparent text-macaron-text-secondary hover:border-macaron-cta/40'"
          @click="updateSetting('fontWeight', opt)"
        >
          <div class="mb-0.5" :style="{ fontWeight: opt }">Aa</div>
          <div class="text-xs">{{ fontWeightLabels[opt as keyof typeof fontWeightLabels] }}</div>
        </button>
      </div>
    </section>

    <!-- Preview -->
    <section class="card-base p-5">
      <h2 class="text-sm font-semibold text-macaron-text mb-3">预览</h2>
      <div
        class="card-prose prose prose-sm max-w-none border border-macaron-border/50 rounded-xl p-4"
        :style="previewStyle"
      >
        <h2>量子纠缠</h2>
        <p>量子纠缠是量子力学中的一种现象，两个粒子一旦发生纠缠，无论相隔多远，对其中一个粒子的测量都会瞬间影响另一个粒子的状态。爱因斯坦曾将这种现象称为"鬼魅般的超距作用"。</p>
        <p>这一现象并非超自然力量，而是量子世界的基本规律。它已经从哲学思辨走进了技术应用，量子通信、量子计算等前沿科技都建立在纠缠现象之上。</p>
      </div>
    </section>

    <!-- Actions -->
    <div class="flex items-center justify-between pb-4">
      <button
        class="px-5 py-2.5 rounded-xl text-sm border border-macaron-border text-macaron-text-secondary bg-transparent cursor-pointer hover:bg-macaron-surface-alt transition-colors"
        @click="handleReset"
      >
        <Icon name="lucide:rotate-ccw" class="inline w-4 h-4 align-text-bottom" />
        恢复默认
      </button>
      <button
        class="px-6 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer transition-all border-none"
        :class="hasChanges
          ? 'bg-macaron-cta hover:bg-macaron-cta-hover active:scale-95'
          : 'bg-macaron-text-secondary/30 cursor-default'"
        :disabled="!hasChanges"
        @click="handleSave"
      >
        <Icon name="lucide:check" class="inline w-4 h-4 align-text-bottom" />
        {{ saveLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const {
  settings,
  hasChanges,
  updateSetting,
  save,
  reset,
  fontFamilyOptions,
  fontSizeOptions,
  fontWeightOptions,
  fontFamilyLabels,
  fontSizeLabels,
  fontWeightLabels,
} = useReadingSettings()

const saveLabel = ref('保存设置')

function handleSave() {
  if (!hasChanges.value) return
  save()
  saveLabel.value = '已保存'
  setTimeout(() => { saveLabel.value = '保存设置' }, 1500)
}

function handleReset() {
  reset()
}

const fontFamilyCSS: Record<string, string> = {
  sans: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
  serif: "'Noto Serif SC', 'Crimson Pro', serif",
  mono: "'JetBrains Mono', 'Noto Sans SC', monospace",
}

const fontSizeCSS: Record<string, string> = {
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
}

const previewStyle = computed(() => ({
  '--reading-font-family': fontFamilyCSS[settings.value.fontFamily],
  '--reading-font-size': fontSizeCSS[settings.value.fontSize],
  '--reading-font-weight': settings.value.fontWeight,
}))
</script>
