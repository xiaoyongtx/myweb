-- 创建网盘链接表
CREATE TABLE IF NOT EXISTS netdisk_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  extract_code TEXT,
  platform TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_netdisk_links_user_id ON netdisk_links(user_id);
CREATE INDEX IF NOT EXISTS idx_netdisk_links_platform ON netdisk_links(platform);
CREATE INDEX IF NOT EXISTS idx_netdisk_links_created_at ON netdisk_links(created_at DESC);

-- 启用行级安全策略 (RLS)
ALTER TABLE netdisk_links ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的链接
CREATE POLICY "Users can view own netdisk links" ON netdisk_links
  FOR SELECT USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的链接
CREATE POLICY "Users can insert own netdisk links" ON netdisk_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的链接
CREATE POLICY "Users can update own netdisk links" ON netdisk_links
  FOR UPDATE USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的链接
CREATE POLICY "Users can delete own netdisk links" ON netdisk_links
  FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_netdisk_links_updated_at 
  BEFORE UPDATE ON netdisk_links 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();