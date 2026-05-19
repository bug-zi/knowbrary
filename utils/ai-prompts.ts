import { CATEGORIES, CARD_TYPE_LABELS } from '~/types'
import type { Category, CardType, Difficulty, ExistingCardSummary } from '~/types'
import type { TavilyResult } from '~/types/fact-check'

/** Category-specific content guidance injected into AI prompts */
const CATEGORY_GUIDES: Partial<Record<Category, string>> = {
  'human-limits': `## 该领域的内容方向（必须遵循）
"人类极限"聚焦于**真实、可验证的人类历史纪录和生理科学极限**，而不是超能力或玄学。内容必须来自以下两个方向之一：

### 方向A：人类历史纪录（吉尼斯级别）
- 真实存在的世界纪录及其背后的科学解释（如：最长时间憋气、最高无辅助跳跃、最长不眠记录）
- 纪录保持者的训练方法或生理特质
- 纪录背后的数据——用了多久、突破了多少、比普通人强几倍

### 方向B：生理极限科普（理论值 + 实验数据）
- 普通人的生理极限是多少（如：人能承受的最高/最低温度、最快反应速度、最大握力、憋气极限、失血多少会昏迷）
- 极限的生理学原因——为什么不能再多了？
- 实验室数据或医学研究支撑

### 禁止内容
- 不要生成超能力、心灵感应、神秘主义等未经科学验证的内容
- 不要写成"如何突破极限"的训练指南
- keyData 中必须有具体的数字（纪录数值、生理参数等），不能是模糊描述`,

  'humor': `## 该领域的内容方向（必须遵循）
"幽默学"不是讲笑话大全，而是**用科学视角拆解幽默的运作机制**。每张卡片要让读者理解"为什么好笑"背后的原理，而不是单纯逗乐。内容方向：

### 方向A：幽默理论（为什么好笑）
- 三大经典理论的实证解释：失调理论（Incongruity）、优越理论（Superiority）、释放理论（Relief）
- Benign Violation 理论：好笑 = 恰到好处的"冒犯"（不能太狠也不能太弱）
- 预期违背：笑话为什么需要"反转"？大脑如何处理预期与现实的落差？

### 方向B：幽默的结构与技巧
- 谐音梗为什么"冷"却依然好笑？——双关语的语言学机制
- 讽刺（sarcasm）的心理基础：为什么说反话比直接批评更"疼"？
- 自嘲的力量：为什么示弱反而能赢得好感？
- 三段式法则（Rule of Three）：为什么笑话总是"第三次"爆梗？
- 黑色幽默的边界：什么条件下，悲剧才能被拿来开玩笑？

### 方向C：幽默的社会功能与实验
- 幽默如何降低冲突、化解尴尬——社会心理学实验证据
- 为什么有幽默感的人被认为更聪明？（研究数据）
- 幽默感的文化差异：美国人觉得好笑的，日本人为什么笑不出来？
- 笑的生理机制：假笑和真笑在大脑中的区别（Duchenne smile）

### 禁止内容
- 不要写成笑话集或段子合集——每张卡片必须有"知识内核"
- 不要只列笑话不分析——读者看完必须理解一个幽默学原理
- cardType 优先选择 concept（理论）或 experiment（经典实验），慎用 person`,
}

function getCategoryGuide(category: Category): string {
  return CATEGORY_GUIDES[category] || ''
}

