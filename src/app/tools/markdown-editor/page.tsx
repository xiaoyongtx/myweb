'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# 欢迎使用Markdown编辑器\n\n这是一个简单的Markdown编辑器，您可以在左侧输入Markdown文本，右侧将实时显示预览效果。\n\n## 基本语法\n\n### 标题\n\n使用 `#` 创建标题，例如：\n\n# 一级标题\n## 二级标题\n### 三级标题\n\n### 强调\n\n*斜体* 或 _斜体_\n\n**粗体** 或 __粗体__\n\n### 列表\n\n无序列表：\n\n- 项目1\n- 项目2\n- 项目3\n\n有序列表：\n\n1. 第一项\n2. 第二项\n3. 第三项\n\n### 链接和图片\n\n[链接文本](https://example.com)\n\n![图片描述](https://example.com/image.jpg)\n\n### 代码\n\n行内代码：`const example = "hello world";`\n\n代码块：\n\n```javascript\nfunction greeting(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greeting("World"));\n```\n\n### 引用\n\n> 这是一段引用文本。\n> 这是引用的第二行。\n\n### 表格\n\n| 表头1 | 表头2 | 表头3 |\n| ----- | ----- | ----- |\n| 单元格1 | 单元格2 | 单元格3 |\n| 单元格4 | 单元格5 | 单元格6 |\n\n### 水平线\n\n---\n\n## 开始编辑吧！\n\n您可以清除此示例文本，开始编写自己的Markdown内容。');
  const [html, setHtml] = useState('');

  // 简单的Markdown解析函数
  const parseMarkdown = (md: string) => {
    let parsedHtml = md
      // 转义HTML标签
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // 标题
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
      .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
      // 粗体和斜体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // 链接
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      // 图片
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
      // 无序列表
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // 有序列表
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // 代码块
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 引用
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // 水平线
      .replace(/^---$/gm, '<hr>')
      // 段落
      .replace(/^(?!<[^>]+>)(.+)$/gm, '<p>$1</p>');

    // 处理列表
    parsedHtml = parsedHtml.replace(/<li>([\s\S]*?)<\/li>/g, (match) => {
      return match.replace(/<p>(.*?)<\/p>/g, '$1');
    });
    parsedHtml = parsedHtml.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');

    return parsedHtml;
  };

  // 当Markdown内容变化时更新HTML预览
  useEffect(() => {
    setHtml(parseMarkdown(markdown));
  }, [markdown]);

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
          Markdown编辑器
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          编写和预览Markdown文本
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">编辑器</div>
          <textarea
            className="w-full h-[600px] p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="在这里输入Markdown文本..."
          />
        </div>
        <div className="w-full md:w-1/2">
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">预览</div>
          <div
            className="w-full h-[600px] p-4 border border-gray-300 dark:border-gray-700 rounded-md overflow-auto bg-white dark:bg-gray-800 prose prose-indigo dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
      </div>
    </div>
  );
}