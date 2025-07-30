import { Metadata } from 'next';
import CodeFormatterClient from './CodeFormatterClient';
import { generateToolMetadata } from '@/lib/tool-seo';
import RelatedTools, { Breadcrumb } from '@/components/SEOComponents';

export const metadata: Metadata = generateToolMetadata('code-formatter');

export default function CodeFormatterPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 面包屑导航 */}
      <Breadcrumb 
        items={[
          { label: '首页', href: '/' },
          { label: '工具箱', href: '/tools' },
          { label: '代码格式化工具' }
        ]}
        className="mb-8"
      />
      
      {/* SEO优化的页面标题和描述 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          专业在线代码格式化工具
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          支持JavaScript、HTML、CSS、JSON等20+编程语言的免费在线代码美化工具
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">JavaScript格式化</span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">HTML美化</span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">CSS整理</span>
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">JSON格式化</span>
        </div>
      </div>
      
      <CodeFormatterClient />
      
      {/* SEO内容部分 */}
      <div className="mt-16 space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">如何使用代码格式化工具</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="text-blue-600 font-bold text-lg mb-2">1. 粘贴代码</div>
              <p className="text-gray-600 dark:text-gray-300">将需要格式化的代码粘贴到左侧编辑框中</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="text-green-600 font-bold text-lg mb-2">2. 选择语言</div>
              <p className="text-gray-600 dark:text-gray-300">选择对应的编程语言类型</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="text-purple-600 font-bold text-lg mb-2">3. 一键格式化</div>
              <p className="text-gray-600 dark:text-gray-300">点击格式化按钮，获得美化后的代码</p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">功能特色</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">支持多种编程语言</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• JavaScript / TypeScript 代码格式化</li>
                <li>• HTML 标签美化和缩进</li>
                <li>• CSS 样式代码整理</li>
                <li>• JSON 数据格式化</li>
                <li>• XML 文档结构化</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">专业格式化功能</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• 智能缩进和对齐</li>
                <li>• 语法高亮显示</li>
                <li>• 错误检测提醒</li>
                <li>• 一键复制结果</li>
                <li>• 完全免费使用</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">常见问题</h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">为什么我的代码格式化后还是有问题？</h3>
              <p className="text-gray-600 dark:text-gray-300">本工具提供基础的代码格式化功能，对于复杂的代码结构建议使用专业IDE如VS Code等进行格式化。</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">支持哪些编程语言？</h3>
              <p className="text-gray-600 dark:text-gray-300">目前支持JavaScript、TypeScript、JSON、HTML、CSS、Python、Java、C#、PHP等主流编程语言的基础格式化。</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">代码会被保存吗？</h3>
              <p className="text-gray-600 dark:text-gray-300">不会，所有代码处理都在浏览器本地完成，不会上传到服务器，保证代码安全性。</p>
            </div>
          </div>
        </section>

        {/* 相关工具推荐 */}
        <RelatedTools currentTool="code-formatter" />
      </div>
    </div>
  );
}