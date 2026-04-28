<template>
  <div v-if="show" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-macaron-card rounded-2xl shadow-xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-macaron-text">编辑资料</h2>
        <button @click="$emit('close')" class="p-1 hover:bg-macaron-hover-bg rounded-lg">
          <Icon name="lucide:x" class="w-5 h-5 text-macaron-text-secondary" />
        </button>
      </div>

      <!-- Avatar -->
      <div class="flex items-center gap-4 mb-6">
        <div class="relative">
          <img v-if="avatarPreview" :src="avatarPreview" class="w-16 h-16 rounded-full object-cover border-2 border-macaron-border" />
          <div v-else class="w-16 h-16 rounded-full bg-macaron-cta/20 flex items-center justify-center text-2xl font-bold text-macaron-cta">
            {{ form.username ? form.username[0].toUpperCase() : 'U' }}
          </div>
          <label class="absolute -bottom-1 -right-1 w-7 h-7 bg-macaron-card rounded-full shadow border border-macaron-border flex items-center justify-center cursor-pointer hover:bg-macaron-hover-bg">
            <Icon name="lucide:camera" class="w-3.5 h-3.5 text-macaron-text-secondary" />
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
          </label>
        </div>
        <div class="flex-1 text-sm text-macaron-text-secondary">点击相机图标更换头像</div>
      </div>

      <form @submit.prevent="handleSave" class="space-y-4">
        <!-- Username -->
        <div>
          <label class="block text-sm font-medium text-macaron-text mb-1">用户名</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="给自己起个名字"
            maxlength="20"
            class="w-full px-4 py-2.5 rounded-card border border-macaron-border bg-macaron-input-bg text-macaron-text focus:outline-none focus:ring-2 focus:ring-macaron-cta/40"
          />
        </div>

        <!-- Bio -->
        <div>
          <label class="block text-sm font-medium text-macaron-text mb-1">个性签名</label>
          <textarea
            v-model="form.bio"
            placeholder="一句话介绍自己"
            maxlength="100"
            rows="2"
            class="w-full px-4 py-2.5 rounded-card border border-macaron-border bg-white text-macaron-text focus:outline-none focus:ring-2 focus:ring-macaron-cta/40 resize-none"
          />
        </div>

        <p v-if="saveError" class="text-sm text-red-500">{{ saveError }}</p>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 py-2.5 border border-macaron-border rounded-card text-macaron-text hover:bg-macaron-hover-bg transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 py-2.5 bg-macaron-cta text-white rounded-card font-medium hover:bg-macaron-cta-hover transition-colors disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ show: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { profile, updateProfile } = useAuth()

const form = reactive({
  username: profile.value?.username || '',
  bio: profile.value?.bio || '',
})

const avatarPreview = ref(profile.value?.avatarUrl || '')
const avatarFile = ref<File | null>(null)
const saving = ref(false)
const saveError = ref('')

// Sync profile changes to form
watch(() => profile.value, (p) => {
  if (p) {
    form.username = p.username || ''
    form.bio = p.bio || ''
    avatarPreview.value = p.avatarUrl || ''
  }
}, { immediate: true })

function handleAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

async function handleSave() {
  saving.value = true
  saveError.value = ''

  try {
    // Upload avatar if changed
    let avatarUrl = profile.value?.avatarUrl || ''
    if (avatarFile.value) {
      const client = useSupabase()
      const { user } = useAuth()
      const ext = avatarFile.value.name.split('.').pop()
      const path = `${user.value!.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await client.storage.from('avatars').upload(path, avatarFile.value, { upsert: true })
      if (!uploadErr) {
        const { data } = client.storage.from('avatars').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }
    }

    const { error } = await updateProfile({
      username: form.username || null,
      bio: form.bio,
      avatarUrl: avatarUrl || undefined,
    })

  saving.value = false
  if (error) {
    saveError.value = error.message?.includes?.('unique') ? '该用户名已被占用' : (error.message || '保存失败')
  } else {
    emit('close')
  }
  } catch (e: any) {
    saving.value = false
    saveError.value = e.message || '保存失败'
  }
}
</script>
