// Re-export types from the canonical source
export { AI_PROVIDERS, type AIProvider, type AIConfig } from '~/types'

import type { AIProvider, AIConfig } from '~/types'

const STORAGE_KEY = 'wanxiang-ai-active'

/**
 * Centralized AI config state management.
 *
 * - `hasActiveAi`: reactive boolean, persisted to localStorage as fallback
 * - `syncFromSupabase()`: queries Supabase once and writes both state + localStorage
 * - All components share the same useState instance so navigation never loses state
 */
export function useAiConfig() {
  const hasActiveAi = useState<boolean>('has-active-ai', () => {
    if (import.meta.client) {
      try {
        return localStorage.getItem(STORAGE_KEY) === 'true'
      } catch {
        return false
      }
    }
    return false
  })

  /** Persist current value to localStorage (client only) */
  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, String(hasActiveAi.value))
    } catch { /* storage full or blocked */ }
  }

  /** Query Supabase for active configs and sync state + localStorage */
  async function syncFromSupabase() {
    if (!import.meta.client) return
    try {
      const user = useSupabaseUser()
      if (!user.value) {
        // Auth not loaded yet — keep localStorage value, don't overwrite
        return
      }
      const client = useSupabase()
      const { count } = await client
        .from('ai_configs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.value.id)
        .eq('is_active', true)
      hasActiveAi.value = (count ?? 0) > 0
      persist()
    } catch {
      // On network error keep current state (don't reset to false)
    }
  }

  // Auto-sync: when auth state resolves, fetch from Supabase once.
  // Guard with useState so the watch is registered only once across all component instances.
  const syncWatchRegistered = useState<boolean>('ai-config-sync-watch', () => false)
  if (import.meta.client && !syncWatchRegistered.value) {
    syncWatchRegistered.value = true
    const _user = useSupabaseUser()
    watch(_user, (u) => {
      if (u) syncFromSupabase()
      else {
        hasActiveAi.value = false
        persist()
      }
    })
  }

  /** Mark as active (called after successful save in ai.vue) */
  function markActive() {
    hasActiveAi.value = true
    persist()
  }

  /** Mark as inactive (called when last active config is disabled) */
  function markInactive() {
    hasActiveAi.value = false
    persist()
  }

  /** Legacy helpers — kept for backward compat */
  function isAiConfigured(): boolean {
    if (!import.meta.client) return false
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  }

  function markConfigured() { markActive() }
  function markUnconfigured() { markInactive() }

  return {
    hasActiveAi,
    syncFromSupabase,
    markActive,
    markInactive,
    isAiConfigured,
    markConfigured,
    markUnconfigured,
  }
}
