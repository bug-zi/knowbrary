import type { AIProvider } from '~/types'
import { buildPathPrompt } from '~/utils/ai-prompts'
import type { Category } from '~/types'

const PROVIDER_URLS: Record<AIProvider, string> = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  doubao: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { provider, apiKey, model, category, existingPaths } = body as {
    provider: AIProvider
    apiKey: string
    model: string
    category: Category
    existingPaths: string[]
  }

  if (!provider || !apiKey || !model || !category) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const url = PROVIDER_URLS[provider]
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: `Invalid provider: ${provider}` })
  }

  const prompt = buildPathPrompt(category, existingPaths || [])

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是一个知识学习路径设计专家。请严格按照要求的JSON格式输出，不要包含markdown代码块标记。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 4000,
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

  let path
  try {
    path = JSON.parse(jsonStr)
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'AI returned invalid JSON', data: { raw: result } })
  }

  return { path, raw: result }
})
