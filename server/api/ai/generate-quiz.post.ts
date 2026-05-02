import type { AIProvider } from '~/types'
import { buildQuizPrompt } from '~/utils/ai-prompts'

const PROVIDER_URLS: Record<AIProvider, string> = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  doubao: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { provider, apiKey, model, cards, difficulty } = body as {
    provider: AIProvider
    apiKey: string
    model: string
    cards: { id: string; title: string; content: string; category: string; oneLiner: string }[]
    difficulty: string
  }

  if (!provider || !apiKey || !model || !cards?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const url = PROVIDER_URLS[provider]
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: `Invalid provider: ${provider}` })
  }

  const prompt = buildQuizPrompt(cards, difficulty || 'beginner')

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是一个知识测验出题专家。请严格按照要求的JSON格式输出，不要包含markdown代码块标记。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw createError({ statusCode: resp.status, statusMessage: `${provider} API error: ${err}` })
  }

  const data = await resp.json()
  const result: string = data.choices[0].message.content

  let jsonStr = result
  const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  }

  let quiz
  try {
    quiz = JSON.parse(jsonStr)
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'AI returned invalid JSON', data: { raw: result } })
  }

  // Inject card IDs into relatedCards if AI didn't fill them
  if (!quiz.relatedCards?.length) {
    quiz.relatedCards = cards.map(c => c.id)
  }

  return { quiz, raw: result }
})
