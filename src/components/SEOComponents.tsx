import Link from 'next/link';

// 相关工具推荐配置
const relatedTools = {
  'code-formatter': [
    { id: 'json-formatter', name: 'JSON格式化', description: '格式化JSON数据' },
    { id: 'markdown-editor', name: 'Markdown编辑器', description: '编辑Markdown文档' },
    { id: 'color-picker', name: '颜色选择器', description: '选择和转换颜色代码' },
  ],
  'json-formatter': [
    { id: 'code-formatter', name: '代码格式化', description: '格式化多种编程语言' },
    { id: 'timestamp-converter', name: '时间戳转换', description: '时间戳与日期互转' },
    { id: 'url-shortener', name: 'URL短链', description: '生成短链接' },
  ],
  'ip-lookup': [
    { id: 'url-shortener', name: 'URL短链', description: '生成短链接' },
    { id: 'timestamp-converter', name: '时间戳转换', description: '时间戳与日期互转' },
    { id: 'password-generator', name: '密码生成器', description: '生成安全密码' },
  ],
  'image-compressor': [
    { id: 'image-merger', name: '图片合并', description: '合并多张图片' },
    { id: 'image-splitter', name: '图片分割', description: '分割图片' },
    { id: 'image-watermark', name: '图片加水印', description: '为图片添加水印' },
  ],
  'image-watermark': [
    { id: 'image-compressor', name: '图片压缩', description: '压缩图片大小' },
    { id: 'image-merger', name: '图片合并', description: '合并多张图片' },
    { id: 'image-to-pdf', name: '图片转PDF', description: '将图片转换为PDF' },
  ],
  'image-splitter': [
    { id: 'image-merger', name: '图片合并', description: '合并多张图片' },
    { id: 'image-watermark', name: '图片加水印', description: '为图片添加水印' },
    { id: 'image-compressor', name: '图片压缩', description: '压缩图片大小' },
  ],
  'qr-generator': [
    { id: 'qr-batch-generator', name: '批量二维码', description: '批量生成二维码' },
    { id: 'password-generator', name: '密码生成器', description: '生成安全密码' },
    { id: 'url-shortener', name: 'URL短链', description: '生成短链接' },
  ],
};

interface RelatedToolsProps {
  currentTool: string;
  className?: string;
}

export default function RelatedTools({ currentTool, className = '' }: RelatedToolsProps) {
  const tools = relatedTools[currentTool as keyof typeof relatedTools] || [];
  
  if (tools.length === 0) return null;

  return (
    <section className={`${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">相关工具推荐</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}`}
            className="group bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {tool.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {tool.description}
            </p>
            <div className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
              立即使用 →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// 面包屑导航组件
interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 ${className}`} aria-label="面包屑导航">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-indigo-600 dark:hover:text-indigo-400">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

// 热门工具组件
const popularTools = [
  { id: 'code-formatter', name: '代码格式化', icon: '💻', usage: '使用最多' },
  { id: 'json-formatter', name: 'JSON格式化', icon: '📄', usage: '开发必备' },
  { id: 'ip-lookup', name: 'IP查询', icon: '🌐', usage: '网络工具' },
  { id: 'image-compressor', name: '图片压缩', icon: '🖼️', usage: '效率工具' },
  { id: 'qr-generator', name: '二维码生成', icon: '📱', usage: '实用工具' },
  { id: 'password-generator', name: '密码生成', icon: '🔐', usage: '安全工具' },
];

export function PopularTools({ className = '' }: { className?: string }) {
  return (
    <section className={className}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">热门工具</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {popularTools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}`}
            className="group flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
          >
            <span className="text-2xl mr-3">{tool.icon}</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {tool.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{tool.usage}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}