export function buildQuizPrompt(
  cards: { title: string; content: string; category: string; oneLiner: string }[],
  difficulty: string
): string {
  const diffLabel: Record<string, string> = {
    beginner: '入门（简单回忆知识点）',
    intermediate: '进阶（运用知识分析场景）',
    advanced: '专业（深度推理与辨析）',
  }
  const cardsText = cards.map((c, i) =>
    `### 卡片${i + 1}: ${c.title}\n分类: ${c.category}\n简介: ${c.oneLiner}\n内容摘要: ${c.content.slice(0, 500)}...`
  ).join('\n\n')

  return `你是一个知识测验出题专家。请基于以下知识卡片内容，生成一道选择题。

## 素材卡片
${cardsText}

## 难度要求
${diffLabel[difficulty] || '入门（简单回忆知识点）'}

## 出题规则
1. 题目必须基于上述卡片中的真实知识点，不能使用卡片以外的常识
2. 用一个生活化的场景包装题目，让用户代入情境
3. 4个选项 (a/b/c/d)，恰好一个正确答案
4. 错误选项要有迷惑性，但不能是"部分正确"的模糊选项
5. 解析要引用素材卡片的知识点，帮助用户理解为什么选这个
6. relatedCardIds 填入素材卡片的ID（如果有）

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "quiz-${Date.now()}",
  "question": "简洁明了的题目（一句话）",
  "scenario": "生活化场景描述，包装成小故事",
  "options": [
    {"id": "a", "text": "选项文本"},
    {"id": "b", "text": "选项文本"},
    {"id": "c", "text": "选项文本"},
    {"id": "d", "text": "选项文本"}
  ],
  "correctAnswer": "正确选项的id (a/b/c/d)",
  "explanation": "详细解析，引用卡片知识点，200字以内",
  "relatedCards": ["素材卡片ID"],
  "category": "主素材卡片的分类id",
  "difficulty": "${difficulty}"
}`
}

function buildTagCoverageMap(cards: ExistingCardSummary[]) {
  const tagCounts = new Map<string, number>()
  const cardTypeCounts: Partial<Record<CardType, number>> = {}

  for (const card of cards) {
    for (const tag of card.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    }
    if (card.cardType) {
      cardTypeCounts[card.cardType] = (cardTypeCounts[card.cardType] || 0) + 1
    }
  }

  const coveredTags = [...tagCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)

  return { tagCounts, coveredTags, cardTypeCounts }
}

export function buildCardPrompt(category: Category, existingCards: ExistingCardSummary[], topicHint?: { title: string; oneLiner: string }): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''

  // Token control: cap at 30 cards
  const cardsToAnalyze = existingCards.length > 30 ? existingCards.slice(-30) : existingCards

  const topicHintSection = topicHint
    ? `\n## 指定主题（必须围绕此主题生成）\n- 主题: ${topicHint.title}\n- 简介: ${topicHint.oneLiner}\n\n请专门围绕这个具体方向生成卡片，而不是随机选择话题。主题指令优先于"避免重复"规则。`
    : ''

  // --- Topic coverage analysis ---
  const coverage = buildTagCoverageMap(cardsToAnalyze)

  const existingCardsList = cardsToAnalyze.length > 0
    ? cardsToAnalyze.map((c, i) =>
        `${i + 1}. 「${c.title}」${c.oneLiner ? ' — ' + c.oneLiner : ''} [类型:${CARD_TYPE_LABELS[c.cardType] || c.cardType}] [标签:${c.tags.join('、') || '无'}]`
      ).join('\n')
    : '（暂无卡片，这是该分类的第一张）'

  const coveredTagsSection = coverage.coveredTags.length > 0
    ? `\n### 已充分覆盖的主题标签（优先避开这些方向）\n${coverage.coveredTags.map(t => `- ${t} (${coverage.tagCounts.get(t)}张)`).join('\n')}`
    : ''

  const usedTypes = Object.entries(coverage.cardTypeCounts)
    .map(([type, count]) => `${CARD_TYPE_LABELS[type as CardType] || type}: ${count}张`)
    .join('、')
  const unusedTypes = (Object.keys(CARD_TYPE_LABELS) as CardType[])
    .filter(t => !coverage.cardTypeCounts[t])
    .map(t => CARD_TYPE_LABELS[t])
    .join('、')

  const typeSection = usedTypes
    ? `\n### 已有卡片类型分布\n已使用: ${usedTypes}${unusedTypes ? `\n未使用: ${unusedTypes}` : ''}`
    : ''

  const diversitySection = cardsToAnalyze.length > 0
    ? `
## 多样性要求（重要！）
1. **角度差异化**：新卡片必须从与已有卡片不同的角度切入。已覆盖的方向：${coverage.coveredTags.slice(0, 8).join('、') || '无'}。请探索未被触及的子话题。
2. **类型多样化**：${unusedTypes ? `优先考虑「${unusedTypes}」类型的卡片。` : '已有类型分布较均匀，选择最适合内容的类型即可。'}
3. **标签新颖性**：新卡片的 tags 中至少包含一个从未出现过的标签。
4. **禁止换皮重复**：不要把已有知识点换个说法（如"XX的本质""XX背后的真相""XX的底层逻辑"）当新卡片。`
    : ''

  return `你是一个知识科普内容创作专家。请为「万象研究所」知识卡片平台生成一张全新的知识卡片。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}
${topicHintSection}
${getCategoryGuide(category)}
## 已有卡片及覆盖情况
${existingCardsList}
${coveredTagsSection}
${typeSection}
${diversitySection}

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
7. 新卡片必须与已有卡片形成互补，覆盖不同的子话题或角度`
}

