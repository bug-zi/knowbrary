import { CATEGORIES } from '~/types'
import type { Category } from '~/types'
import type { TavilyResult } from '~/types/fact-check'

export function buildCardPrompt(category: Category, existingCardTitles: string[], topicHint?: { title: string; oneLiner: string }): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''

  const topicHintSection = topicHint
    ? `\n## 指定主题（必须围绕此主题生成）\n- 主题: ${topicHint.title}\n- 简介: ${topicHint.oneLiner}\n\n请专门围绕这个具体方向生成卡片，而不是随机选择话题。主题指令优先于"避免重复"规则。`
    : ''

  return `你是一个知识科普内容创作专家。请为「万象研究所」知识卡片平台生成一张全新的知识卡片。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}
${topicHintSection}
## 已有卡片标题（请勿重复）
${existingCardTitles.length > 0 ? existingCardTitles.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无卡片）'}

## 内容结构规范（必须严格遵循以下六步结构）

### 第1步：开头钩子（Hook）
- 不要直接给定义，先用反直觉问题、日常场景或"你以为…其实…"句式制造兴趣
- 例：为什么你越努力刷短视频，越停不下来？

### 第2步：一句话讲清「它是什么」
- 极度压缩 + 口语化，追求"第一次听懂"而非学术严谨
- 例：多巴胺其实就是一种让你"还想再来一次"的信号。

### 第3步：生活例子建立直觉
- 用大家都经历过的日常场景，让人产生"哦我懂了"的感觉
- 科普最重要的是"让人有感觉"，不是"理解全部逻辑"

### 第4步：小解释（控制深度）
- 只讲"最关键的一层"原理，不展开复杂推导
- 让读者理解"为什么会这样"，但不深陷细节

### 第5步：反常识/误区（记忆点）
- 指出一个大众常见的误解
- 例：不是快乐让你刷视频，而是"期待下一次快乐"让你停不下来。

### 第6步：现实意义收尾
- 告诉读者这和他有什么关系：行为建议、认知升级或生活应用
- 让知识落地，不是飘在空中

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "${category}-xxx（3位数字，从现有最大号+1开始）",
  "slug": "英文短横线slug",
  "title": "中文标题",
  "oneLiner": "用一句话勾起好奇心（不超过50字，要像钩子一样吸引人，不要平铺直叙的定义）",
  "category": "${category}",
  "tags": ["标签1", "标签2", "标签3"],
  "difficulty": "beginner 或 intermediate 或 advanced",
  "cardType": "concept 或 person 或 event 或 experiment 或 principle",
  "content": "Markdown格式，严格按照六步结构撰写。用 ## 作为每步的标题，具体标题如下：\n## 你有没有想过…\n（第1步：钩子，用一个反直觉问题或日常场景开头）\n\n## 一句话说清楚\n（第2步：口语化的一句话解释）\n\n## 生活中的影子\n（第3步：2-3个日常例子，让人产生直觉）\n\n## 背后的小原理\n（第4步：只讲最关键的一层，不深入推导）\n\n## 你可能一直搞错了\n（第5步：指出一个常见误区或反常识点）\n\n## 所以呢？\n（第6步：现实意义，给读者一个行为建议或认知升级）\n\n总字数400-600字，语言风格：像朋友聊天一样，避免学术腔。",
  "keyData": [
    {"label": "数据标签", "value": "数据值", "description": "简短说明"}
  ],
  "references": [
    {"id": 1, "title": "参考书目/资料", "author": "作者"}
  ]
}

要求：
1. 严格遵循六步结构，每步都要有实质内容
2. 语言风格：像朋友聊天，不用学术腔，不用"综上所述""值得注意的是"这类书面语
3. oneLiner 要像钩子——让人想点进来看，不要写成维基百科式的定义
4. content 中的六个 ## 标题必须使用上面指定的固定标题，不要自创标题
5. keyData 提供 2-4 个核心数据点，数据要真实可信
6. references 提供 1-3 个参考来源
7. 避免与已有卡片主题重复`
}

