import { useSupabaseUser } from '~/utils/supabase'

export function useMigration() {
  const client = useSupabase()
  const user = useSupabaseUser()

  function hasLocalData(): boolean {
    if (!import.meta.client) return false
    const keys = ['wanxiang-learned', 'wanxiang-favorites', 'wanxiang-learned-dates', 'wanxiang-quiz-results']
    return keys.some(k => !!localStorage.getItem(k))
  }

  async function migrateLocalData(): Promise<{ migrated: number; error?: string }> {
    if (!import.meta.client || !user.value) return { migrated: 0, error: 'Not logged in' }

    const userId = user.value.id
    let count = 0

    // 1. Migrate learned cards -> user_progress
    const learnedRaw = localStorage.getItem('wanxiang-learned')
    const datesRaw = localStorage.getItem('wanxiang-learned-dates')
    if (learnedRaw) {
      try {
        const learnedIds: string[] = JSON.parse(learnedRaw)
        const dates: Record<string, string> = datesRaw ? JSON.parse(datesRaw) : {}
        const rows = learnedIds.map(cardId => ({
          user_id: userId,
          card_id: cardId,
          learned_at: dates[cardId] || new Date().toISOString(),
        }))
        const { error } = await client.from('user_progress').upsert(rows, { onConflict: 'user_id,card_id' })
        if (!error) count += rows.length
      } catch { /* skip malformed data */ }
    }

    // 2. Migrate favorites -> favorites
    const favsRaw = localStorage.getItem('wanxiang-favorites')
    if (favsRaw) {
      try {
        const favIds: string[] = JSON.parse(favsRaw)
        const rows = favIds.map(cardId => ({ user_id: userId, card_id: cardId }))
        const { error } = await client.from('favorites').upsert(rows, { onConflict: 'user_id,card_id' })
        if (!error) count += rows.length
      } catch { /* skip malformed data */ }
    }

    // 3. Clear localStorage keys after successful migration
    if (count > 0) {
      ['wanxiang-learned', 'wanxiang-favorites', 'wanxiang-learned-dates', 'wanxiang-quiz-results', 'wanxiang-progress']
        .forEach(k => localStorage.removeItem(k))
    }

    return { migrated: count }
  }

  return { hasLocalData, migrateLocalData }
}
