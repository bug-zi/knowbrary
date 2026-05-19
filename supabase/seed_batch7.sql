-- Batch 7: 12 Niche Knowledge Domains (categories only, no seed cards)
BEGIN;

INSERT INTO categories (id, name, icon, color, description, sort_order) VALUES
('emotional-intelligence', '沟通情商', 'lucide:hand-heart', '#C07878', '提升沟通能力与情绪管理智慧', 29),
('cognitive-biases', '认知偏误', 'lucide:brain-cog', '#9B7070', '识别思维陷阱，看穿认知偏误', 30),
('game-theory', '博弈与策略', 'lucide:target', '#5A7A7A', '用博弈思维看透策略与选择', 31),
('mythology', '神话与民俗', 'lucide:scroll', '#907868', '探索世界神话、传说与民俗文化', 32),
('criminology', '犯罪学与法医', 'lucide:fingerprint', '#687888', '犯罪心理与法医鉴定的科学', 33),
('paradoxes', '悖论与思维实验', 'lucide:infinity', '#8868A0', '烧脑悖论与颠覆常识的思维实验', 34),
('human-limits', '人类极限', 'lucide:flame', '#A86848', '从吉尼斯纪录到生理极限，揭秘人类的终极边界', 35),
('unsolved-mysteries', '未解之谜', 'lucide:help-circle', '#7068A8', '科学尚未破解的终极谜题', 36),
('humor', '幽默学', 'lucide:laugh', '#B8A060', '认真分析笑话为什么好笑的学问', 37),
('logical-fallacies', '逻辑谬误', 'lucide:unlink', '#889878', '识别日常论证中的推理漏洞', 38),
('lost-civilizations', '失落文明', 'lucide:castle', '#A09080', '消失的帝国与被遗忘的城市', 39),
('materials-science', '材料学', 'lucide:atom', '#587880', '日常物品背后隐藏的材料史诗', 40)
ON CONFLICT (id) DO NOTHING;

COMMIT;
