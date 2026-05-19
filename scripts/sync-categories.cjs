// Sync all categories from types/index.ts into Supabase database
// Usage: node scripts/sync-categories.cjs
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// All 39 categories — must match types/index.ts CATEGORIES array
const ALL_CATEGORIES = [
  { id: 'economics', name: '经济学', icon: 'lucide:coins', color: '#A07850', description: '理解市场运作与财富逻辑', sort_order: 1 },
  { id: 'psychology', name: '心理学', icon: 'lucide:brain', color: '#7A906B', description: '探索人类行为与思维模式', sort_order: 2 },
  { id: 'law', name: '法学', icon: 'lucide:scale', color: '#6080A0', description: '了解法律常识与权利边界', sort_order: 3 },
  { id: 'medicine', name: '医学常识', icon: 'lucide:heart-pulse', color: '#B0905B', description: '掌握健康与急救知识', sort_order: 4 },
  { id: 'astronomy', name: '天文学', icon: 'lucide:telescope', color: '#8060A0', description: '仰望星空探索宇宙奥秘', sort_order: 5 },
  { id: 'geography', name: '地理学', icon: 'lucide:globe-2', color: '#509880', description: '认识地球与自然环境', sort_order: 6 },
  { id: 'politics', name: '政治学', icon: 'lucide:landmark', color: '#B07850', description: '理解权力运作与公共治理', sort_order: 7 },
  { id: 'biology', name: '生物学', icon: 'lucide:dna', color: '#509050', description: '解码生命的运作机制', sort_order: 8 },
  { id: 'philosophy', name: '哲学', icon: 'lucide:message-circle-question', color: '#9050A0', description: '思考存在与意义的终极问题', sort_order: 9 },
  { id: 'literature', name: '文学', icon: 'lucide:book-open', color: '#A87050', description: '感受文字的力量与美', sort_order: 10 },
  { id: 'art', name: '艺术鉴赏', icon: 'lucide:palette', color: '#B05070', description: '培养审美与艺术感知力', sort_order: 11 },
  { id: 'music', name: '音乐常识', icon: 'lucide:music', color: '#509888', description: '了解音乐的语言与历史', sort_order: 12 },
  { id: 'mathematics', name: '数学', icon: 'lucide:sigma', color: '#5070A0', description: '用数字理解世界的规律', sort_order: 13 },
  { id: 'ecology', name: '生态与环境', icon: 'lucide:leaf', color: '#409050', description: '认识生态系统与可持续发展', sort_order: 14 },
  { id: 'animals', name: '动物世界', icon: 'lucide:paw-print', color: '#A08B50', description: '发现动物的奇妙世界', sort_order: 15 },
  { id: 'plants', name: '植物图鉴', icon: 'lucide:flower-2', color: '#609040', description: '认识身边的植物朋友', sort_order: 16 },
  { id: 'food', name: '饮食文化', icon: 'lucide:chef-hat', color: '#B09040', description: '品味食物背后的科学与文化', sort_order: 17 },
  { id: 'sports', name: '体育常识', icon: 'lucide:trophy', color: '#B05050', description: '了解运动规则与体育精神', sort_order: 18 },
  { id: 'military', name: '军事', icon: 'lucide:swords', color: '#909050', description: '了解军事历史与战略思想', sort_order: 19 },
  { id: 'education', name: '教育学', icon: 'lucide:graduation-cap', color: '#5070A8', description: '掌握高效学习的方法论', sort_order: 20 },
  { id: 'communication', name: '传播学', icon: 'lucide:megaphone', color: '#B05060', description: '理解信息传播与媒体影响', sort_order: 21 },
  { id: 'scientific-method', name: '科学方法', icon: 'lucide:microscope', color: '#5088A0', description: '学会像科学家一样思考', sort_order: 22 },
  { id: 'data-thinking', name: '数据思维', icon: 'lucide:bar-chart-3', color: '#9050A8', description: '用数据驱动决策与判断', sort_order: 23 },
  { id: 'architecture', name: '建筑学', icon: 'lucide:building-2', color: '#8B7B6B', description: '解读空间、结构与城市之美', sort_order: 24 },
  { id: 'design-thinking', name: '设计思维', icon: 'lucide:pen-tool', color: '#A06080', description: '探索以人为中心的创新方法论', sort_order: 25 },
  { id: 'daily-life', name: '生活常识', icon: 'lucide:coffee', color: '#A08B70', description: '实用生活知识，做个明白人', sort_order: 26 },
  { id: 'healthy-living', name: '健康生活', icon: 'lucide:heart-pulse', color: '#50A890', description: '用科学守护身体与心理的健康', sort_order: 27 },
  { id: 'emotional-intelligence', name: '沟通情商', icon: 'lucide:hand-heart', color: '#C07878', description: '提升沟通能力与情绪管理智慧', sort_order: 28 },
  { id: 'cognitive-biases', name: '认知偏误', icon: 'lucide:brain-cog', color: '#9B7070', description: '识别思维陷阱，看穿认知偏误', sort_order: 29 },
  { id: 'game-theory', name: '博弈与策略', icon: 'lucide:target', color: '#5A7A7A', description: '用博弈思维看透策略与选择', sort_order: 30 },
  { id: 'mythology', name: '神话与民俗', icon: 'lucide:scroll', color: '#907868', description: '探索世界神话、传说与民俗文化', sort_order: 31 },
  { id: 'criminology', name: '犯罪学与法医', icon: 'lucide:fingerprint', color: '#687888', description: '犯罪心理与法医鉴定的科学', sort_order: 32 },
  { id: 'paradoxes', name: '悖论与思维实验', icon: 'lucide:infinity', color: '#8868A0', description: '烧脑悖论与颠覆常识的思维实验', sort_order: 33 },
  { id: 'human-limits', name: '人类极限', icon: 'lucide:flame', color: '#A86848', description: '从吉尼斯纪录到生理极限，揭秘人类的终极边界', sort_order: 34 },
  { id: 'unsolved-mysteries', name: '未解之谜', icon: 'lucide:help-circle', color: '#7068A8', description: '科学界至今无法解释的真实谜题——我们知道什么，还差什么', sort_order: 35 },
  { id: 'humor', name: '幽默学', icon: 'lucide:laugh', color: '#B8A060', description: '用科学拆解幽默机制——为什么好笑、怎么好笑、幽默的社会密码', sort_order: 36 },
  { id: 'logical-fallacies', name: '逻辑谬误', icon: 'lucide:unlink', color: '#889878', description: '识别日常论证中的推理漏洞', sort_order: 37 },
  { id: 'lost-civilizations', name: '失落文明', icon: 'lucide:castle', color: '#A09080', description: '消失的帝国与被遗忘的城市', sort_order: 38 },
  { id: 'materials-science', name: '材料学', icon: 'lucide:atom', color: '#587880', description: '日常物品背后隐藏的材料史诗', sort_order: 39 },
  { id: 'cybersecurity', name: '网络安全', icon: 'lucide:shield-check', color: '#4A7A8C', description: '从安全意识到专业防护，掌握数字世界的生存技能', sort_order: 40 },
];