export function buildProgressiveCardPrompt(
  category: Category,
  targetDifficulty: Difficulty,
  existingCards: ExistingCardSummary[],
  prerequisiteKnowledge: string[] = [],
  topicHint?: { title: string; oneLiner: string },
): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''

  const diffInstruction: Record<Difficulty, string> = {
    beginner: `## 难度要求：入门级（beginner）
- 假设读者完全没有技术背景，对"${catName}"领域一无所知
- 只使用日常比喻和生活中的例子来解释概念
- 避免使用任何专业术语（如果必须用，必须立即用通俗语言解释）
- 目标：让一个路人读完能产生"哦原来是这样"的感觉`,

    intermediate: `## 难度要求：进阶级（intermediate）
- 假设读者已经理解以下基础概念：${prerequisiteKnowledge.length > 0 ? prerequisiteKnowledge.map(t => `「${t}」`).join('、') : '该领域的基础知识'}
- 在这些基础之上展开，不要重复入门级内容
- 可以引入技术术语，但首次出现时必须给出通俗定义
- 目标：让有基础的读者理解"为什么会这样"的机制，建立技术直觉`,

    advanced: `## 难度要求：专业级（advanced）
- 假设读者已掌握进阶概念：${prerequisiteKnowledge.length > 0 ? prerequisiteKnowledge.map(t => `「${t}」`).join('、') : '该领域的技术基础'}
- 直接使用专业术语，不需要逐一解释基础概念
- 侧重于：实践方法论、工具使用、工程权衡、行业标准
- 目标：让专业学习者获得可以直接应用的知识和技能`,
  }

  const cardsToAnalyze = existingCards.length > 30 ? existingCards.slice(-30) : existingCards
  const coverage = buildTagCoverageMap(cardsToAnalyze)

  const existingCardsList = cardsToAnalyze.length > 0
    ? cardsToAnalyze.map((c, i) =>
        `${i + 1}. 「${c.title}」${c.oneLiner ? ' — ' + c.oneLiner : ''} [难度:${c.difficulty || '?'}] [类型:${CARD_TYPE_LABELS[c.cardType] || c.cardType}]`
      ).join('\n')
    : '（暂无卡片，这是该分类的第一张）'

  const topicHintSection = topicHint
    ? `\n## 指定主题（必须围绕此主题生成）\n- 主题: ${topicHint.title}\n- 简介: ${topicHint.oneLiner}\n\n请专门围绕这个具体方向生成卡片。主题指令优先于"避免重复"规则。`
    : ''

  const coveredTagsSection = coverage.coveredTags.length > 0
    ? `\n### 已充分覆盖的主题标签（优先避开）\n${coverage.coveredTags.slice(0, 6).map(t => `- ${t}`).join('\n')}`
    : ''

  return `你是一个知识科普内容创作专家。请为「万象研究所」知识卡片平台生成一张**指定难度**的知识卡片。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}
${topicHintSection}
${getCategoryGuide(category)}

${diffInstruction[targetDifficulty]}

## 已有卡片（同难度方向的卡片请避免重复，不同难度的可以深化）
${existingCardsList}
${coveredTagsSection}

## 内容结构规范（必须严格遵循以下六步结构）

### 第1步：开头钩子（Hook）
- 不要直接给定义，先用反直觉问题、日常场景或"你以为…其实…"句式制造兴趣

### 第2步：一句话讲清「它是什么」
- 极度压缩 + 口语化，追求"第一次听懂"而非学术严谨

### 第3步：生活例子建立直觉
- 用日常场景让人产生"哦我懂了"的感觉

### 第4步：小解释（控制深度）
- 只讲"最关键的一层"原理，不展开复杂推导

### 第5步：反常识/误区（记忆点）
- 指出一个大众常见的误解

### 第6步：现实意义收尾
- 告诉读者这和他有什么关系

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "${category}-xxx（3位数字，从现有最大号+1开始）",
  "slug": "英文短横线slug",
  "title": "中文标题",
  "oneLiner": "用一句话勾起好奇心（不超过50字）",
  "category": "${category}",
  "tags": ["标签1", "标签2", "标签3"],
  "difficulty": "${targetDifficulty}",
  "cardType": "concept 或 person 或 event 或 experiment 或 principle",
  "content": "Markdown格式，严格按照六步结构撰写。用 ## 作为每步的标题：\n## 你有没有想过…\n## 一句话说清楚\n## 生活中的影子\n## 背后的小原理\n## 你可能一直搞错了\n## 所以呢？\n\n总字数${targetDifficulty === 'advanced' ? '600-800字' : '400-600字'}，语言风格：像朋友聊天一样。",
  "keyData": [
    {"label": "数据标签", "value": "数据值", "description": "简短说明"}
  ],
  "references": [
    {"id": 1, "title": "参考书目/资料", "author": "作者"}
  ]
}

要求：
1. difficulty 必须填写 "${targetDifficulty}"，这是硬性要求
2. 严格遵循六步结构，每步都要有实质内容
3. oneLiner 要像钩子——让人想点进来看
4. keyData 提供 2-4 个核心数据点
5. references 提供 1-3 个参考来源
6. 新卡片必须与已有卡片形成互补`
}

