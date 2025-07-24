# 个人网站项目

一个现代化的个人网站，基于Next.js和Supabase构建，包含用户认证、个人资料管理和实用工具集合。

## 功能特点

- **用户认证**：注册、登录、退出功能
- **个人资料管理**：头像上传、用户名修改、密码更改
- **实用工具集合**：
  - 图片压缩工具
  - 代码格式化工具
  - 颜色选择器
  - JSON格式化工具
  - Markdown编辑器
  - 密码生成器
- **响应式设计**：支持移动端和桌面端

## 技术栈

- **前端框架**: Next.js 15.3.5 (App Router)
- **状态管理**: React 19 Context API
- **样式**: TailwindCSS 4
- **认证与数据库**: Supabase
- **部署**: Vercel

## 开始使用

### 前提条件

- Node.js 18+
- npm 或 yarn
- Supabase账户

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/myweb.git
cd myweb
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 设置环境变量
创建`.env.local`文件，添加以下内容：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 设置Supabase
- 在Supabase控制台创建新项目
- 运行`supabase/migrations`中的SQL脚本来设置数据库表和存储桶

5. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

6. 构建生产版本
```bash
npm run build
# 或
yarn build
```

## 项目结构

```
myweb/
├── public/             # 静态资源
├── src/
│   ├── app/            # 应用页面
│   │   ├── auth/       # 认证相关页面
│   │   ├── profile/    # 个人资料页面
│   │   ├── tools/      # 工具页面
│   │   └── ...         # 其他页面
│   ├── components/     # 可复用组件
│   ├── contexts/       # React上下文
│   ├── lib/            # 工具函数和库
│   └── ...             # 其他源代码
├── supabase/           # Supabase配置和迁移
└── ...
```

## 部署

项目可以轻松部署到Vercel：

1. 在Vercel上导入GitHub仓库
2. 设置环境变量
3. 部署