<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-macaron-bg/90 backdrop-blur-md border-t border-macaron-border safe-area-bottom">
    <div class="flex items-center justify-around h-14">
      <template v-for="item in navItems" :key="item.path">
        <NuxtLink
          v-if="item.path !== '/create'"
          :to="item.path"
          class="relative flex flex-col items-center gap-0.5 no-underline py-1 px-3 rounded-xl transition-colors"
          :class="isActive(item.path) ? 'text-macaron-cta' : 'text-macaron-text-secondary'"
        >
          <div v-if="isActive(item.path)" class="absolute inset-0 rounded-xl bg-macaron-cta/15"></div>
          <Icon :name="item.icon" class="text-lg relative z-[1]" />
          <span class="text-[10px] relative z-[1]">{{ item.label }}</span>
        </NuxtLink>
        <button
          v-else
          class="flex flex-col items-center gap-0.5 py-1 px-2 bg-transparent border-none cursor-pointer"
          :class="hasActiveAi ? 'text-macaron-text-secondary' : 'opacity-40 text-macaron-text-secondary'"
          @click="handleCreateClick"
        >
          <Icon :name="item.icon" class="text-lg" />
          <span class="text-[10px]">{{ item.label }}</span>
        </button>
      </template>
    </div>

    <!-- Tooltip -->
    <div
      v-if="showTip"
      class="absolute bottom-16 left-1/2 -translate-x-1/2 bg-macaron-text text-white text-xs px-4 py-2 rounded-xl shadow-lg whitespace-nowrap z-50"
    >
      {{ tipMessage }}
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const showTip = ref(false)

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
const tipMessage = ref('')

const { hasActiveAi, syncFromSupabase } = useAiConfig()

onMounted(syncFromSupabase)

const navItems = [
  { path: '/', label: '首页', icon: 'lucide:home' },
  { path: '/categories', label: '分类', icon: 'lucide:layout-grid' },
  { path: '/paths', label: '路径', icon: 'lucide:route' },
  { path: '/create', label: '创作', icon: 'lucide:wand-sparkles' },
  { path: '/graph', label: '图谱', icon: 'lucide:share-2' },
  { path: '/experiment', label: '实验', icon: 'lucide:flask-conical' },
  { path: '/checkin', label: '打卡', icon: 'lucide:calendar-check' },
  { path: '/profile', label: '我的', icon: 'lucide:user' },
]

function handleCreateClick() {
  if (hasActiveAi.value) {
    navigateTo('/create')
  } else {
    tipMessage.value = '请先在「我的 → AI 配置」中启用一个模型'
    showTip.value = true
    setTimeout(() => { showTip.value = false }, 2500)
  }
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
