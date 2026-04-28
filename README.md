# 万象研究所 (Knowbrary)

每个人的随身知识实验室 —— 通过知识卡片探索 21 个学科领域。

## 功能

- **知识卡片** — 涵盖经济学、心理学、法学、天文学等 21 个学科，每张卡片浓缩一个知识点
- **学习路径** — 技能树式进阶体系，可视化学习进度
- **知识图谱** — D3.js 力导向图展示知识点之间的关联
- **每日知识** — 首页一句话科普，每天自动轮换
- **每日实验** — 测验与思想实验，巩固所学
- **暗色模式** — 支持亮/暗主题切换

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Nuxt 3 (Vue 3 + File-based Routing) |
| 样式 | Tailwind CSS (自定义 macaron 配色) |
| 数据库 | Supabase (PostgreSQL + RLS) |
| 可视化 | D3.js (d3-force, d3-zoom) |
| 搜索 | MiniSearch (客户端全文检索) |

## 项目结构

```
pages/              # 页面路由
  index.vue         # 首页
  categories/       # 学科分类
  cards/            # 知识卡片详情
  paths/            # 学习路径
  graph/            # 知识图谱
  experiment/       # 每日实验
components/         # Vue 组件
  Layout/           # 页头、底部导航
  Card/             # 卡片相关组件
  Search/           # 搜索组件
utils/              # 工具函数 (Supabase 客户端、数据获取)
types/              # TypeScript 类型定义
content/            # 本地 JSON 数据 (路径、测验)
supabase/           # 数据库迁移和种子数据
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 静态站点生成
npm run generate
```

## 环境变量

在项目根目录创建 `.env` 文件：

```
SUPABASE_URL=你的 Supabase 项目 URL
SUPABASE_ANON_KEY=Supabase 匿名密钥
SUPABASE_SERVICE_KEY=Supabase 服务端密钥
```

## License

MIT
