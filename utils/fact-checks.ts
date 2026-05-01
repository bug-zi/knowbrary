import type { FactCheckRecord, FactCheckReport } from '~/types/fact-check'

const STORAGE_KEY = 'wanxiang-factchecks'

export function getLocalHistory(): FactCheckReport[] {
  if (import.meta.server) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalReport(report: FactCheckReport): void {
  if (import.meta.server) return
  const history = getLocalHistory()
  history.unshift(report)
  if (history.length > 20) history.length = 20
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export async function fetchHistoryFromSupabase(limit = 20): Promise<FactCheckRecord[]> {
  try {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('fact_checks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return (data || []) as FactCheckRecord[]
  } catch {
    return []
  }
}

export async function saveReportToSupabase(report: FactCheckReport): Promise<boolean> {
  try {
    const supabase = useSupabase()
    const { error } = await supabase.from('fact_checks').insert({
      claim: report.claim,
      verdict: report.verdict,
      confidence: report.confidence,
      summary: report.summary,
      report,
    })
    return !error
  } catch {
    return false
  }
}
