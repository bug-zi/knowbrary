import type { AIProvider } from '~/types'
import { buildResearchPanoramicPrompt } from '~/utils/ai-prompts'

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
  const { provider, apiKey, model, topic, description, roadmap, notes } = body as {
    provider: AIProvider
    apiKey: string
    model: string
    topic: string
    description: string
    roadmap: { items: { title: string; isRead: boolean; userNote: string }[] }
    notes: { type: string; content: string; aiResponse: string | null }[]
  }

  if (!provider || !apiKey || !model || !topic) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const url = PROVIDER_URLS[provider]
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: `Invalid provider: ${provider}` })
  }

  const prompt = buildResearchPanoramicPrompt(topic, description, roadmap || { items: [] }, notes || [])

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
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
    const analysis = parseJsonResponse(content)
    return { analysis }
  }
  catch {
    throw createError({ statusCode: 500, statusMessage: 'Failed to parse AI response as JSON' })
  }
})
