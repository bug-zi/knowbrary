<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/profile" class="text-macaron-text-secondary hover:text-macaron-text transition-colors no-underline">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-xl font-bold text-macaron-text">AI 模型配置</h1>
    </div>

    <div v-if="!isLoggedIn" class="card-base text-center py-12">
      <p class="text-macaron-text-secondary mb-4">请先登录以配置 AI 模型</p>
      <NuxtLink to="/login?redirect=/profile/ai" class="px-6 py-2 bg-macaron-cta text-white rounded-card no-underline">登录</NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <p class="text-sm text-macaron-text-secondary mb-6">
        配置你的 AI 大模型 API Key，用于创作功能自动生成知识卡片和技能树。支持同时配置多个模型。
      </p>

      <!-- Provider cards -->
      <div v-for="(info, provider) in AI_PROVIDERS" :key="provider" class="card-base">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Icon :name="info.icon" class="w-5 h-5 text-macaron-text" />
            <span class="font-semibold text-macaron-text">{{ info.name }}</span>
            <!-- Status badge -->
            <span
              v-if="getConfig(provider)?.apiKey"
              class="text-xs px-2 py-0.5 rounded-full"
              :class="testResults[provider] === 'ok'
                ? 'bg-green-100 text-green-700'
                : testResults[provider] === 'fail'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-blue-100 text-blue-600'"
            >
              {{ testResults[provider] === 'ok' ? '连接正常' : testResults[provider] === 'fail' ? '连接失败' : '已配置' }}
            </span>
            <span v-else class="text-xs px-2 py-0.5 rounded-full bg-macaron-border/40 text-gray-500">未配置</span>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-xs text-macaron-text-secondary">{{ getConfig(provider)?.isActive ? '已启用' : '未启用' }}</span>
            <input
              type="checkbox"
              :checked="getConfig(provider)?.isActive ?? false"
              class="w-4 h-4 accent-macaron-cta"
              @change="toggleActive(provider)"
            />
          </label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-macaron-text-secondary mb-1">API Key</label>
            <div class="relative">
              <input
                :type="showKeys[provider] ? 'text' : 'password'"
                :value="getConfig(provider)?.apiKey ?? ''"
                placeholder="输入你的 API Key"
                class="w-full px-3 py-2 pr-9 rounded-lg border border-macaron-border text-sm bg-macaron-card text-macaron-text focus:outline-none focus:ring-2 focus:ring-macaron-cta/40"
                @input="updateConfig(provider, 'apiKey', ($event.target as HTMLInputElement).value)"
              />
              <button
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                @click="showKeys[provider] = !showKeys[provider]"
              >
                <Icon :name="showKeys[provider] ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4 text-macaron-text-secondary" />
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs text-macaron-text-secondary mb-1">模型</label>
            <select
              :value="getConfig(provider)?.model ?? info.models[0]"
              class="w-full px-3 py-2 rounded-lg border border-macaron-border text-sm bg-macaron-card text-macaron-text focus:outline-none focus:ring-2 focus:ring-macaron-cta/40"
              @change="updateConfig(provider, 'model', ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="m in info.models" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between mt-3">
          <!-- Test connection button -->
          <button
            :disabled="!getConfig(provider)?.apiKey || testing[provider]"
            class="px-3 py-1.5 text-sm rounded-lg border transition-colors"
            :class="testResults[provider] === 'ok'
              ? 'border-green-300 text-green-600 bg-green-50 hover:bg-green-100'
              : testResults[provider] === 'fail'
                ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100'
                : 'border-macaron-border text-macaron-text-secondary hover:bg-macaron-border/30'"
            @click="testConnection(provider as AIProvider)"
          >
            <Icon
              :name="testing[provider] ? 'lucide:loader-2' : testResults[provider] === 'ok' ? 'lucide:check-circle' : testResults[provider] === 'fail' ? 'lucide:x-circle' : 'lucide:plug'"
              class="inline w-4 h-4 align-text-bottom"
              :class="testing[provider] ? 'animate-spin' : ''"
            />
            {{ testing[provider] ? '测试中...' : testResults[provider] === 'ok' ? '连接正常' : testResults[provider] === 'fail' ? '重新测试' : getConfig(provider)?.apiKey ? '测试连接' : '未配置' }}
          </button>

          <button
            @click="saveConfig(provider as AIProvider)"
            :disabled="saving[provider] || !getConfig(provider)?.apiKey"
            class="px-4 py-1.5 text-sm bg-macaron-cta text-white rounded-card hover:bg-macaron-cta-hover transition-colors disabled:opacity-50"
          >
            {{ saving[provider] ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AI_PROVIDERS, type AIProvider, type AIConfig } from '~/types'

const { isLoggedIn } = useAuth()
const client = useSupabase()
const user = useSupabaseUser()

const configs = ref<Record<string, AIConfig>>({})
const saving = ref<Record<string, boolean>>({})
const testing = ref<Record<string, boolean>>({})
const testResults = ref<Record<string, 'ok' | 'fail' | ''>>({})
const showKeys = ref<Record<string, boolean>>({})

// Shared AI config state
const { hasActiveAi, markActive, markInactive } = useAiConfig()

// Load existing configs
const { data: configRows } = await useAsyncData('ai-configs', async () => {
  if (!user.value) return []
  const { data } = await client.from('ai_configs').select('*').eq('user_id', user.value.id)
  return data ?? []
}, { watch: [user] })

watch(configRows, (rows) => {
  const map: Record<string, AIConfig> = {}
  rows?.forEach((r: any) => {
    map[r.provider] = {
      id: r.id,
      userId: r.user_id,
      provider: r.provider,
      apiKey: r.api_key,
      model: r.model,
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  })
  configs.value = map
}, { immediate: true })

function getConfig(provider: string): AIConfig | undefined {
  return configs.value[provider]
}

function updateConfig(provider: string, field: string, value: string) {
  // Reset test result when config changes
  testResults.value[provider] = ''

  const existing = configs.value[provider]
  if (existing) {
    (existing as any)[field] = value
  } else {
    const info = AI_PROVIDERS[provider as AIProvider]
    configs.value[provider] = {
      id: '',
      userId: user.value?.id || '',
      provider: provider as AIProvider,
      apiKey: field === 'apiKey' ? value : '',
      model: field === 'model' ? value : info.models[0],
      isActive: false,
      createdAt: '',
      updatedAt: '',
    }
  }
}

function toggleActive(provider: string) {
  const c = configs.value[provider]
  if (c) {
    c.isActive = !c.isActive
    saveConfig(provider as AIProvider)
  }
}

async function saveConfig(provider: AIProvider) {
  if (!user.value) return
  const c = configs.value[provider]
  if (!c) return

  saving.value[provider] = true
  const row = {
    user_id: user.value.id,
    provider,
    api_key: c.apiKey,
    model: c.model,
    is_active: c.isActive,
  }

  if (c.id) {
    await client.from('ai_configs').update(row).eq('id', c.id)
  } else {
    const { data } = await client.from('ai_configs').insert(row).select().single()
    if (data) c.id = data.id
  }
  saving.value[provider] = false

  // Sync shared state + localStorage
  if (Object.values(configs.value).some(c => c.isActive && c.apiKey)) {
    markActive()
  } else {
    markInactive()
  }
}

async function testConnection(provider: AIProvider) {
  const c = configs.value[provider]
  if (!c?.apiKey) return

  testing.value[provider] = true
  testResults.value[provider] = ''

  try {
    await $fetch('/api/ai/test-connection', {
      method: 'POST',
      body: { provider, apiKey: c.apiKey, model: c.model },
    })
    testResults.value[provider] = 'ok'
  } catch {
    testResults.value[provider] = 'fail'
  } finally {
    testing.value[provider] = false
  }
}
</script>
