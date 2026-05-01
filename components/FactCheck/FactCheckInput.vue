<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="flex justify-center">
        <div class="w-16 h-16 rounded-2xl bg-macaron-badge-bg flex items-center justify-center">
          <Icon name="lucide:shield-check" class="w-8 h-8 text-macaron-cta" />
        </div>
      </div>
      <h1 class="text-2xl font-bold text-macaron-text">辨真</h1>
      <p class="text-sm text-macaron-text-secondary">输入一个说法，AI 联网搜索帮你查证真假</p>
    </div>

    <!-- Input card -->
    <div class="card-base space-y-4">
      <textarea
        v-model="claim"
        class="w-full min-h-[120px] p-4 rounded-xl border border-macaron-border bg-macaron-input-bg text-macaron-text placeholder:text-macaron-muted resize-none focus:outline-none focus:ring-2 focus:ring-macaron-cta/30 focus:border-macaron-cta transition-colors"
        placeholder="输入你想验证的说法...&#10;例如：喝咖啡会导致骨质疏松"
        @keydown.ctrl.enter="submit"
      />
      <div class="text-xs text-macaron-muted text-right">{{ claim.length }} / 500</div>
    </div>

    <!-- Topic chips -->
    <div class="space-y-2">
      <p class="text-xs text-macaron-text-secondary font-medium">常见话题：</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="topic in topicExamples"
          :key="topic.label"
          class="text-xs px-3 py-1.5 rounded-full border border-macaron-border bg-macaron-surface-alt text-macaron-text-secondary hover:border-macaron-cta/40 hover:text-macaron-cta transition-colors"
          @click="claim = topic.example"
        >
          {{ topic.label }}
        </button>
      </div>
    </div>

    <!-- Submit button -->
    <button
      class="w-full py-3.5 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
      :class="canSubmit ? 'bg-macaron-cta hover:bg-macaron-cta-hover cursor-pointer' : 'bg-macaron-border cursor-not-allowed'"
      :disabled="!canSubmit"
      @click="submit"
    >
      <Icon name="lucide:search-check" class="w-5 h-5" />
      开始验证
    </button>

    <p v-if="!aiReady" class="text-xs text-center text-macaron-text-secondary">
      请先在「我的 -&gt; AI 配置」中启用一个模型
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  aiReady: boolean
}>()

const emit = defineEmits<{
  submit: [claim: string]
}>()

const claim = ref('')

const topicExamples = [
  { label: '健康', example: '每天喝8杯水才健康' },
  { label: '科技', example: '5G信号对人体有害' },
  { label: '历史', example: '长城是太空中唯一能看到的人造建筑' },
  { label: '社会', example: '人类只使用了大脑的10%' },
  { label: '环境', example: '北极熊的数量在过去20年减少了一半' },
]

const canSubmit = computed(() => props.aiReady && claim.value.trim().length > 0 && claim.value.length <= 500)

function submit() {
  if (!canSubmit.value) return
  emit('submit', claim.value.trim())
}
</script>
