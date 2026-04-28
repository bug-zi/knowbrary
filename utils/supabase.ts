import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (_client) return _client
  const config = useRuntimeConfig()
  _client = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
  return _client
}

export function useSupabase(): SupabaseClient {
  return getSupabaseClient()
}

export function useSupabaseAdmin(): SupabaseClient {
  return getSupabaseClient()
}

export function useSupabaseUser() {
  const user = useState<User | null>('supabase-user', () => null)

  if (import.meta.client) {
    const client = getSupabaseClient()
    const listenerRegistered = useState<boolean>('supabase-auth-listener')
    if (!listenerRegistered.value) {
      listenerRegistered.value = true
      client.auth.getUser().then(({ data }) => {
        user.value = data.user
      })
      client.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
      })
    }
  }

  return user
}
