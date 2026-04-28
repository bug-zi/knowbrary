-- ============================================
-- 用户认证：profiles + AI 配置表
-- ============================================

-- 用户资料表
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 所有人可读（展示用户名/头像）
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
-- 用户只能更新自己的资料
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- 用户只能插入自己的资料
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- AI 模型配置表
CREATE TABLE public.ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('deepseek', 'zhipu', 'doubao', 'qwen', 'openai')),
  api_key TEXT NOT NULL,
  model TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.ai_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own ai_configs" ON public.ai_configs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai_configs" ON public.ai_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ai_configs" ON public.ai_configs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own ai_configs" ON public.ai_configs
  FOR DELETE USING (auth.uid() = user_id);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 触发器
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_configs_updated_at BEFORE UPDATE ON public.ai_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