export function buildPathPrompt(category: Category, existingPaths: string[], existingCards: {id: string, title: string, oneLiner: string}[]): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''
  const catColor = catMeta?.color || '#FFB3BA'

  return `你是一个知识学习路径设计专家。请为「万象研究所」知识卡片平台生成一条全新的学习路径（技能树）。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}

## 已有路径标题（请勿重复）
${existingPaths.length > 0 ? existingPaths.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无路径）'}

## 该分类已有知识卡片（优先复用）
${existingCards.length > 0 ? existingCards.map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.title} — ${c.oneLiner}`).join('\n') : '（暂无卡片）'}

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "path-${category}-xxx",
  "slug": "英文短横线slug",
  "title": "中文标题",
  "description": "路径描述（50-100字）",
  "category": "${catName}",
  "categorySlug": "${category}",
  "icon": "lucide图标名称（如 lucide:book-open, lucide:brain, lucide:flask-conical 等）",
  "color": "${catColor}",
  "difficulty": "beginner 或 intermediate 或 advanced",
  "estimatedTime": "预估学习时间（如 30 分钟）",
  "nodes": [
    {
      "id": "n1（从n1开始递增）",
      "cardId": "复用已有卡片时填卡片ID，新建卡片时填 null",
      "cardTitle": "知识概念名称（中文名）",
      "cardOneLiner": "像钩子一样勾起好奇心的短句（不超过50字，不要平铺直叙的定义）",
      "cardType": "concept 或 person 或 event 或 experiment 或 principle",
      "cardDifficulty": "beginner 或 intermediate 或 advanced",
      "cardTags": ["中文标签1", "中文标签2", "中文标签3"],
      "cardContent": "当 cardId 为 null 时必填：Markdown格式，严格按六步科普结构撰写，400-600字。六个固定标题：## 你有没有想过…（钩子）→ ## 一句话说清楚（口语化解释）→ ## 生活中的影子（日常例子）→ ## 背后的小原理（只讲最关键一层）→ ## 你可能一直搞错了（反常识/误区）→ ## 所以呢？（现实意义）。风格：像朋友聊天，不用学术腔。当 cardId 有值时可留空字符串",
      "cardKeyData": [
        {"label": "数据标签", "value": "数据值", "description": "简短说明"}
      ],
      "cardReferences": [
        {"id": 1, "title": "参考书目/资料", "author": "作者"}
      ],
      "type": "required 或 optional 或 bonus",
      "position": {"x": 数字, "y": 数字}
    }
  ],
  "edges": [
    {"from": "n1", "to": "n2", "type": "prerequisite 或 related"}
  ],
  "tags": ["中文标签1", "中文标签2"]
}

要求：
1. 生成 4-8 个节点，形成有层次的知识树
2. 节点 position 要合理分布（x: 50-400, y: 40-400），形成从上到下的树形结构
3. edges 要体现学习先后关系
4. 优先从已有知识卡片中选择合适的卡片复用（将 cardId 设为已有卡片ID），如果某个知识概念没有对应已有卡片则新建（cardId 设为 null）
5. 新建卡片（cardId 为 null）必须提供完整内容：cardContent 至少300字 Markdown，cardKeyData 2-4个核心数据点，cardReferences 1-3个参考来源
6. 所有标签（tags 和 cardTags）必须使用中文，与该领域知识点对齐
7. 确保根节点在顶部，叶子节点在底部
8. 至少 1 个 required 节点，可包含 optional 和 bonus 节点
9. icon 使用 lucide 图标名称，不要使用 emoji`
}

export function buildFactCheckPrompt(claim: string, searchResults: TavilyResult[]): string {
  const formattedResults = searchResults.map((r, i) =>
    `[${i + 1}] ${r.title}\nURL: ${r.url}\n摘要: ${r.content}`
  ).join('\n\n')

  return `你是一个专业的事实核查助手。以下是一个需要验证的说法，以及通过网络搜索获取的相关资料。

