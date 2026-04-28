-- ============================================
-- 万象研究所 Supabase Schema
-- ============================================

-- 1. 学科分类
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 2. 知识卡片
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  one_liner TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  tags TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  card_type TEXT NOT NULL CHECK (card_type IN ('concept', 'person', 'event', 'experiment', 'principle', 'species', 'geography', 'culture')),
  content TEXT NOT NULL,
  key_data JSONB NOT NULL DEFAULT '[]',
  "references" JSONB NOT NULL DEFAULT '[]',
  related_card_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cards_category ON cards(category_id);
CREATE INDEX idx_cards_difficulty ON cards(difficulty);
CREATE INDEX idx_cards_type ON cards(card_type);

-- 3. 学习路径
CREATE TABLE paths (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  category_slug TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time TEXT NOT NULL,
  author TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 路径节点
CREATE TABLE path_nodes (
  id TEXT NOT NULL,
  path_id TEXT NOT NULL REFERENCES paths(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES cards(id),
  node_type TEXT NOT NULL CHECK (node_type IN ('required', 'optional', 'bonus')),
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  PRIMARY KEY (id, path_id)
);

-- 5. 路径边（依赖关系）
CREATE TABLE path_edges (
  id TEXT NOT NULL,
  path_id TEXT NOT NULL REFERENCES paths(id) ON DELETE CASCADE,
  from_node_id TEXT NOT NULL,
  to_node_id TEXT NOT NULL,
  edge_type TEXT NOT NULL CHECK (edge_type IN ('prerequisite', 'related')),
  PRIMARY KEY (id, path_id)
);

-- 6. 每日测验
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  publish_date DATE NOT NULL,
  question TEXT NOT NULL,
  scenario TEXT NOT NULL DEFAULT '',
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  related_card_ids TEXT[] NOT NULL DEFAULT '{}',
  category_id TEXT NOT NULL REFERENCES categories(id),
  difficulty TEXT NOT NULL DEFAULT 'beginner'
);

-- 7. 思想实验
CREATE TABLE thought_experiments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  choices JSONB NOT NULL,
  final_analysis TEXT NOT NULL,
  related_card_ids TEXT[] NOT NULL DEFAULT '{}',
  category_id TEXT NOT NULL REFERENCES categories(id)
);

-- ============================================
-- 用户数据表（需要认证）
-- ============================================

-- 8. 用户学习进度
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES cards(id),
  learned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_date ON user_progress(learned_at);

-- 9. 收藏
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES cards(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- 10. 测验结果
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id),
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_date ON quiz_results(answered_at);

-- 11. 成就定义
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- 12. 用户成就
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- RLS 策略
-- ============================================

-- 公共数据：所有人可读
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE thought_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read cards" ON cards FOR SELECT USING (true);
CREATE POLICY "Public read paths" ON paths FOR SELECT USING (true);
CREATE POLICY "Public read path_nodes" ON path_nodes FOR SELECT USING (true);
CREATE POLICY "Public read path_edges" ON path_edges FOR SELECT USING (true);
CREATE POLICY "Public read quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Public read thought_experiments" ON thought_experiments FOR SELECT USING (true);
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);

-- 用户数据：只能读写自己的
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON user_progress FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own quiz_results" ON quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own quiz_results" ON quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- updated_at 触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