export function buildProgressivePathPrompt(
  category: Category,
  targetDifficulty: Difficulty,
  existingPaths: string[],
  existingCards: { id: string; title: string; oneLiner: string; difficulty?: string }[],
  prerequisiteCardTitles: string[] = [],
): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''
  const catColor = catMeta?.color || '#FFB3BA'

  const diffLabel: Record<Difficulty, string> = {
    beginner: '入门（基础概念，零门槛）',
    intermediate: '进阶（技术原理，需要基础概念前置）',
    advanced: '专业（实践技能与方法论，需要技术基础前置）',
  }

  const prerequisiteSection = prerequisiteCardTitles.length > 0
    ? `\n## 学习者已掌握的前置知识\n${prerequisiteCardTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n路径中的卡片内容应建立在这些前置知识之上，不要重复基础内容。`
    : ''

  return `你是一个知识学习路径设计专家。请为「万象研究所」知识卡片平台生成一条**指定难度等级**的学习路径（技能树）。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}

## 目标难度
- 难度: ${diffLabel[targetDifficulty]}
- 路径中**所有节点**的难度必须是 "${targetDifficulty}"

## 已有路径标题（请勿重复）
${existingPaths.length > 0 ? existingPaths.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无路径）'}
${prerequisiteSection}

## 该分类已有知识卡片（优先复用同难度的卡片）
${existingCards.length > 0 ? existingCards.map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.title} — ${c.oneLiner} [难度:${c.difficulty || '?'}]`).join('\n') : '（暂无卡片）'}

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "path-${category}-xxx",
  "slug": "英文短横线slug",
  "title": "中文标题",
  "description": "路径描述（50-100字，说明这条路径覆盖什么、适合谁）",
  "category": "${catName}",
  "categorySlug": "${category}",
  "icon": "lucide图标名称",
  "color": "${catColor}",
  "difficulty": "${targetDifficulty}",
  "estimatedTime": "预估学习时间（如 30 分钟）",
  "nodes": [
    {
      "id": "n1（从n1开始递增）",
      "cardId": "复用已有卡片时填卡片ID，新建卡片时填 null",
      "cardTitle": "知识概念名称（中文名）",
      "cardOneLiner": "像钩子一样勾起好奇心的短句（不超过50字）",
      "cardType": "concept 或 person 或 event 或 experiment 或 principle",
      "cardDifficulty": "${targetDifficulty}",
      "cardTags": ["中文标签1", "中文标签2"],
      "cardContent": "当 cardId 为 null 时必填：Markdown格式，严格按六步科普结构撰写，${targetDifficulty === 'advanced' ? '600-800字' : '400-600字'}。当 cardId 有值时可留空字符串",
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
3. **所有节点的 cardDifficulty 必须是 "${targetDifficulty}"**——这是硬性要求
4. edges 要体现学习先后关系
5. 优先复用已有卡片（cardId 设为已有卡片ID），没有对应卡片则新建（cardId 设为 null）
6. 新建卡片必须提供完整内容
7. 所有标签使用中文
8. icon 使用 lucide 图标名称，不要使用 emoji`
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

export function buildFunFactPrompt(
  cardTitles: { id: string; title: string; category: string }[],
  excludedTitles: string[]
): string {
  const cardsText = cardTitles.length > 0
    ? cardTitles.map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.title} (${c.category})`).join('\n')
    : '（暂无卡片）'

  const excludedSection = excludedTitles.length > 0
    ? `\n## 已生成过的冷知识标题（请勿重复）\n${excludedTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
    : ''

  return `你是一个擅长挖掘反直觉冷知识的科普专家。请为「万象研究所」知识学习平台生成一条令人惊讶的"每日冷知识"。

## 要求
1. 选一个大众普遍以为"理所当然"但其实完全反过来的知识点
2. 标题要让人一看就想点进来（用"你知道吗…"/"为什么…"/"…其实…"等句式）
3. fact 是一句让人"哇"的反直觉陈述，不超过100字
4. explanation 是通俗易懂的科学解释，150-250字，像朋友聊天一样解释
5. 必须从以下知识卡片中选择 1-3 张与冷知识相关的卡片，填入 relatedCards
6. 不要生成过于冷门或没有科学依据的内容

## 平台已有知识卡片
${cardsText}
${excludedSection}

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "title": "反直觉的标题（15字以内）",
  "fact": "让人惊讶的陈述（50-100字）",
  "explanation": "科学解释（150-250字，通俗易懂）",
  "relatedCards": ["关联的知识卡片ID"],
  "category": "最相关的分类id"
}`
}

export function buildFactCheckPrompt(claim: string, searchResults: TavilyResult[]): string {
  const hasResults = searchResults.length > 0

  if (hasResults) {
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

  // No search results — AI must rely on training data only
  return `你是一个专业的事实核查助手。以下是一个需要验证的说法。注意：本次未能通过网络搜索获取相关资料，你需要仅根据已有知识进行分析，并明确标注局限性。