## 需要验证的说法
${claim}

## 搜索到的相关资料
${formattedResults}

## 任务
1. 拆解说法中的关键子观点
2. 基于搜索到的资料（必须引用具体来源编号），逐条验证
3. 给出总体判断和置信度
4. sources 中必须使用搜索结果中的真实 URL

## 输出格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "claim": "原始说法",
  "verdict": "reliable 或 unreliable 或 partially-reliable 或 unverifiable",
  "confidence": 0到100的整数,
  "summary": "2-3句话的综合评估",
  "breakdown": [
    {"aspect": "子观点描述", "finding": "验证发现", "verdict": "confirmed 或 refuted 或 inconclusive"}
  ],
  "evidenceFor": [
    {"point": "支持的证据", "strength": "strong 或 moderate 或 weak"}
  ],
  "evidenceAgainst": [
    {"point": "反对的证据", "strength": "strong 或 moderate 或 weak"}
  ],
  "sources": [
    {"title": "来源标题", "url": "搜索结果中的真实URL", "snippet": "关键摘要", "type": "official 或 academic 或 media 或 reference", "reliability": "high 或 medium 或 low"}
  ],
  "keyTakeaways": ["要点1", "要点2"]
}

要求：
1. verdict 只能是 reliable / unreliable / partially-reliable / unverifiable
2. confidence 是 0-100 的整数
3. breakdown 至少包含 2 个子观点分析
4. evidenceFor 和 evidenceAgainst 至少各 1 条
5. sources 至少列出 2 个参考来源，必须使用搜索结果中的真实 URL
6. keyTakeaways 给出 2-4 条核心要点
7. 如果搜索资料不足以判断，verdict 应为 unverifiable，confidence 应低于 30
8. 所有文字使用中文`
}

export function buildDeepDivePrompt(
  category: Category,
  cardTitle: string,
  cardContent: string,
  cardOneLiner: string,
  existingCardTitles: string[]
): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category

  return `你是一个知识科普内容创作专家。用户已经阅读了一篇关于「${cardTitle}」的入门级知识卡片，现在希望深入学习。

## 原始卡片信息
- 标题: ${cardTitle}
- 一句话简介: ${cardOneLiner}
- 原始内容摘要:
${cardContent.slice(0, 800)}${cardContent.length > 800 ? '...' : ''}

## 目标领域
- 分类: ${catName} (${category})

