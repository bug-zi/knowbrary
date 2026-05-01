<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-macaron-bg/90 backdrop-blur-md border-t border-macaron-border safe-area-bottom">
    <div class="flex items-center justify-around h-14">
      <template v-for="(item, index) in navItems" :key="item.path">
        <!-- Item with dropdown children -->
        <div v-if="item.children" class="relative">
          <button
            class="flex flex-col items-center gap-0.5 py-1 px-3 bg-transparent border-none cursor-pointer transition-colors rounded-xl"
            :class="isItemOrChildActive(item) ? 'text-macaron-cta' : 'text-macaron-text-secondary'"
            @click.stop="handleDropdownClick(index, item.path)"
          >
            <div v-if="isItemOrChildActive(item)" class="absolute inset-0 rounded-xl bg-macaron-cta/15"></div>
            <Icon :name="item.icon" class="text-lg relative z-[1]" />
            <span class="text-[10px] relative z-[1]">{{ item.label }}</span>
          </button>
          <!-- Dropdown popup: pb-2 bridge + @click.stop prevents overlay interference -->
          <Transition name="dropdown">
            <div
              v-if="openDropdown === index"
              class="absolute bottom-full pb-2 left-1/2 -translate-x-1/2 z-[100]"
              @click.stop
            >
              <div class="bg-macaron-card border border-macaron-border rounded-xl shadow-lg py-1 min-w-[110px]">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.path"
                  :to="child.path"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-sm no-underline transition-colors whitespace-nowrap"
                  :class="isActive(child.path) ? 'text-macaron-cta font-medium' : 'text-macaron-text-secondary hover:text-macaron-cta hover:bg-macaron-badge-bg'"
                  @click="openDropdown = null"
                >
                  <Icon :name="child.icon" class="w-4 h-4" />
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Normal link item -->
        <NuxtLink
          v-else-if="!item.requiresAi"
          :to="item.path"
          class="relative flex flex-col items-center gap-0.5 no-underline py-1 px-3 rounded-xl transition-colors"
          :class="isActive(item.path) ? 'text-macaron-cta' : 'text-macaron-text-secondary'"
        >
          <div v-if="isActive(item.path)" class="absolute inset-0 rounded-xl bg-macaron-cta/15"></div>
          <Icon :name="item.icon" class="text-lg relative z-[1]" />
          <span class="text-[10px] relative z-[1]">{{ item.label }}</span>
        </NuxtLink>

        <!-- AI required item -->
        <button
          v-else
          class="flex flex-col items-center gap-0.5 py-1 px-2 bg-transparent border-none cursor-pointer"
          :class="hasActiveAi ? 'text-macaron-text-secondary' : 'opacity-40 text-macaron-text-secondary'"
          @click="handleAiRequiredClick(item.path)"
        >
          <Icon :name="item.icon" class="text-lg" />
          <span class="text-[10px]">{{ item.label }}</span>
        </button>
      </template>
    </div>

    <!-- Click-outside overlay: low z-index so dropdown (z-[100]) is above it -->
    <div
      v-if="openDropdown !== null"
      class="fixed inset-0 z-[1]"
      @click="openDropdown = null"
    />

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

const route = useRoute()
const showTip = ref(false)
const tipMessage = ref('')
const openDropdown = ref<number | null>(null)

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function isItemOrChildActive(item: NavItem) {
  if (isActive(item.path)) return true
  return item.children?.some(c => isActive(c.path)) || false
}

function toggleDropdown(index: number) {
  if (openDropdown.value === index) {
    openDropdown.value = null
  } else {
    openDropdown.value = index
  }
}

function handleDropdownClick(index: number, path: string) {
  // If dropdown is open, close it; if closed, open it and navigate to parent path
  if (openDropdown.value === index) {
    openDropdown.value = null
  } else {
    openDropdown.value = index
  }
  navigateTo(path)
}

const { hasActiveAi, syncFromSupabase } = useAiConfig()

onMounted(syncFromSupabase)

// Close dropdown on route change
watch(() => route.path, () => { openDropdown.value = null })

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
    tipMessage.value = '请先在「研究员 → AI 配置」中启用一个模型'
    showTip.value = true
    setTimeout(() => { showTip.value = false }, 2500)
  }
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
</style>
