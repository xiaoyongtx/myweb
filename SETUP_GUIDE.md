# 项目设置指南

本指南将帮助您设置和运行个人网站项目。

## 前提条件

- Node.js 18+
- npm 或 yarn
- Supabase账户

## 步骤 1: 安装依赖

在项目根目录下运行以下命令安装所有依赖：

```bash
npm install
# 或
yarn install
```

## 步骤 2: 设置Supabase

1. 访问 [Supabase](https://supabase.com/) 并创建一个账户
2. 创建一个新项目
3. 在项目设置中找到API URL和anon key
4. 在项目的SQL编辑器中运行以下SQL脚本来创建必要的表：

```sql
-- 创建profiles表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建RLS策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户读取所有个人资料
CREATE POLICY "允许已认证用户读取所有个人资料" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 允许用户更新自己的个人资料
CREATE POLICY "允许用户更新自己的个人资料" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 允许用户插入自己的个人资料
CREATE POLICY "允许用户插入自己的个人资料" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

5. 在Supabase中设置存储桶：
   - 导航到"Storage"部分
   - 创建一个名为"avatars"的新存储桶
   - 设置适当的访问权限

## 步骤 3: 设置环境变量

1. 在项目根目录创建`.env.local`文件
2. 添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

将`your_supabase_url`和`your_supabase_anon_key`替换为您在Supabase项目设置中找到的值。

## 步骤 4: 启动开发服务器

运行以下命令启动开发服务器：

```bash
npm run dev
# 或
yarn dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 上运行。

## 步骤 5: 构建生产版本

当您准备部署时，运行以下命令构建生产版本：

```bash
npm run build
# 或
yarn build
```

## 部署到Vercel

1. 将代码推送到GitHub仓库
2. 在Vercel上创建账户并导入GitHub仓库
3. 设置环境变量（与`.env.local`文件中相同）
4. 部署应用

## 故障排除

### 常见问题

1. **Supabase认证问题**
   - 确保环境变量正确设置
   - 检查Supabase项目的认证设置

2. **构建错误**
   - 确保所有依赖都已安装
   - 检查控制台错误信息

3. **动态导入错误**
   - 确保在客户端组件中使用`ssr: false`选项
   - 使用NavbarWrapper组件作为中间层

### 联系支持

如有任何问题，请通过以下方式联系：

- 微信: 751825267