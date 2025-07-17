import Link from 'next/link';

// 模拟文章数据
const articles = [
  {
    id: 1,
    title: '如何使用Next.js构建现代Web应用',
    content: `
# 如何使用Next.js构建现代Web应用

## 简介

Next.js是一个流行的React框架，它提供了许多开箱即用的功能，如服务器端渲染、静态站点生成、API路由等。本文将介绍如何使用Next.js构建现代Web应用。

## 为什么选择Next.js？

Next.js提供了许多优势：

- **服务器端渲染(SSR)**：提高首屏加载速度和SEO
- **静态站点生成(SSG)**：预渲染页面，提供极快的加载速度
- **API路由**：轻松创建API端点
- **文件系统路由**：基于文件系统的直观路由
- **自动代码分割**：只加载当前页面所需的JavaScript
- **内置CSS和Sass支持**：轻松添加样式
- **快速刷新**：即时反馈的开发体验

## 入门指南

### 安装

创建一个新的Next.js应用非常简单：

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

### 页面路由

Next.js使用基于文件系统的路由。在\`pages\`目录中创建的每个文件都会自动成为一个路由：

- \`pages/index.js\` → \`/\`
- \`pages/about.js\` → \`/about\`
- \`pages/blog/[id].js\` → \`/blog/:id\`

### 数据获取

Next.js提供了三种数据获取方法：

1. **getStaticProps**：在构建时获取数据
2. **getStaticPaths**：指定动态路由的路径
3. **getServerSideProps**：在每个请求上获取数据

### 部署

Next.js应用可以部署到任何支持Node.js的环境，或者使用Vercel进行零配置部署。

## 结论

Next.js是构建现代Web应用的强大工具，它简化了许多复杂的任务，让开发者可以专注于构建功能和用户体验。无论是个人项目还是企业应用，Next.js都是一个值得考虑的选择。
    `,
    date: '2023-06-15',
    author: '张三',
    category: '前端开发',
  },
  {
    id: 2,
    title: 'Supabase入门指南：构建后端服务',
    content: `
# Supabase入门指南：构建后端服务

## 什么是Supabase？

Supabase是一个开源的Firebase替代品，它提供了数据库、认证、存储等服务。使用Supabase，你可以快速构建后端服务，而无需从头开始编写代码。

## Supabase的主要功能

- **PostgreSQL数据库**：功能强大的开源数据库
- **认证**：内置用户管理和认证
- **实时订阅**：通过WebSockets实时接收数据库更改
- **存储**：上传和管理文件
- **自动生成的API**：自动为你的数据库表生成RESTful API

## 开始使用Supabase

### 创建项目

1. 注册并登录Supabase
2. 创建一个新项目
3. 获取项目URL和API密钥

### 安装客户端库

\`\`\`bash
npm install @supabase/supabase-js
\`\`\`

### 初始化客户端

\`\`\`javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project-url.supabase.co'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)
\`\`\`

### 使用数据库

\`\`\`javascript
// 查询数据
const { data, error } = await supabase
  .from('posts')
  .select('*')

// 插入数据
const { data, error } = await supabase
  .from('posts')
  .insert([{ title: '新文章', content: '文章内容' }])
\`\`\`

### 认证

\`\`\`javascript
// 注册
const { user, error } = await supabase.auth.signUp({
  email: 'example@email.com',
  password: 'example-password',
})

// 登录
const { user, error } = await supabase.auth.signIn({
  email: 'example@email.com',
  password: 'example-password',
})
\`\`\`

## 与Next.js集成

Supabase与Next.js配合使用非常简单：

1. 安装必要的包
2. 创建一个Supabase客户端
3. 在页面或组件中使用Supabase API

## 结论

Supabase是一个强大的后端服务平台，它可以帮助开发者快速构建功能丰富的应用。无论是个人项目还是企业应用，Supabase都提供了一套完整的工具来满足你的需求。
    `,
    date: '2023-07-20',
    author: '李四',
    category: '后端开发',
  },
  {
    id: 3,
    title: 'TailwindCSS实战：构建响应式UI',
    content: `
# TailwindCSS实战：构建响应式UI

## 什么是TailwindCSS？

TailwindCSS是一个功能类优先的CSS框架，它允许您通过组合各种功能类来构建任何设计，而无需编写自定义CSS。

## TailwindCSS的优势

- **高度可定制**：通过配置文件完全控制颜色、间距、断点等
- **按需生成**：只包含您实际使用的CSS
- **响应式设计**：内置的响应式变体使构建响应式界面变得简单
- **暗模式支持**：轻松添加暗模式支持
- **组件提取**：可以将常用的类组合提取为可重用的组件

## 安装和配置

### 安装

\`\`\`bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

### 配置

在\`tailwind.config.js\`中：

\`\`\`javascript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
\`\`\`

### 添加Tailwind指令

在CSS文件中：

\`\`\`css
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

## 构建响应式UI

### 响应式设计

TailwindCSS使用前缀来应用响应式样式：

- \`sm:\` - 640px及以上
- \`md:\` - 768px及以上
- \`lg:\` - 1024px及以上
- \`xl:\` - 1280px及以上
- \`2xl:\` - 1536px及以上

例如：

\`\`\`html
<div class="text-center md:text-left">
  <!-- 在小屏幕上居中，在中等屏幕及以上左对齐 -->
</div>
\`\`\`

### 常用组件示例

#### 按钮

\`\`\`html
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
  点击我
</button>
\`\`\`

#### 卡片

\`\`\`html
<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-xl font-bold mb-4">卡片标题</h2>
  <p class="text-gray-700">卡片内容</p>
</div>
\`\`\`

#### 响应式导航

\`\`\`html
<nav class="bg-gray-800 text-white p-4">
  <div class="flex justify-between items-center">
    <div class="text-xl font-bold">Logo</div>
    <div class="hidden md:block">
      <a href="#" class="px-3 py-2 hover:bg-gray-700 rounded">首页</a>
      <a href="#" class="px-3 py-2 hover:bg-gray-700 rounded">关于</a>
      <a href="#" class="px-3 py-2 hover:bg-gray-700 rounded">服务</a>
      <a href="#" class="px-3 py-2 hover:bg-gray-700 rounded">联系</a>
    </div>
    <button class="md:hidden">菜单</button>
  </div>
</nav>
\`\`\`

## 结论

TailwindCSS是一个强大的CSS框架，它可以帮助开发者快速构建响应式UI。通过组合各种功能类，您可以创建出独特的设计，而无需编写大量自定义CSS。
    `,
    date: '2023-08-10',
    author: '王五',
    category: 'CSS',
  },
];

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = articles.find((a) => a.id === parseInt(params.id));

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          文章未找到
        </h1>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          抱歉，您请求的文章不存在。
        </p>
        <div className="mt-6">
          <Link
            href="/articles"
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            返回文章列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/articles"
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ← 返回文章列表
        </Link>
      </div>

      <article className="prose prose-indigo dark:prose-invert lg:prose-lg mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-4 flex items-center">
            <div className="flex-shrink-0">
              <span className="sr-only">{article.author}</span>
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {article.author.charAt(0)}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {article.author}
              </p>
              <div className="flex space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <time dateTime={article.date}>{article.date}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{article.category}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-8">
          {/* 使用dangerouslySetInnerHTML渲染Markdown内容 */}
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{
              __html: article.content
                .replace(/\n/g, '<br/>')
                .replace(/#{1,6}\s+([^\n]+)/g, (match, p1, offset, string) => {
                  const level = match.trim().indexOf(' ');
                  return `<h${level} class="text-2xl font-bold mt-6 mb-4">${p1}</h${level}>`;
                })
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                .replace(/\`\`\`([^`]+)\`\`\`/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto"><code>$1</code></pre>')
                .replace(/\`([^`]+)\`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">$1</code>')
                .replace(/- ([^\n]+)/g, '<li>$1</li>')
                .replace(/<li>([^<]+)<\/li>/g, '<ul class="list-disc pl-5 my-4"><li>$1</li></ul>')
            }}
          />
        </div>
      </article>

      <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          评论
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          评论功能即将上线，敬请期待！
        </p>
      </div>
    </div>
  );
}