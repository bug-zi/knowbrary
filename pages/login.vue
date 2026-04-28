<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="text-4xl mb-2">🔬</div>
        <h1 class="text-xl font-bold text-macaron-text">万象研究所</h1>
        <p class="text-sm text-macaron-text-secondary mt-1">{{ isRegister ? '创建账号，开始你的知识之旅' : '登录你的账号' }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-macaron-text mb-1">邮箱</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
            class="w-full px-4 py-2.5 rounded-card border border-macaron-border bg-macaron-card text-macaron-text focus:outline-none focus:ring-2 focus:ring-macaron-cta/40"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-macaron-text mb-1">密码</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="至少 6 位"
            class="w-full px-4 py-2.5 rounded-card border border-macaron-border bg-macaron-card text-macaron-text focus:outline-none focus:ring-2 focus:ring-macaron-cta/40"
          />
        </div>

        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-sm text-green-600">{{ successMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 bg-macaron-cta text-white rounded-card font-medium hover:bg-macaron-cta-hover transition-colors disabled:opacity-50"
        >
          {{ loading ? '处理中...' : isRegister ? '注册' : '登录' }}
        </button>
      </form>

      <!-- Toggle -->
      <p class="text-center text-sm text-macaron-text-secondary mt-4">
        {{ isRegister ? '已有账号？' : '没有账号？' }}
        <button @click="isRegister = !isRegister; errorMsg = ''; successMsg = ''" class="text-macaron-cta hover:underline">
          {{ isRegister ? '登录' : '注册' }}
        </button>
      </p>

      <!-- Divider -->
      <div class="flex items-center gap-3 my-6">
        <div class="flex-1 h-px bg-macaron-border" />
        <span class="text-xs text-macaron-text-secondary">或</span>
        <div class="flex-1 h-px bg-macaron-border" />
      </div>

      <!-- OAuth -->
      <div class="space-y-3">
        <button
          @click="handleOAuth('github')"
          class="w-full flex items-center justify-center gap-2 py-2.5 bg-macaron-card border border-macaron-border rounded-card text-sm text-macaron-text hover:bg-macaron-border/30 transition-colors"
        >
          <Icon name="lucide:github" class="w-4 h-4" />
          GitHub 登录
        </button>
        <button
          @click="handleOAuth('google')"
          class="w-full flex items-center justify-center gap-2 py-2.5 bg-macaron-card border border-macaron-border rounded-card text-sm text-macaron-text hover:bg-macaron-border/30 transition-colors"
        >
          <Icon name="lucide:chrome" class="w-4 h-4" />
          Google 登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login, signup, loginWithOAuth, isLoggedIn } = useAuth()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const isRegister = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Already logged in, redirect
watch(isLoggedIn, (val) => {
  if (val) {
    const redirect = (route.query.redirect as string) || '/profile'
    router.push(redirect)
  }
}, { immediate: true })

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const { error } = isRegister.value
    ? await signup(email.value, password.value)
    : await login(email.value, password.value)

  loading.value = false
  if (error) {
    errorMsg.value = error.message.includes('Invalid login')
      ? '邮箱或密码错误'
      : error.message.includes('already registered')
        ? '该邮箱已注册'
        : error.message
  } else if (isRegister.value) {
    successMsg.value = '注册成功！请查收邮箱确认链接'
  }
}

async function handleOAuth(provider: 'google' | 'github') {
  const { error } = await loginWithOAuth(provider)
  if (error) errorMsg.value = error.message
}
</script>