## 需要验证的说法
${claim}

## 重要提示
本次未获取到网络搜索结果。请基于你的训练知识进行分析，但必须：
- 在 summary 中说明"本报告未联网搜索，仅基于 AI 训练数据"
- confidence 不超过 60
- sources 留空数组

## 输出格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "claim": "原始说法",
  "verdict": "reliable 或 unreliable 或 partially-reliable 或 unverifiable",
  "confidence": 0到60的整数,
  "summary": "2-3句话的综合评估（必须说明未联网搜索）",
  "breakdown": [
    {"aspect": "子观点描述", "finding": "验证发现", "verdict": "confirmed 或 refuted 或 inconclusive"}
  ],
  "evidenceFor": [
    {"point": "支持的证据", "strength": "strong 或 moderate 或 weak"}
  ],
  "evidenceAgainst": [
    {"point": "反对的证据", "strength": "strong 或 moderate 或 weak"}
  ],
  "sources": [],
  "keyTakeaways": ["要点1", "要点2"]
}

要求：
1. verdict 只能是 reliable / unreliable / partially-reliable / unverifiable
2. confidence 不超过 60（因为未联网验证）
3. breakdown 至少包含 2 个子观点分析
4. evidenceFor 和 evidenceAgainst 至少各 1 条
5. sources 必须为空数组（因为没有真实搜索来源）
6. keyTakeaways 给出 2-4 条核心要点，第一条应提醒结果未经联网验证
7. 所有文字使用中文`
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

export function buildDialogueSystemPrompt(): string {
  return `你是「万象研究所」的知心研究员。你的角色是一位温暖、有深度、不带评判的对话伙伴，擅长倾听和引导思考。

