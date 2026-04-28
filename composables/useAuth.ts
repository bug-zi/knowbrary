import type { UserProfile } from '~/types'
import { useSupabaseUser } from '~/utils/supabase'

export function useAuth() {
  const client = useSupabase()
  const user = useSupabaseUser()
  const router = useRouter()

  const profile = useState<UserProfile | null>('auth-profile', () => null)
  const profileLoading = useState<boolean>('auth-profile-loading', () => false)

  const isLoggedIn = computed(() => !!user.value)

  async function fetchProfile() {
    if (!user.value) { profile.value = null; return }
    profileLoading.value = true
    const { data } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.value!.id)
      .single()
    profile.value = data ? {
      id: data.id,
      username: data.username,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      bio: data.bio || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } : null
    profileLoading.value = false
  }

  async function updateProfile(updates: Partial<Pick<UserProfile, 'username' | 'fullName' | 'avatarUrl' | 'bio'>>) {
    if (!user.value) return { error: new Error('Not logged in') }
    const snakeUpdates: Record<string, any> = { id: user.value.id }
    if (updates.username !== undefined) snakeUpdates.username = updates.username
    if (updates.fullName !== undefined) snakeUpdates.full_name = updates.fullName
    if (updates.avatarUrl !== undefined) snakeUpdates.avatar_url = updates.avatarUrl
    if (updates.bio !== undefined) snakeUpdates.bio = updates.bio
    const { error } = await client.from('profiles').upsert(snakeUpdates, { onConflict: 'id' })
    if (!error) await fetchProfile()
    return { error }
  }

  async function login(email: string, password: string) {
    const { error } = await client.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signup(email: string, password: string) {
    const { error } = await client.auth.signUp({ email, password })
    return { error }
  }

  async function loginWithOAuth(provider: 'google' | 'github') {
    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/confirm` },
    })
    return { error }
  }

  async function logout() {
    await client.auth.signOut()
    profile.value = null
    router.push('/')
  }

  // Auto-fetch profile when user changes
  watch(user, (newUser) => {
    if (newUser) fetchProfile()
    else profile.value = null
  }, { immediate: true })

  return {
    user, profile, profileLoading, isLoggedIn,
    login, signup, loginWithOAuth, logout,
    fetchProfile, updateProfile,
  }
}
