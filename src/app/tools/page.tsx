import Link from 'next/link';

// 模拟工具数据
const tools = [
  {
    id: 'markdown-editor',
    name: 'Markdown编辑器',
    description: '一个简单易用的Markdown编辑器，支持实时预览和常用Markdown语法。',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    id: 'json-formatter',
    name: 'JSON格式化工具',
    description: '格式化和验证JSON数据，使其更易于阅读和编辑。',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    ),
    component: 'json-formatter',
  },
  {
    id: 'color-picker',
    name: '颜色选择器',
    description: '一个简单的颜色选择工具，支持HEX、RGB和HSL格式。',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
  },
  {
    id: 'password-generator',
    name: '密码生成器',
    description: '生成安全、随机的密码，可自定义长度和字符类型。',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  {
    id: 'image-compressor',
    name: '图片压缩工具',
    description: '压缩图片文件大小，同时保持良好的图片质量。',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'code-formatter',
    name: '代码格式化工具',
    description: '格式化各种编程语言的代码，使其更易于阅读和维护。',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
  },
];

export default function Tools() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          工具箱
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          各种实用的在线工具，提高您的工作效率
        </p>
      </div>

      <div className="mt-12 max-w-lg mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}`}
            className="flex flex-col rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105"
          >
            <div className="flex-1 bg-white dark:bg-gray-800 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                  {tool.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {tool.name}
                </h3>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                  {tool.description}
                </p>
              </div>
              <div className="mt-6">
                <div className="text-base font-medium text-indigo-600 dark:text-indigo-400">
                  使用工具 →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          更多工具正在开发中，敬请期待！
        </p>
      </div>
    </div>
  );
}