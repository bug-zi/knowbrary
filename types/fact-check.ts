export interface FactCheckReport {
  claim: string
  verdict: 'reliable' | 'unreliable' | 'partially-reliable' | 'unverifiable'
  confidence: number
  summary: string
  breakdown: ClaimBreakdown[]
  evidenceFor: Evidence[]
  evidenceAgainst: Evidence[]
  sources: FactCheckSource[]
  keyTakeaways: string[]
  checkedAt: string
}

export interface ClaimBreakdown {
  aspect: string
  finding: string
  verdict: 'confirmed' | 'refuted' | 'inconclusive'
}

export interface Evidence {
  point: string
  strength: 'strong' | 'moderate' | 'weak'
}

export interface FactCheckSource {
  title: string
  url: string
  snippet: string
  type: 'official' | 'academic' | 'media' | 'reference'
  reliability: 'high' | 'medium' | 'low'
}

export interface FactCheckRecord {
  id: string
  claim: string
  verdict: FactCheckReport['verdict']
  confidence: number
  summary: string
  report: FactCheckReport
  search_results?: TavilyResult[]
  created_at: string
}

export interface TavilyResult {
  title: string
  url: string
  content: string
  score: number
}
