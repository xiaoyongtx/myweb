-- 创建HTML分享表
CREATE TABLE html_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  html_content TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_html_shares_user_id ON html_shares(user_id);
CREATE INDEX idx_html_shares_public ON html_shares(is_public, created_at DESC);
CREATE INDEX idx_html_shares_created_at ON html_shares(created_at DESC);

-- 启用 RLS
ALTER TABLE html_shares ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- 用户可以查看所有公开的分享
CREATE POLICY "用户可以查看公开的HTML分享" ON html_shares
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- 用户只能插入自己的分享
CREATE POLICY "用户只能插入自己的HTML分享" ON html_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的分享
CREATE POLICY "用户只能更新自己的HTML分享" ON html_shares
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的分享
CREATE POLICY "用户只能删除自己的HTML分享" ON html_shares
  FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_html_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_html_shares_updated_at 
  BEFORE UPDATE ON html_shares 
  FOR EACH ROW EXECUTE FUNCTION update_html_shares_updated_at();
-- 创建原子性
-- 增加浏览次数的函数
CREATE OR REPLACE FUNCTION increment_view_count(share_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE html_shares 
  SET view_count = view_count + 1 
  WHERE id = share_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;