<template>
  <div v-if="isLoggedIn" class="flex items-center gap-2">
    <button
      @click="showMenu = !showMenu"
      class="flex items-center gap-2 p-1 rounded-lg hover:bg-macaron-surface-hover transition-colors"
    >
      <img
        v-if="profile?.avatarUrl"
        :src="profile.avatarUrl"
        alt="avatar"
        class="w-7 h-7 rounded-full object-cover"
      />
      <div v-else class="w-7 h-7 rounded-full bg-macaron-cta/20 flex items-center justify-center text-xs font-bold text-macaron-cta">
        {{ initial }}
      </div>
    </button>
    <!-- Dropdown -->
    <div v-if="showMenu" class="absolute top-12 right-4 w-48 bg-macaron-card rounded-xl shadow-lg border border-macaron-border py-1 z-50">
      <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-macaron-text hover:bg-macaron-border/40 no-underline" @click="showMenu = false">
        <Icon name="lucide:user" class="inline w-4 h-4 align-text-bottom mr-1" /> 个人资料
      </NuxtLink>
      <NuxtLink to="/profile/ai" class="block px-4 py-2 text-sm text-macaron-text hover:bg-macaron-border/40 no-underline" @click="showMenu = false">
        <Icon name="lucide:bot" class="inline w-4 h-4 align-text-bottom mr-1" /> AI 配置
      </NuxtLink>
      <hr class="my-1 border-macaron-border" />
      <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-macaron-danger-hover">
        <Icon name="lucide:log-out" class="inline w-4 h-4 align-text-bottom mr-1" /> 退出登录
      </button>
    </div>
  </div>
  <NuxtLink
    v-else
    :to="`/login?redirect=${currentPath}`"
    class="px-3 py-1.5 text-sm text-macaron-cta hover:bg-white/60 rounded-card transition-colors no-underline font-medium"
  >
    登录
  </NuxtLink>
</template>

<script setup lang="ts">
const { isLoggedIn, profile, logout } = useAuth()
const route = useRoute()
const router = useRouter()

const showMenu = ref(false)
const currentPath = computed(() => route.path)

const initial = computed(() => {
  if (profile.value?.username) return profile.value.username[0].toUpperCase()
  if (profile.value?.fullName) return profile.value.fullName[0]
  return 'U'
})

function handleLogout() {
  showMenu.value = false
  logout()
}

// Close menu on click outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
function handleClickOutside(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest('.relative') || (e.target as HTMLElement).closest('[class*="flex items-center gap-2"]')
  if (!el) showMenu.value = false
}
</script>
