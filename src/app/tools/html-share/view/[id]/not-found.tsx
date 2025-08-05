import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            页面不存在
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            抱歉，您访问的HTML分享页面不存在或已被删除。
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            可能的原因：
          </p>
          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <li>• 分享链接已过期或被删除</li>
            <li>• 分享设置为私有，只有作者可以访问</li>
            <li>• 链接地址输入错误</li>
          </ul>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/tools/html-share"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            创建HTML分享
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            返回工具库
          </Link>
        </div>
      </div>
    </div>
  );
}