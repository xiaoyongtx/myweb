import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "关于我们 - 开发者工具箱",
  description: "了解开发者工具箱的创建者小勇同学，90后奶爸程序员，专注于编程技术和开发工具的应用，分享副业经历和技术心得。",
  keywords: [
    "小勇同学", "编程工具", "程序员", "副业", "闲鱼项目", "开发工具",
    "编程博客", "技术分享", "开发者", "编程工具开发者",
    "Programming Developer", "Programming Blog", "Tech Sharing"
  ],
  openGraph: {
    title: "关于我们 - 开发者工具箱",
    description: "了解开发者工具箱的创建者小勇同学，专注于编程技术和开发工具的应用",
    type: "profile",
    url: "https://myweb.vercel.app/about",
  },
  alternates: {
    canonical: "https://myweb.vercel.app/about",
  },
};

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          关于我
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          了解更多关于我和这个网站的信息
        </p>
      </div>

      <div className="prose prose-indigo dark:prose-invert lg:prose-lg mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            个人简介
          </h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">
                <span className="font-medium">我是小勇同学</span>，老家江西，现居郑州
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">
                90后奶爸，资深程序员。在国企上班，下班搞副业
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">副业经历</h3>
              <ul className="space-y-3 pl-5">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5">•</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">2025年开启副业，主要做闲鱼项目，变现四位数</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5">•</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">大冲私教，跟着冲哥践行十年退休计划</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5">•</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">日更公众号ING</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">正在做的事</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">公众号</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">闲鱼无货源电商</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">AI编程</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">联系方式</h3>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">微信号：751825267</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            关于本站
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            这个个人网站是我用来分享知识、展示项目和提供实用工具的平台。网站使用现代技术栈构建：
          </p>
          <ul className="list-disc pl-5 my-4 text-gray-500 dark:text-gray-400">
            <li>Next.js - React框架，提供服务器端渲染和静态站点生成</li>
            <li>Tailwind CSS - 实用优先的CSS框架，用于快速构建自定义UI</li>
            <li>Supabase - 开源的Firebase替代品，提供数据库、认证和存储服务</li>
            <li>Vercel - 用于部署和托管网站</li>
          </ul>
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            网站的功能包括文章发布、用户认证、实用工具集等，旨在提供良好的用户体验和有价值的内容。
          </p>
        </section>


      </div>
    </div>
  );
}