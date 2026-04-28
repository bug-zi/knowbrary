<template>
  <header class="sticky top-0 z-50 bg-macaron-bg/80 backdrop-blur-md border-b border-macaron-border">
    <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 text-macaron-text no-underline">
        <Icon name="lucide:microscope" class="text-xl" />
        <span class="font-bold text-lg">万象研究所</span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-1">
        <template v-for="item in navItems" :key="item.path">
          <NuxtLink
            v-if="item.path !== '/create'"
            :to="item.path"
            class="relative px-3 py-1.5 rounded-xl text-sm no-underline transition-colors"
            :class="isActive(item.path)
              ? 'text-macaron-cta font-medium'
              : 'text-macaron-text-secondary hover:bg-macaron-surface-hover hover:text-macaron-text'"
          >
            <div v-if="isActive(item.path)" class="absolute inset-0 rounded-xl bg-macaron-cta/15"></div>
            <span class="relative z-[1]"><Icon :name="item.icon" class="inline w-4 h-4" /> {{ item.label }}</span>
          </NuxtLink>
          <button
            v-else
            class="px-3 py-1.5 rounded-xl text-sm bg-transparent border-none cursor-pointer transition-colors"
            :class="hasActiveAi ? 'text-macaron-text-secondary hover:bg-macaron-surface-hover hover:text-macaron-text' : 'opacity-40 text-macaron-text-secondary'"
            @click="handleCreateClick"
          >
            <Icon :name="item.icon" class="inline w-4 h-4" /> {{ item.label }}
          </button>
        </template>
      </nav>

      <!-- Right side: theme + search + auth -->
      <div class="flex items-center gap-1">
        <button
          class="p-2 rounded-lg hover:bg-macaron-surface-hover transition-colors"
          @click="toggleTheme"
          :aria-label="isDark ? '切换浅色模式' : '切换深色模式'"
        >
          <Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" class="w-5 h-5 text-macaron-text-secondary" />
        </button>
        <button
          class="p-2 rounded-lg hover:bg-macaron-surface-hover transition-colors"
          @click="$emit('toggleSearch')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-macaron-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <AuthButton />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits(['toggleSearch'])

const route = useRoute()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
const { hasActiveAi, syncFromSupabase } = useAiConfig()

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

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
    alert('请先在「我的 → AI 配置」中启用一个模型')
  }
}
</script>
