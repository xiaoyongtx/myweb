# 安装指南

## 环境要求

- Node.js 18+
- npm 或 yarn  
- Supabase账户

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/yourusername/myweb.git
cd myweb
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
创建 `.env.local` 文件：
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 设置 Supabase

1. 访问 [Supabase](https://supabase.com/) 创建项目
2. 在 SQL Editor 中执行以下脚本：

```sql
-- 创建用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建访问策略
CREATE POLICY "用户可以查看所有资料" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "用户可以更新自己的资料" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "用户可以插入自己的资料" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 创建网盘链接管理表
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

-- 启用行级安全
ALTER TABLE netdisk_links ENABLE ROW LEVEL SECURITY;

-- 创建访问策略
CREATE POLICY "用户只能查看自己的链接" ON netdisk_links
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能插入自己的链接" ON netdisk_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户只能更新自己的链接" ON netdisk_links
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户只能删除自己的链接" ON netdisk_links
  FOR DELETE USING (auth.uid() = user_id);
```

3. 创建存储桶：
   - 在 Storage 中创建名为 `avatars` 的存储桶
   - 设置公开访问权限

### 5. 启动项目
```bash
npm run dev
```

项目将在 [http://localhost:3000](http://localhost:3000) 运行

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入仓库
3. 设置环境变量（与 .env.local 相同）
4. 部署

## 常见问题

### Supabase 连接问题
- 检查环境变量是否正确设置
- 确认 Supabase 项目是否正常运行

### 构建失败
- 确保所有依赖已安装：`npm install`
- 清除缓存：`rm -rf .next && npm run build`

### 数据库问题  
- 确认 SQL 脚本已正确执行
- 检查表是否创建成功
- 验证 RLS 策略是否正确设置

## SEO 优化

项目已内置 SEO 优化：
- 完整的元数据设置
- 自动生成 sitemap.xml
- 结构化数据支持
- 多语言支持（中文、英文、日文）

## 项目清理

项目已进行代码清理：
- 移除未使用的依赖和文件
- 简化配置文件
- 优化代码结构
- 所有功能正常工作