'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CodeFormatter() {
  const [code, setCode] = useState('');
  const [formattedCode, setFormattedCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [error, setError] = useState('');

  const formatCode = () => {
    setError('');
    
    try {
      // Simple formatting for JavaScript/JSON
      if (language === 'javascript' || language === 'json') {
        const parsed = language === 'json' 
          ? JSON.parse(code)
          : (() => {
              try {
                return JSON.parse(code); // Try parsing as JSON first
              } catch {
                return code; // Fall back to original code
              }
            })();
        
        const formatted = language === 'json'
          ? JSON.stringify(parsed, null, 2)
          : code;
        
        setFormattedCode(formatted);
      } else {
        // For other languages, just indent with 2 spaces for now
        const lines = code.split('\n');
        let indent = 0;
        const formattedLines = lines.map(line => {
          // Very basic indentation logic
          if (line.includes('}') || line.includes(')') || line.includes('end')) {
            indent = Math.max(0, indent - 2);
          }
          
          const formattedLine = ' '.repeat(indent) + line.trim();
          
          if (line.includes('{') || line.includes('(') || line.match(/\b(begin|do|then)\b/)) {
            indent += 2;
          }
          
          return formattedLine;
        });
        
        setFormattedCode(formattedLines.join('\n'));
      }
    } catch (e: unknown) {
      setError(`格式化错误: ${(e as Error).message}`);
      setFormattedCode('');
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
          代码格式化工具
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          格式化各种编程语言的代码，使其更易于阅读和维护
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              选择语言
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="json">JSON</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="php">PHP</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                原始代码
              </label>
              <textarea
                className="w-full h-64 p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="在此粘贴您的代码..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                格式化后的代码
              </label>
              <textarea
                className="w-full h-64 p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
                value={formattedCode}
                readOnly
                placeholder="格式化结果将显示在这里..."
              />
            </div>
          </div>

          {error && (
            <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <button
              onClick={formatCode}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              格式化代码
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}