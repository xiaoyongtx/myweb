import Link from 'next/link';

// 模拟文章数据
const articles = [
  {
    id: 1,
    title: '如何使用Next.js构建现代Web应用',
    excerpt: 'Next.js是一个流行的React框架，它提供了许多开箱即用的功能，如服务器端渲染、静态站点生成、API路由等。本文将介绍如何使用Next.js构建现代Web应用。',
    date: '2023-06-15',
    author: '张三',
    category: '前端开发',
  },
  {
    id: 2,
    title: 'Supabase入门指南：构建后端服务',
    excerpt: 'Supabase是一个开源的Firebase替代品，它提供了数据库、认证、存储等服务。本文将介绍如何使用Supabase构建后端服务。',
    date: '2023-07-20',
    author: '李四',
    category: '后端开发',
  },
  {
    id: 3,
    title: 'TailwindCSS实战：构建响应式UI',
    excerpt: 'TailwindCSS是一个功能类优先的CSS框架，它允许您通过组合各种功能类来构建任何设计。本文将介绍如何使用TailwindCSS构建响应式UI。',
    date: '2023-08-10',
    author: '王五',
    category: 'CSS',
  },
];

export default function Articles() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          文章列表
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          分享知识和经验，探索各种技术话题
        </p>
      </div>

      <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-none">
        {articles.map((article) => (
          <div
            key={article.id}
            className="flex flex-col rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105"
          >
            <div className="flex-1 bg-white dark:bg-gray-800 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {article.category}
                </p>
                <Link href={`/articles/${article.id}`}>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                    {article.title}
                  </h3>
                </Link>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                  {article.excerpt}
                </p>
              </div>
              <div className="mt-6 flex items-center">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}