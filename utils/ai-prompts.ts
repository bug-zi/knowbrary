import { CATEGORIES } from '~/types'
import type { Category } from '~/types'

export function buildCardPrompt(category: Category, existingCardTitles: string[]): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''

  return `你是一个知识科普内容创作专家。请为「万象研究所」知识卡片平台生成一张全新的知识卡片。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}

## 已有卡片标题（请勿重复）
${existingCardTitles.length > 0 ? existingCardTitles.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无卡片）'}

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "${category}-xxx（3位数字，从现有最大号+1开始）",
  "slug": "英文短横线slug",
  "title": "中文标题",
  "oneLiner": "一句话概括（不超过50字，生动有趣）",
  "category": "${category}",
  "tags": ["标签1", "标签2", "标签3"],
  "difficulty": "beginner 或 intermediate 或 advanced",
  "cardType": "concept 或 person 或 event 或 experiment 或 principle",
  "content": "Markdown格式的详细内容，包含标题层级、加粗、列表等。至少300字，包含：什么是、生活中的例子、为什么重要等部分",
  "keyData": [
    {"label": "数据标签", "value": "数据值", "description": "简短说明"}
  ],
  "references": [
    {"id": 1, "title": "参考书目/资料", "author": "作者"}
  ]
}

要求：
1. 内容准确、有趣、贴近生活
2. 避免与已有卡片主题重复
3. content 字段使用 Markdown 格式，要有 ## 和 ### 层级
4. keyData 提供 2-4 个核心数据点
5. references 提供 1-3 个参考来源`
}

export function buildPathPrompt(category: Category, existingPaths: string[]): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''

  return `你是一个知识学习路径设计专家。请为「万象研究所」知识卡片平台生成一条全新的学习路径（技能树）。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}

## 已有路径标题（请勿重复）
${existingPaths.length > 0 ? existingPaths.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无路径）'}

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "path-${category}-xxx",
  "slug": "英文短横线slug",
  "title": "中文标题",
  "description": "路径描述（50-100字）",
  "category": "${catName}",
  "categorySlug": "${category}",
  "icon": "一个合适的emoji",
  "color": "${catMeta?.color || '#FFB3BA'}",
  "difficulty": "beginner 或 intermediate 或 advanced",
  "estimatedTime": "预估学习时间（如 30 分钟）",
  "nodes": [
    {
      "id": "n1（从n1开始递增）",
      "cardTitle": "该节点代表的知识概念名称",
      "cardOneLiner": "一句话概括",
      "type": "required 或 optional 或 bonus",
      "position": {"x": 数字, "y": 数字}
    }
  ],
  "edges": [
    {"from": "n1", "to": "n2", "type": "prerequisite 或 related"}
  ],
  "tags": ["标签1", "标签2"]
}

要求：
1. 生成 4-8 个节点，形成有层次的知识树
2. 节点 position 要合理分布（x: 50-400, y: 40-400），形成从上到下的树形结构
3. edges 要体现学习先后关系
4. 每个节点的 cardTitle 是该领域的知识概念，后续会自动生成对应卡片
5. 确保根节点在顶部，叶子节点在底部
6. at least 1 个 required 节点，可包含 optional 和 bonus 节点`
}
