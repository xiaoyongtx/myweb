import Link from "next/link";
import { Metadata } from "next";
import { seoConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: seoConfig.title.default,
  description: seoConfig.description,
  keywords: seoConfig.keywords,
  authors: seoConfig.authors,
  creator: seoConfig.creator,
  publisher: seoConfig.publisher,
  robots: seoConfig.robots,
  openGraph: {
    ...seoConfig.openGraph,
    title: "编程工具箱 | 开发者必备的在线工具集合 - 小勇同学",
    description: seoConfig.description,
    url: seoConfig.siteUrl,
  },
  twitter: {
    ...seoConfig.twitter,
    title: "编程工具箱 | 开发者必备的在线工具集合",
    description: seoConfig.description,
  },
  alternates: {
    canonical: seoConfig.siteUrl,
  },
};

export default function Home() {
  const jsonLd = {
    ...seoConfig.structuredData.organization,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${seoConfig.siteUrl}/tools?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '开发者工具箱',
    description: '专业的开发者工具箱，提供代码格式化、JSON工具、IP查询、Markdown编辑器等实用功能',
    url: 'https://myweb.vercel.app',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Person',
      name: '小勇同学',
      url: 'https://github.com/lizhiyong16'
    },
    featureList: [
      '编程工具',
      '代码格式化工具',
      'JSON格式化器',
      '公网IP查询',
      'Markdown编辑器',
      '颜色选择器',
      '密码生成器'
    ],
    screenshot: 'https://myweb.vercel.app/screenshot.png',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* 主标题 */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            借助AI提效放大商业化
            <br />
            <span className="text-gray-700 dark:text-gray-300">《一人企业复利商业化》</span>
          </h1>

          {/* 副标题 */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            持续价值输出、副业项目实战、复利内容产品、AI工具，构建《一人企业复利商业化》模式&生态体系
          </p>

          {/* CTA按钮 */}
          <div className="flex justify-center">
            <Link
              href="/tools"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              探索我的项目
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* 关于我部分 */}
      <div className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              关于我
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              90后奶爸程序员，探索一人企业复利商业化之路
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-3 gap-0">
              {/* 个人信息 */}
              <div className="lg:col-span-2 p-8 lg:p-12">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    个人简介
                  </h3>
                  <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-4 text-lg">
                    <p>
                      我是小勇同学，老家江西，现居郑州。
                    </p>
                    <p>
                      90后奶爸，资深程序员。在国企上班，下班搞副业。
                    </p>
                    <p>
                      2025年开启副业，做过很多实战项目，闲鱼项目，变现四位数。
                    </p>
                    <p>
                      深圳大冲私教学员，践行十年退休计划。
                    </p>
                    <p>
                      坚持日更公众号，分享一人企业复利商业化心得。
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    正在做的事
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                    <span className="font-medium text-gray-900 dark:text-white">核心业务：</span>
                    公众号内容创作 + 闲鱼无货源电商 + AI编程工具开发
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="px-5 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900 dark:to-purple-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700">
                      📝 公众号日更
                    </span>
                    <span className="px-5 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200 border border-green-200 dark:border-green-700">
                      🛒 闲鱼电商
                    </span>
                    <span className="px-5 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                      🤖 AI编程
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    联系方式
                  </h4>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 text-lg">
                    <svg className="h-6 w-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span className="font-medium">微信号：751825267</span>
                  </div>
                </div>
              </div>

              {/* 微信二维码 */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-8 lg:p-12 flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    扫码加微信
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    一起探讨一人企业复利商业化
                  </p>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl">
                    <img
                      src="/images/weixin.jpg"
                      alt="微信二维码"
                      className="w-64 h-64 object-contain rounded-lg mx-auto"
                    />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    备注：网站访客
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                      在线
                    </span>
                    <span>通常24小时内回复</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
