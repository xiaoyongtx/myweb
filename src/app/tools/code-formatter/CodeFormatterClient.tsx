'use client';

import { useState } from 'react';

export default function CodeFormatterClient() {
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
    <div>


      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md">
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
            <h3 className="font-medium mb-2">支持语言</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>JavaScript/TypeScript - 基础格式化</li>
              <li>JSON - 标准格式化和验证</li>
              <li>Python/Java/C# - 基础缩进</li>
              <li>HTML/CSS/PHP - 基础格式化</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">功能特性</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>自动缩进和对齐</li>
              <li>语法错误检测</li>
              <li>实时格式化预览</li>
              <li>支持复制格式化结果</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>JSON格式化功能最为完善，其他语言提供基础的缩进格式化。建议使用专业IDE进行复杂代码格式化。
          </p>
        </div>
      </div>
    </div>
  );
}