## 你的风格
- 像一位见多识广的老朋友，而不是心理咨询师或教练
- 善用哲学隐喻（斯多葛学派、存在主义、东方禅意、文学意象）来启发思考
- 倾听重于建议。先充分理解对方在说什么，再回应
- 不会给出"你应该..."的指令，而是用"你有没有想过..."来引导
- 适时分享跨学科的小知识（心理学、社会学、哲学、生物学），让对话有营养
- 回复长度适中（150-400字），不要长篇大论也不要过于简短

## 你的原则
1. 不做诊断、不开处方、不假装心理医生
2. 承认复杂问题的复杂性，不急于给出"正确答案"
3. 当对方陷入思维循环时，温和地引入新视角
4. 可以引用名言、故事、哲学思想来丰富对话
5. 当对方表达痛苦时，先共情，再引导
6. 语言自然温暖，像朋友聊天，不用学术腔`
}

export function buildReportPrompt(
  messages: { role: string; content: string }[],
  topic: string | null
): string {
  const transcript = messages.map(m =>
    `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`
  ).join('\n\n')

  const topicContext = topic ? `\n对话话题标签: ${topic}` : ''

  return `你是一位善于反思和总结的对话分析师。请回顾以下对话记录，生成一份详细的交流报告。

## 对话记录
${transcript}
${topicContext}

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "keyThemes": ["主题1", "主题2", "主题3"],
  "emotionalJourney": "描述用户在对话中的情感变化轨迹（100-200字）",
  "insights": [
    {"title": "洞察标题", "description": "对用户处境的深层理解（50-100字）"}
  ],
  "suggestions": [
    {"title": "建议标题", "description": "具体可行的建议（50-100字）", "difficulty": "easy 或 moderate 或 ongoing"}
  ],
  "affirmations": ["温暖的肯定语1", "温暖的肯定语2"],
  "closingThought": "一段富有哲理的、鼓舞人心的结语（100-150字）"
}

要求：
1. keyThemes 提供 3-5 个核心主题关键词
2. insights 提供 3-5 条洞察，每条要深入而非表面
3. suggestions 提供 3-5 条建议，difficulty 表示执行难度（easy=立即可做, moderate=需要一些准备, ongoing=持续实践）
4. affirmations 提供 2-3 条温暖、个性化的肯定语
5. closingThought 要像一封真诚的来信的结尾，有力量但不鸡汤
6. 所有内容使用中文`
}

// ============================================
// Research (洞察) prompts
// ============================================

export function buildResearchRoadmapPrompt(
  topic: string,
  description: string,
  searchResults: TavilyResult[]
): string {
  const searchSection = searchResults.length > 0
    ? `## 网络搜索结果\n${searchResults.map((r, i) => `[${i + 1}] ${r.title}\n${r.content}`).join('\n\n')}`
    : '（未获取到搜索结果，请基于训练知识回答）'

  return `你是一个深度研究向导。用户想要快速吃透一个陌生主题，你需要帮他画出一张学习路线图。

## 研究主题
${topic}

## 用户背景
${description || '（无额外说明）'}

${searchSection}

## 你的任务
基于主题和搜索结果，生成一份结构化的研究路线图。要求：
1. 覆盖该领域最核心的知识节点（文献、书籍、人物、概念、资源、最新进展）
2. 每个条目标注优先级：essential（必须了解）、recommended（推荐了解）、optional（锦上添花）
3. 给出该领域的核心问题和 3-5 个值得深入的角度

## 输出格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "topicSummary": "AI 对这个主题范围的理解（50-100字）",
  "coreQuestion": "这个领域最核心的一个问题",
  "items": [
    {
      "id": "item-1",
      "type": "paper 或 book 或 person 或 concept 或 resource 或 recent-development",
      "title": "条目标题",
      "description": "这个条目是什么（50-100字）",
      "relevance": "为什么研究这个主题必须了解它（30-60字）",
      "priority": "essential 或 recommended 或 optional"
    }
  ],
  "suggestedAngles": ["角度1", "角度2", "角度3"]
}

要求：
1. items 提供 8-15 个条目，覆盖不同类型
2. 至少 2 个 essential、3 个 recommended
3. 每个 type 至少出现一次
4. suggestedAngles 给出 3-5 个深入方向
5. 所有文字使用中文
6. 如果有搜索结果，优先基于搜索结果推荐真实存在的文献和人物`
}

