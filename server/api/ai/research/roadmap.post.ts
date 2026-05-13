import type { AIProvider } from '~/types'
import { buildResearchRoadmapPrompt } from '~/utils/ai-prompts'
import type { TavilyResult } from '~/types/fact-check'

const PROVIDER_URLS: Record<AIProvider, string> = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  doubao: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
}

function parseJsonResponse(text: string): any {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(cleaned)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { provider, apiKey, model, topic, description } = body as {
    provider: AIProvider
    apiKey: string
    model: string
    topic: string
    description: string
  }

  if (!provider || !apiKey || !model || !topic) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const url = PROVIDER_URLS[provider]
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: `Invalid provider: ${provider}` })
  }

  // Tavily search
  const config = useRuntimeConfig()
  const tavilyKey = config.tavilyApiKey

  let searchResults: TavilyResult[] = []
  let searchPerformed = false
  let searchError = ''

  if (tavilyKey) {
    try {
      const tavilyResp = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${topic} 核心概念 关键人物 重要论文`,
          search_depth: 'advanced',
          include_answer: true,
          max_results: 10,
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
        searchPerformed = true
      }
      else {
        searchError = 'Search API returned error'
      }
    }
    catch {
      searchError = 'Search request failed'
    }
  }

  const prompt = buildResearchRoadmapPrompt(topic, description, searchResults)

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 4000,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw createError({ statusCode: resp.status, statusMessage: `${provider} API error: ${err}` })
  }

  const data = await resp.json()
  const content: string = data.choices[0].message.content

  try {
    const roadmap = parseJsonResponse(content)
    return { roadmap, searchPerformed, searchError }
  }
  catch {
    throw createError({ statusCode: 500, statusMessage: 'Failed to parse AI response as JSON' })
  }
})