## 已有卡片标题（请勿重复）
${existingCardTitles.length > 0 ? existingCardTitles.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无卡片）'}

## 你的任务
生成一张关于「${cardTitle}」的**深入学习版**知识卡片。要求：
- 假设读者已经理解了基础概念，不要重复入门级内容
- 难度在原卡片基础上提升一级
- 内容字数 800-1200 字（比普通卡片更详细）
- 覆盖更深层次的知识：机制详解、学术视角、边界情况与争议

## 内容结构规范（必须严格遵循以下六步结构）

### 第1步：深入开头（Hook）
- 承接上一张卡片的知识，用"你已经知道了…但你知道更深层的原因吗？"式开头
- 制造新的好奇心缺口

### 第2步：核心机制
- 深入讲解底层原理和运作机制
- 可以涉及学术模型、数学公式（用通俗方式解释）

### 第3步：关键实验或案例
- 提供 1-2 个经典实验、重要研究或真实案例
- 让抽象原理变得具体可感

### 第4步：边界情况与争议
- 这个知识在什么条件下会失效？
- 学术界有哪些不同观点或争论？

### 第5步：与其他知识的关联
- 这个概念如何与其他领域或概念交叉
- 帮助读者建立知识网络

### 第6步：实践意义
- 给出更深入的行为建议或应用场景
- 读完之后读者能做什么原来做不到的事？

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "${category}-xxx（3位数字，从现有最大号+1开始）",
  "slug": "英文短横线slug（与原卡片区分，加-deep后缀）",
  "title": "深入学习：${cardTitle}",
  "oneLiner": "用一句话勾起好奇心（不超过50字，暗示这是更深入的内容）",
  "category": "${category}",
  "tags": ["标签1", "标签2", "标签3"],
  "difficulty": "intermediate 或 advanced（必须比原卡片更难）",
  "cardType": "concept 或 person 或 event 或 experiment 或 principle",
  "content": "Markdown格式，严格按照六步深入结构撰写。用 ## 作为每步的标题，具体标题如下：\n## 你已经知道了…但\n（第1步：承接前知识，制造新的好奇心）\n\n## 背后的真正机制\n（第2步：深入底层原理，可涉及学术模型）\n\n## 关键实验与案例\n（第3步：经典实验或真实案例）\n\n## 什么时候它会失效？\n（第4步：边界情况、争议、不同学派观点）\n\n## 它如何连接更广的世界\n（第5步：跨领域关联，知识网络）\n\n## 读完你能做什么\n（第6步：深入的行为建议或应用）\n\n总字数800-1200字，语言风格：像导师带学生，可以适度使用专业术语但必须解释。",
  "keyData": [
    {"label": "数据标签", "value": "数据值", "description": "简短说明"}
  ],
  "references": [
    {"id": 1, "title": "参考书目/资料", "author": "作者"}
  ]
}

要求：
1. 严格遵循六步深入结构，每步都要有实质内容
2. 不要重复原卡片的入门级内容，假设读者已掌握基础知识
3. 语言可以适度学术化，但关键术语必须给出通俗解释
4. keyData 提供 3-5 个核心数据点，数据要真实可信
5. references 提供 2-4 个参考来源，可以包含论文或专著`
}

export function buildRelatedTopicsPrompt(
  category: Category,
  cardTitle: string,
  cardOneLiner: string,
  cardTags: string[],
  existingCardTitles: string[]
): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category

  return `你是一个知识图谱专家。用户刚刚学习了一张知识卡片，希望拓展到相关的知识方向。

## 当前卡片
- 标题: ${cardTitle}
- 简介: ${cardOneLiner}
- 标签: ${cardTags.join('、')}
- 领域: ${catName} (${category})

## 已有卡片标题（推荐时请避开这些）
${existingCardTitles.length > 0 ? existingCardTitles.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无卡片）'}

## 你的任务
推荐 3 个与当前卡片相关的知识方向。要求：
1. 每个方向必须覆盖**不同的角度或维度**（例如：机制、应用、历史、人物、对比、前沿）
2. 方向之间不能互相重叠
3. 所有方向必须在「${catName}」领域内
4. 避免与已有卡片标题重复或过于相似
5. 每个方向应该是可以独立生成一张知识卡片的具体知识点

## 输出格式
请严格按以下 JSON 数组格式输出，不要包含任何其他文字：

[
  {
    "title": "知识方向标题（5-15字，具体而非泛泛）",
    "oneLiner": "一句话介绍（不超过50字，像钩子一样吸引人，暗示为什么这个方向值得探索）",
    "angle": "简述覆盖角度（如：底层机制、现实应用、历史起源、关键人物、跨领域对比、前沿研究）"
  },
  {
    "title": "第二个知识方向标题",
    "oneLiner": "一句话介绍",
    "angle": "覆盖角度"
  },
  {
    "title": "第三个知识方向标题",
    "oneLiner": "一句话介绍",
    "angle": "覆盖角度"
  }
]

要求：
1. 恰好输出 3 个方向，不要多也不要少
2. title 要具体（"多巴胺与成瘾机制"优于"成瘾"）
3. oneLiner 要有吸引力，让人想进一步了解
4. 三个 angle 必须各不相同`
}
