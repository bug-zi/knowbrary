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
          <!-- Item with dropdown children -->
          <div v-if="item.children" class="relative" @mouseenter="hoverDropdown = item.path" @mouseleave="hoverDropdown = null">
            <button
              class="px-3 py-1.5 rounded-xl text-sm bg-transparent border-none cursor-pointer transition-colors"
              :class="isItemOrChildActive(item) ? 'text-macaron-cta font-medium' : 'text-macaron-text-secondary hover:bg-macaron-surface-hover hover:text-macaron-text'"
              @click="navigateTo(item.path)"
            >
              <Icon :name="item.icon" class="inline w-4 h-4" /> {{ item.label }}
              <Icon name="lucide:chevron-down" class="inline w-3 h-3 ml-0.5" />
            </button>
            <!-- pt-2 bridge eliminates mouseleave gap that mt-1 caused -->
            <div
              v-if="hoverDropdown === item.path"
              class="absolute top-full left-0 pt-2 z-50"
            >
              <div class="bg-macaron-card border border-macaron-border rounded-xl shadow-lg py-1 min-w-[120px]">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.path"
                  :to="child.path"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-sm no-underline transition-colors whitespace-nowrap"
                  :class="isActive(child.path) ? 'text-macaron-cta font-medium bg-macaron-badge-bg' : 'text-macaron-text-secondary hover:text-macaron-cta hover:bg-macaron-badge-bg'"
                >
                  <Icon :name="child.icon" class="w-4 h-4" />
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Normal link item -->
          <NuxtLink
            v-else-if="!item.requiresAi"
            :to="item.path"
            class="relative px-3 py-1.5 rounded-xl text-sm no-underline transition-colors"
            :class="isActive(item.path)
              ? 'text-macaron-cta font-medium'
              : 'text-macaron-text-secondary hover:bg-macaron-surface-hover hover:text-macaron-text'"
          >
            <div v-if="isActive(item.path)" class="absolute inset-0 rounded-xl bg-macaron-cta/15"></div>
            <span class="relative z-[1]"><Icon :name="item.icon" class="inline w-4 h-4" /> {{ item.label }}</span>
          </NuxtLink>

          <!-- AI required item -->
          <button
            v-else
            class="px-3 py-1.5 rounded-xl text-sm bg-transparent border-none cursor-pointer transition-colors"
            :class="hasActiveAi ? 'text-macaron-text-secondary hover:bg-macaron-surface-hover hover:text-macaron-text' : 'opacity-40 text-macaron-text-secondary'"
            @click="handleAiRequiredClick(item.path)"
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
interface NavChild {
  path: string
  label: string
  icon: string
}

interface NavItem {
  path: string
  label: string
  icon: string
  requiresAi?: boolean
  children?: NavChild[]
}

defineEmits(['toggleSearch'])

const route = useRoute()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const hoverDropdown = ref<string | null>(null)

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const { hasActiveAi, syncFromSupabase } = useAiConfig()

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function isItemOrChildActive(item: NavItem) {
  if (isActive(item.path)) return true
  return item.children?.some(c => isActive(c.path)) || false
}

onMounted(syncFromSupabase)

const navItems: NavItem[] = [
  {
    path: '/', label: '大厅', icon: 'lucide:home',
    children: [
      { path: '/categories', label: '万象', icon: 'lucide:layout-grid' },
      { path: '/paths', label: '研途', icon: 'lucide:route' },
    ],
  },
  { path: '/create', label: '创作', icon: 'lucide:wand-sparkles', requiresAi: true },
  { path: '/verify', label: '辨真', icon: 'lucide:shield-check', requiresAi: true },
  { path: '/experiment', label: '试炼', icon: 'lucide:flask-conical' },
  { path: '/profile', label: '研究员', icon: 'lucide:user' },
  {
    path: '#more', label: '更多', icon: 'lucide:menu',
    children: [
      { path: '/graph', label: '星图', icon: 'lucide:share-2' },
      { path: '/checkin', label: '足迹', icon: 'lucide:calendar-check' },
    ],
  },
]

function handleAiRequiredClick(path: string) {
  if (hasActiveAi.value) {
    navigateTo(path)
  } else {
    alert('请先在「研究员 → AI 配置」中启用一个模型')
  }
}
</script>
