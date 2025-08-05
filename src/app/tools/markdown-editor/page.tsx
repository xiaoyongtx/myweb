'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`# 欢迎使用Markdown编辑器

这是一个功能完整的Markdown编辑器，支持实时预览、文件下载和内容复制。您可以直接修改下面的示例内容，或者清空后编写自己的文档。

## 基本语法

### 标题

使用 \`#\` 创建标题，例如：

# 一级标题
## 二级标题
### 三级标题

### 强调

*斜体* 或 _斜体_

**粗体** 或 __粗体__

### 列表

无序列表：

- 项目1
- 项目2
- 项目3

有序列表：

1. 第一项
2. 第二项
3. 第三项

### 链接和图片

[链接文本](https://example.com)

![图片描述](https://via.placeholder.com/300x200?text=示例图片)

### 代码

行内代码：\`const example = "hello world";\`

代码块：

\`\`\`javascript
// JavaScript 示例
function greeting(name) {
  return \`Hello, \${name}!\`;
}

const message = greeting("World");
console.log(message); // 输出: Hello, World!
\`\`\`

\`\`\`python
# Python 示例
def calculate_sum(numbers):
    """计算数字列表的总和"""
    return sum(numbers)

numbers = [1, 2, 3, 4, 5]
result = calculate_sum(numbers)
print(f"总和: {result}")  # 输出: 总和: 15
\`\`\`

### 引用

> 这是一段引用文本。
> 这是引用的第二行。

### 表格

| 功能 | 描述 | 状态 |
| --- | --- | --- |
| 标题 | 支持1-6级标题 | ✅ 完成 |
| 列表 | 有序和无序列表 | ✅ 完成 |
| 链接 | 外部链接支持 | ✅ 完成 |
| 代码 | 行内和代码块 | ✅ 完成 |

### 水平线

---

## 开始编辑吧！

您可以清除此示例文本，开始编写自己的Markdown内容。`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Markdown编辑
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          编写和预览Markdown文本
        </p>
      </div>



      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2">
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">编辑器</div>
          <textarea
            className="w-full h-[600px] p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white font-mono text-sm resize-none"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="在这里输入Markdown文本..."
          />
        </div>

        <div className="w-full lg:w-1/2">
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">预览</div>
          <div className="w-full h-[600px] p-4 border border-gray-300 dark:border-gray-700 rounded-md overflow-auto bg-white dark:bg-gray-800">
            <div className="prose prose-indigo dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ src, alt }) => (
                    <img
                      src={src}
                      alt={alt}
                      className="max-w-full h-auto rounded-md shadow-sm"
                      loading="lazy"
                    />
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');

                    return match ? (
                      <code className={`${className} text-sm font-mono leading-relaxed`} {...props}>
                        {children}
                      </code>
                    ) : (
                      <code
                        className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-4 rounded-lg my-4 overflow-x-auto border border-slate-200 dark:border-slate-600 text-sm font-mono leading-relaxed">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-6 pr-4 py-3 italic text-blue-800 dark:text-blue-200 my-6 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="my-6 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr>
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {children}
                    </td>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700 dark:text-gray-300">
                      {children}
                    </li>
                  ),
                  hr: () => (
                    <div className="my-8 flex items-center">
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
                      <div className="mx-4">
                        <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      </div>
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
                    </div>
                  )
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          onClick={() => {
            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'markdown-content.md';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          下载Markdown文件
        </button>

        <button
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          onClick={() => {
            navigator.clipboard.writeText(markdown).then(() => {
              alert('Markdown内容已复制到剪贴板！');
            }).catch(() => {
              alert('复制失败，请手动复制内容。');
            });
          }}
        >
          复制内容
        </button>

        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          onClick={() => {
            if (confirm('确定要清空编辑器内容吗？')) {
              setMarkdown('');
            }
          }}
        >
          清空内容
        </button>
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
            <h3 className="font-medium mb-2">基本功能</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>左侧编辑器输入Markdown文本</li>
              <li>右侧实时预览渲染效果</li>
              <li>支持标准Markdown语法</li>
              <li>支持表格、代码块等扩展语法</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">快捷操作</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>下载：保存为.md文件</li>
              <li>复制：复制内容到剪贴板</li>
              <li>清空：清除所有编辑内容</li>
              <li>支持深色/浅色主题切换</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>编辑器已预置常用Markdown语法示例，您可以直接修改或清空后重新编写。
          </p>
        </div>
      </div>
    </div>
  );
}