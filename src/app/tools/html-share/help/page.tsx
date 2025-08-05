import Link from 'next/link';

export default function HtmlShareHelp() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HTML分享工具使用说明</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          了解如何使用HTML分享工具创建和分享你的HTML页面
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 space-y-8">
          {/* 功能介绍 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">功能介绍</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400">
                HTML分享工具是一个在线HTML编辑器和分享平台，让你可以：
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>在线编写HTML、CSS和JavaScript代码</li>
                <li>实时预览你的HTML页面效果</li>
                <li>一键发布并生成分享链接</li>
                <li>设置分享的可见性（公开或私有）</li>
                <li>浏览其他用户的公开分享</li>
                <li>管理你的所有分享内容</li>
              </ul>
            </div>
          </section>

          {/* 使用步骤 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">使用步骤</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">登录账户</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    首先需要登录你的账户才能使用HTML分享功能。如果还没有账户，请先注册。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">编写HTML代码</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    在左侧的HTML编辑器中输入你的HTML代码。支持完整的HTML、CSS和JavaScript语法。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">实时预览</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    右侧的预览窗口会实时显示你的HTML页面效果，方便你随时调整代码。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">设置分享信息</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    填写标题、描述，选择可见性（公开或私有），然后点击"发布分享"按钮。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  5
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">分享链接</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    发布成功后，分享链接会自动复制到剪贴板，你可以将链接分享给其他人。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 代码示例 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">代码示例</h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                以下是一个简单的HTML页面示例：
              </p>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                <code className="text-gray-800 dark:text-gray-200">{`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的第一个HTML页面</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .button {
            background: #ff6b6b;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .button:hover {
            background: #ff5252;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>欢迎来到我的页面</h1>
        <p>这是一个使用HTML分享工具创建的页面。</p>
        <button class="button" onclick="showMessage()">点击我</button>
        <p id="message" style="margin-top: 20px;"></p>
    </div>
    
    <script>
        function showMessage() {
            document.getElementById('message').innerHTML = 
                '🎉 恭喜你！你已经成功创建了一个交互式HTML页面！';
        }
    </script>
</body>
</html>`}</code>
              </pre>
            </div>
          </section>

          {/* 注意事项 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">注意事项</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    安全提醒
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>HTML内容在沙盒环境中运行，具有一定的安全限制</li>
                      <li>不要在HTML中包含恶意代码或敏感信息</li>
                      <li>公开分享的内容任何人都可以访问，请谨慎分享</li>
                      <li>私有分享只有你自己可以访问</li>
                      <li>建议定期备份重要的HTML代码</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 常见问题 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">常见问题</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Q: 支持哪些HTML功能？
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A: 支持完整的HTML5、CSS3和JavaScript功能，包括响应式设计、动画效果、交互功能等。
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Q: 分享链接会过期吗？
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A: 分享链接不会过期，只要你不删除分享内容，链接就会一直有效。
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Q: 可以编辑已发布的分享吗？
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A: 目前不支持编辑已发布的分享，如需修改请重新创建分享。
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Q: 有内容长度限制吗？
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A: HTML内容没有严格的长度限制，但建议保持合理的大小以确保良好的加载性能。
                </p>
              </div>
            </div>
          </section>

          {/* 开始使用 */}
          <section className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">开始使用</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              现在就开始创建你的第一个HTML分享吧！
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/tools/html-share"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                开始创建
              </Link>
              <Link
                href="/tools/html-share/browse"
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                浏览分享
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}