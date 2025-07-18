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
          JSON 格式化工具
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
    </div>
  );
}