async function sync() {
  console.log(`Syncing ${ALL_CATEGORIES.length} categories to Supabase...\n`);

  // Check current state
  const { data: existing, error: fetchErr } = await sb.from('categories').select('id, name');
  if (fetchErr) {
    console.error('Failed to fetch existing categories:', fetchErr.message);
    process.exit(1);
  }

  const existingIds = new Set(existing.map(c => c.id));
  const missing = ALL_CATEGORIES.filter(c => !existingIds.has(c.id));
  const alreadyExists = ALL_CATEGORIES.filter(c => existingIds.has(c.id));

  console.log(`Already in DB: ${alreadyExists.length}`);
  console.log(`Missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log('Missing categories:', missing.map(c => `${c.id} (${c.name})`).join(', '));
  }

  if (missing.length === 0) {
    console.log('\nAll categories already synced. Nothing to do.');
    return;
  }

  // Insert missing categories
  console.log(`\nInserting ${missing.length} missing categories...`);
  const { data, error } = await sb.from('categories').insert(missing).select('id, name');

  if (error) {
    console.error('Insert failed:', error.message);
    // Try one by one
    for (const cat of missing) {
      const { error: e2 } = await sb.from('categories').insert(cat);
      if (e2) {
        console.error(`  FAILED: ${cat.id} - ${e2.message}`);
      } else {
        console.log(`  OK: ${cat.id} - ${cat.name}`);
      }
    }
  } else {
    data.forEach(c => console.log(`  OK: ${c.id} - ${c.name}`));
  }

  // Verify
  const { data: final } = await sb.from('categories').select('id, name').order('sort_order');
  console.log(`\nTotal categories in DB: ${final.length}`);
  if (final.length < ALL_CATEGORIES.length) {
    console.warn(`WARNING: Expected ${ALL_CATEGORIES.length}, found ${final.length}`);
    const finalIds = new Set(final.map(c => c.id));
    const stillMissing = ALL_CATEGORIES.filter(c => !finalIds.has(c.id));
    if (stillMissing.length > 0) {
      console.warn('Still missing:', stillMissing.map(c => c.id).join(', '));
    }
  } else {
    console.log('All categories synced successfully!');
  }
}

sync().catch(e => console.error('Fatal:', e));