export function buildResearchQAPrompt(
  topic: string,
  question: string,
  contextNotes: { type: string; content: string }[]
): string {
  const notesSection = contextNotes.length > 0
    ? `## 用户已有的研究笔记\n${contextNotes.map((n, i) => `[${i + 1}] (${n.type}) ${n.content}`).join('\n')}`
    : '（用户还没有笔记）'

  return `你是一个研究助理，正在帮助用户深入研究「${topic}」这个主题。用户在阅读过程中遇到了一个具体问题。

${notesSection}

## 用户的问题
${question}

## 你的任务
直接回答用户的问题。要求：
1. 回答要具体，不要泛泛而谈
2. 如果能联系用户已有的笔记，请建立关联
3. 如果用户的问题暴露了一个常见的误解，温和地指出
4. 如果不确定，坦诚说明
5. 回答长度 100-300 字，像导师带学生一样`
}

export function buildResearchPanoramicPrompt(
  topic: string,
  description: string,
  roadmap: { items: { title: string; isRead: boolean; userNote: string }[] },
  notes: { type: string; content: string; aiResponse: string | null }[]
): string {
  const roadmapSummary = roadmap.items
    .map(i => `- ${i.title} ${i.isRead ? '[已读]' : '[未读]'}${i.userNote ? ` — 笔记: ${i.userNote}` : ''}`)
    .join('\n')

  const notesSummary = notes.map((n, i) => {
    let entry = `[${i + 1}] (${n.type}) ${n.content}`
    if (n.aiResponse) entry += `\n    AI回答: ${n.aiResponse.slice(0, 200)}`
    return entry
  }).join('\n')

  return `你是一个元分析研究员。用户正在研究「${topic}」这个主题，已经积累了一些材料。请全盘审视，生成一份全景分析。

## 研究主题
${topic}
${description ? `\n## 研究背景\n${description}` : ''}

## 路线图进度
${roadmapSummary}

## 研究笔记（共 ${notes.length} 条）
${notesSummary}

## 你的任务
横向审视所有材料，生成一份全景分析报告。

## 输出格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "knowledgeMap": "这个领域的知识全景图描述（100-200字，像地图一样描述主要板块和它们的关系）",
  "patterns": ["反复出现的模式1", "模式2", "模式3"],
  "contradictions": ["不同来源之间的矛盾1", "矛盾2"],
  "consensusPoints": ["各方共识1", "共识2"],
  "openQuestions": ["尚未解决的核心问题1", "问题2", "问题3"],
  "blindSpots": ["用户可能忽略的盲区1", "盲区2"]
}

要求：
1. patterns 提供 3-5 个跨材料的模式
2. contradictions 至少 1 个（如果材料足够）
3. consensusPoints 至少 2 个
4. openQuestions 提供 3-5 个真正开放的问题
5. blindSpots 基于「用户读了什么 vs 没读什么」来推断
6. 所有文字使用中文`
}

export function buildResearchOutputPrompt(
  topic: string,
  format: string,
  roadmap: { items: { title: string; description: string; isRead: boolean }[] },
  notes: { type: string; content: string }[],
  analysis: { knowledgeMap: string; patterns: string[]; blindSpots: string[] }
): string {
  const readItems = roadmap.items.filter(i => i.isRead)
  const materialsSummary = `已读材料: ${readItems.map(i => i.title).join('、') || '无'}\n笔记数: ${notes.length}`

  return `你是一个研究总结专家。用户完成了对「${topic}」的深度研究，现在需要把研究成果整理成一份结构化输出。

