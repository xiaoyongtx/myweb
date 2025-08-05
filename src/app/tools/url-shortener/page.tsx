'use client';

import { useState } from 'react';

interface ShortUrlResult {
  originalUrl: string;
  shortUrl: string;
  warning?: string;
  createdAt: string;
}

export default function UrlShortener() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [result, setResult] = useState<ShortUrlResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // 生成短链接
  const handleShortenUrl = async () => {
    
    if (!originalUrl.trim()) {
      setError('请输入要缩短的URL');
      return;
    }

    // 简单的URL格式检查
    if (!originalUrl.includes('http://') && !originalUrl.includes('https://')) {
      setError('URL必须包含 http:// 或 https://');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/url-shortener', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: originalUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成短链接失败');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成短链接时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // 备用方案：选择文本
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 清除结果
  const clearResult = () => {
    setResult(null);
    setOriginalUrl('');
    setError('');
    setCopied(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          短链接生成
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          将长URL转换为简短易分享的链接
        </p>
      </div>

      {/* URL输入区域 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                输入要缩短的URL
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com/very/long/url/that/needs/to/be/shortened"
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleShortenUrl()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleShortenUrl}
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {loading ? '生成中...' : '生成短链接'}
                  </button>
                  {result && (
                    <button
                      onClick={clearResult}
                      className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 whitespace-nowrap"
                    >
                      清除
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 结果展示 */}
        {result && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              短链接生成成功！
            </h2>

            {result.warning && (
              <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {result.warning}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* 原始URL */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    原始URL
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-sm text-gray-600 dark:text-gray-400 break-all font-mono">
                    {result.originalUrl}
                  </p>
                </div>
              </div>

              {/* 短链接 */}
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-green-700 dark:text-green-300">
                    短链接
                  </h3>
                  <button
                    onClick={() => copyToClipboard(result.shortUrl)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        已复制
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        复制
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={result.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-lg text-green-600 dark:text-green-400 break-all font-mono hover:underline"
                  >
                    {result.shortUrl}
                  </a>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-300">原始长度</p>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-100">
                    {result.originalUrl.length} 字符
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-300">短链接长度</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-100">
                    {result.shortUrl.length} 字符
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-sm text-purple-600 dark:text-purple-300">节省比例</p>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-100">
                    {Math.round((1 - result.shortUrl.length / result.originalUrl.length) * 100)}%
                  </p>
                </div>
              </div>

              {/* 创建时间 */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                创建时间: {new Date(result.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        )}

      {/* 使用说明 */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          使用说明
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h3 className="font-medium mb-2">基本功能</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>输入完整的URL（必须包含 http:// 或 https://）</li>
              <li>点击"生成短链接"按钮创建短链接</li>
              <li>点击"复制"按钮将短链接复制到剪贴板</li>
              <li>短链接可以直接点击访问原始网址</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">注意事项</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>本工具使用免费的短链接服务</li>
              <li>生成的链接长期有效</li>
              <li>请不要用于恶意网站或违法内容</li>
              <li>支持统计信息和节省比例显示</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>短链接适合社交媒体分享和统计点击量，建议保存原始链接以备不时之需。
          </p>
        </div>
      </div>
    </div>
  );
}