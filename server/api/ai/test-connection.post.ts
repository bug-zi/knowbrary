import type { AIProvider } from '~/types'

const PROVIDER_URLS: Record<AIProvider, string> = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  doubao: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
}

export default defineEventHandler(async (event) => {
  const { provider, apiKey, model } = await readBody(event) as {
    provider: AIProvider
    apiKey: string
    model: string
  }

  if (!provider || !apiKey || !model) {
    throw createError({ statusCode: 400, statusMessage: '缺少参数' })
  }

  const url = PROVIDER_URLS[provider]
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: `不支持的 provider: ${provider}` })
  }

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: '你好，请回复"连接成功"' }],
        max_tokens: 10,
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      throw createError({ statusCode: resp.status, statusMessage: `连接失败: ${errText.slice(0, 200)}` })
    }

    const data = await resp.json()
    const reply = data.choices?.[0]?.message?.content || ''

    return { success: true, reply }
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: `网络错误: ${err.message}` })
  }
})