## 研究主题
${topic}

## 研究材料概览
${materialsSummary}

## 全景分析要点
- 知识全景: ${analysis.knowledgeMap?.slice(0, 200) || '无'}
- 发现的模式: ${analysis.patterns?.join('、') || '无'}
- 可能的盲区: ${analysis.blindSpots?.join('、') || '无'}

## 研究笔记
${notes.map(n => `(${n.type}) ${n.content}`).join('\n')}

## 输出格式要求
请按「${format === 'article' ? '文章' : format === 'outline' ? '大纲' : format === 'mindmap' ? '思维导图文本' : '核心要点'}」格式输出。

## 输出 JSON 格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "title": "研究总结标题",
  "sections": [
    {
      "heading": "章节标题",
      "content": "章节内容（Markdown格式，200-500字）",
      "keyPoints": ["要点1", "要点2"]
    }
  ],
  "totalWordCount": 估算总字数
}

要求：
1. ${format === 'article' ? '写成一篇完整的研究综述文章，有开头有结尾' : format === 'outline' ? '写成层次分明的大纲，每个节点有简短说明' : format === 'mindmap' ? '写成思维导图的文本形式，用缩进表示层级关系' : '提炼最核心的要点，每个要点配简短解释'}
2. sections 提供 3-6 个章节
3. 内容要综合用户的笔记和分析发现
4. 所有文字使用中文`
}

export function buildResearchSelfTestPrompt(
  topic: string,
  roadmap: { items: { title: string; description: string }[] },
  notes: { type: string; content: string }[],
  analysis: { blindSpots: string[] },
  output: { sections: { heading: string }[] }
): string {
  return `你是一个理解力检验专家。用户刚刚完成了对「${topic}」的深度研究，你需要设计自测题来检验 TA 是否真正理解了核心概念——特别要暴露"假理解"（以为自己懂了但其实没懂的地方）。

## 研究材料概览
路线图覆盖: ${roadmap.items.map(i => i.title).join('、')}
笔记数量: ${notes.length}
研究产出章节: ${output.sections.map(s => s.heading).join('、')}
已知盲区: ${analysis.blindSpots?.join('、') || '无'}

## 你的任务
设计 5 道自测题。要求：
1. 不是考察记忆，而是考察理解——能用自己话解释、能举一反三
2. 至少 2 道题针对盲区设计，专门暴露"假理解"
3. 每道题要有提示（不直接给答案，但给思考方向）
4. 每道题要有参考答案（100-200字的模型回答）

## 输出格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "questions": [
    {
      "id": "q-1",
      "question": "测试题（开放性问题，不是选择题）",
      "hint": "一个帮助回忆的提示",
      "suggestedAnswer": "参考答案（100-200字，展示深度理解应该达到的水准）"
    }
  ],
  "overallGapSummary": "基于材料分析，用户最可能的知识盲区总结（100-200字）",
  "suggestedNextSteps": ["建议1", "建议2", "建议3"]
}

要求：
1. 恰好 5 道题
2. 题目要从不同角度测试（概念理解、应用能力、边界辨析、跨领域联系、批判性思维）
3. suggestedAnswer 要展示"真正理解"的样子，不仅是正确答案
4. suggestedNextSteps 给出 2-4 条后续学习建议
5. 所有文字使用中文`
}

export function buildResearchGapAnalysisPrompt(
  question: string,
  userAnswer: string,
  suggestedAnswer: string,
  confidence: string
): string {
  return `你是一个理解力评估师。请对比用户对一道测试题的回答和参考答案，分析理解差距。

## 测试题
${question}

## 参考答案
${suggestedAnswer}

## 用户的回答
${userAnswer || '（未作答）'}

## 用户自评信心
${confidence === 'sure' ? '很确定' : confidence === 'rough' ? '大致了解' : '不太确定'}

## 你的任务
给出简短的差距分析（50-150字）：
1. 用户理解了什么
2. 用户遗漏或误解了什么
3. 建议如何补上这个差距

直接输出分析文字，不需要 JSON 格式。`
}
