# SQL 语句集合

## 表结构定义

### profiles 表
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### netdisk_links 表
```sql
CREATE TABLE netdisk_links (
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
```

### html_shares 表
```sql
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
```

## 索引定义

### netdisk_links 表索引
```sql
-- 用户ID索引
CREATE INDEX idx_netdisk_links_user_id ON netdisk_links(user_id);

-- 平台索引
CREATE INDEX idx_netdisk_links_platform ON netdisk_links(platform);

-- 创建时间索引（降序）
CREATE INDEX idx_netdisk_links_created_at ON netdisk_links(created_at DESC);
```

### html_shares 表索引
```sql
-- 用户ID索引
CREATE INDEX idx_html_shares_user_id ON html_shares(user_id);

-- 公开状态复合索引
CREATE INDEX idx_html_shares_public ON html_shares(is_public, created_at);

-- 创建时间索引
CREATE INDEX idx_html_shares_created_at ON html_shares(created_at);
```

## 行级安全策略 (RLS)

### profiles 表策略
```sql
-- 用户可以查看所有个人资料（已认证用户）
CREATE POLICY "用户可以查看所有资料" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 用户只能更新自己的资料
CREATE POLICY "用户可以更新自己的资料" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 用户只能插入自己的资料
CREATE POLICY "用户可以插入自己的资料" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### netdisk_links 表策略
```sql
-- 用户只能查看自己的网盘链接
CREATE POLICY "用户只能查看自己的链接" ON netdisk_links
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的链接
CREATE POLICY "用户只能插入自己的链接" ON netdisk_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的链接
CREATE POLICY "用户只能更新自己的链接" ON netdisk_links
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的链接
CREATE POLICY "用户只能删除自己的链接" ON netdisk_links
  FOR DELETE USING (auth.uid() = user_id);
```

### html_shares 表策略
```sql
-- 用户可以查看公开分享或自己的分享
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
```

## 存储桶配置

### avatars 存储桶策略
```sql
-- 允许用户上传自己的头像
CREATE POLICY "用户可以上传自己的头像" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许所有人查看头像（公开访问）
CREATE POLICY "头像文件可以被查看" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 允许用户更新自己的头像
CREATE POLICY "用户可以更新自己的头像" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许用户删除自己的头像
CREATE POLICY "用户可以删除自己的头像" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 数据库函数和触发器

### 自动更新时间函数
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

### 更新时间触发器
```sql
-- 为每个表创建触发器
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_netdisk_links_updated_at 
  BEFORE UPDATE ON netdisk_links 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_html_shares_updated_at 
  BEFORE UPDATE ON html_shares 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 业务逻辑函数

#### 增加HTML分享浏览次数
```sql
CREATE OR REPLACE FUNCTION increment_view_count(share_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE html_shares 
  SET view_count = view_count + 1 
  WHERE id = share_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 新用户注册处理函数
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建用户注册触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```