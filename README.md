# 个人网站

这是一个使用Next.js、Tailwind CSS和Supabase构建的个人网站，包含登录注册、文章发布和工具箱功能。

## 功能特点

- **用户认证**：注册、登录和个人资料管理
- **文章系统**：浏览和阅读文章
- **工具箱**：各种实用的在线工具
- **响应式设计**：适配各种设备尺寸
- **暗色模式**：支持明亮和暗黑主题切换

## 技术栈

- **前端框架**：Next.js 15.x (React 19)
- **样式**：Tailwind CSS 4.x
- **后端服务**：Supabase (认证、数据库、存储)
- **部署**：Vercel

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 开始使用

### 前提条件

- Node.js 18.x 或更高版本
- npm 或 yarn
- Supabase 账户

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/personal-website.git
cd personal-website
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 配置环境变量

创建一个`.env.local`文件，并添加以下内容：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

这个项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 自动优化和加载 [Geist](https://vercel.com/font)，这是Vercel的一个新字体系列。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 项目结构

```
/
├── public/             # 静态资源
├── src/
│   ├── app/            # 应用路由和页面
│   │   ├── about/      # 关于页面
│   │   ├── articles/   # 文章相关页面
│   │   ├── auth/       # 认证相关页面
│   │   ├── tools/      # 工具箱相关页面
│   │   ├── globals.css # 全局样式
│   │   ├── layout.tsx  # 根布局组件
│   │   └── page.tsx    # 首页
│   ├── components/     # 可复用组件
│   └── lib/            # 工具函数和库
├── .env.local          # 环境变量
├── next.config.ts      # Next.js配置
├── package.json        # 项目依赖
└── README.md           # 项目说明
```

## 部署

### Vercel部署

最简单的部署Next.js应用的方法是使用Next.js创建者提供的[Vercel平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

1. 在Vercel上导入你的GitHub仓库
2. 添加环境变量
3. 部署

查看[Next.js部署文档](https://nextjs.org/docs/app/building-your-application/deploying)了解更多详情。

## 贡献

欢迎贡献代码、报告问题或提出改进建议。

## 许可证

[MIT](LICENSE)
