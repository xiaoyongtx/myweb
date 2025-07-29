'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function JsonFormatter() {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState('2');

  const validateJson = () => {
    setError('');
    try {
      JSON.parse(jsonInput);
      setError('✓ JSON 有效');
      return true;
    } catch (e: unknown) {
      setError('错误: ' + (e as Error).message);
      return false;
    }
  };

  const formatJson = () => {
    if (!validateJson()) return;
    
    try {
      const parsed = JSON.parse(jsonInput);
      const indentValue = indent === '\t' ? '\t' : parseInt(indent);
      setJsonOutput(JSON.stringify(parsed, null, indentValue));
    } catch (e: unknown) {
      setError('格式化错误: ' + (e as Error).message);
    }
  };

  const minifyJson = () => {
    if (!validateJson()) return;
    
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
    } catch (e: unknown) {
      setError('压缩错误: ' + (e as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/tools"
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ← 返回工具箱
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          JSON 格式化
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          格式化和验证 JSON 数据
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">JSON 输入</div>
          <textarea
            className="w-full h-96 p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="请输入JSON数据..."
          />
          <div className="flex gap-2 mt-2">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={validateJson}
            >
              校验
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={formatJson}
            >
              格式化
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={minifyJson}
            >
              压缩
            </button>
            <select
              className="px-2 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
              value={indent}
              onChange={(e) => setIndent(e.target.value)}
            >
              <option value="2">缩进: 2空格</option>
              <option value="4">缩进: 4空格</option>
              <option value="\t">缩进: 制表符</option>
            </select>
          </div>
          {error && (
            <div className={`mt-2 ${error.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {error}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2">
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">格式化结果</div>
          <textarea
            className="w-full h-96 p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
            value={jsonOutput}
            readOnly
          />
        </div>
      </div>

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
            <h3 className="font-medium mb-2">主要功能</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>校验：</strong>检查JSON语法是否正确</li>
              <li><strong>格式化：</strong>美化JSON结构，便于阅读</li>
              <li><strong>压缩：</strong>移除空格和换行，减小文件大小</li>
              <li>支持自定义缩进格式</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">使用技巧</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>粘贴JSON数据到左侧输入框</li>
              <li>先点击"校验"检查语法</li>
              <li>选择合适的缩进格式</li>
              <li>点击"格式化"或"压缩"处理数据</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>格式化后的JSON更易于阅读和调试，压缩后的JSON适合网络传输和存储。
          </p>
        </div>
      </div>
    </div>
  );
}