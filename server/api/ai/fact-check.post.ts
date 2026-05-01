import type { AIProvider } from '~/types'
import { buildFactCheckPrompt } from '~/utils/ai-prompts'
import type { TavilyResult, FactCheckReport } from '~/types/fact-check'

const PROVIDER_URLS: Record<AIProvider, string> = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  doubao: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { provider, apiKey, model, claim } = body as {
    provider: AIProvider
    apiKey: string
    model: string
    claim: string
  }

  if (!provider || !apiKey || !model || !claim) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const aiUrl = PROVIDER_URLS[provider]
  if (!aiUrl) {
    throw createError({ statusCode: 400, statusMessage: `Invalid provider: ${provider}` })
  }

  // Step 1: Web search via Tavily
  const config = useRuntimeConfig()
  const tavilyKey = config.tavilyApiKey

  let searchResults: TavilyResult[] = []
  if (tavilyKey) {
    try {
      const tavilyResp = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: claim,
          search_depth: 'advanced',
          include_answer: true,
          max_results: 8,
        }),
      })

      if (tavilyResp.ok) {
        const tavilyData = await tavilyResp.json()
        searchResults = (tavilyData.results || []).map((r: any) => ({
          title: r.title || '',
          url: r.url || '',
          content: r.content || '',
          score: r.score || 0,
        }))
      }
    } catch {
      // Search failure is non-fatal; continue with empty results
    }
  }

  // Step 2: AI analysis
  const prompt = buildFactCheckPrompt(claim, searchResults)

  const resp = await fetch(aiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是一个专业的事实核查助手。请严格按照要求的JSON格式输出，不要包含markdown代码块标记。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw createError({ statusCode: resp.status, statusMessage: `${provider} API error: ${err}` })
  }

  const data = await resp.json()
  const result: string = data.choices[0].message.content

  // Extract JSON from response
  let jsonStr = result
  const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  }

  let report: FactCheckReport
  try {
    report = JSON.parse(jsonStr)
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'AI returned invalid JSON', data: { raw: result } })
  }

  // Ensure checkedAt is set
  report.checkedAt = new Date().toISOString()
  report.claim = claim

  return { report, searchResults }
})
