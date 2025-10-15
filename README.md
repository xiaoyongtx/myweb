# AI编程工具箱

基于 Next.js 15 和 Supabase 构建的现代化工具箱，集成用户认证系统和30+个实用工具。

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/xiaoyongtx/myweb.git
cd myweb

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

### 环境变量配置

在 `.env.local` 文件中配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🛠️ 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript + TailwindCSS
- **后端**: Supabase (Auth + PostgreSQL + Storage)

## 📁 项目结构

```
myweb/
├── src/app/           # Next.js App Router
├── src/components/    # 可复用组件
├── src/lib/          # 工具函数和配置
├── public/           # 静态资源
└── docs/             # 项目文档
```

## 🎯 部署

支持 Vercel、Netlify、自有服务器等多种部署方式。

## 📞 联系方式

- **微信**: 751825267

## 📄 许可证

MIT 许可证