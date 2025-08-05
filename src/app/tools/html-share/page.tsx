'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { createSupabaseClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface HtmlShare {
  id: string;
  title: string;
  html_content: string;
  description: string | null;
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export default function HtmlShareTool() {
  const { user, loading } = useUser();
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的HTML页面</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .highlight {
            background-color: #f0f8ff;
            padding: 10px;
            border-left: 4px solid #007acc;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>欢迎使用HTML分享工具</h1>
    <div class="highlight">
        <p>这是一个示例HTML页面。你可以在左侧编辑器中修改HTML代码，右侧会实时预览效果。</p>
    </div>
    <p>支持的功能：</p>
    <ul>
        <li>实时预览HTML效果</li>
        <li>保存并分享你的HTML页面</li>
        <li>支持CSS样式和JavaScript脚本</li>
        <li>响应式设计支持</li>
    </ul>
    
    <script>
        console.log('HTML分享工具加载完成！');
    </script>
</body>
</html>`);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [myShares, setMyShares] = useState<HtmlShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  
  const previewRef = useRef<HTMLIFrameElement>(null);
  const supabase = createSupabaseClient();

  // 实时预览更新
  useEffect(() => {
    if (previewRef.current) {
      const iframe = previewRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  // 加载用户的分享列表
  const loadMyShares = async () => {
    if (!user) return;
    
    setLoadingShares(true);
    try {
      const { data, error } = await supabase
        .from('html_shares')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyShares(data || []);
    } catch (error) {
      console.error('加载分享列表失败:', error);
      toast.error('加载分享列表失败');
    } finally {
      setLoadingShares(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMyShares();
    }
  }, [user]);

  // 发布HTML分享
  const handlePublish = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (!title.trim()) {
      toast.error('请输入标题');
      return;
    }

    if (!htmlContent.trim()) {
      toast.error('请输入HTML内容');
      return;
    }

    setIsPublishing(true);
    try {
      const { data, error } = await supabase
        .from('html_shares')
        .insert({
          user_id: user.id,
          title: title.trim(),
          html_content: htmlContent,
          description: description.trim() || null,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('发布成功！');
      setTitle('');
      setDescription('');
      loadMyShares();
      
      // 复制分享链接到剪贴板
      const shareUrl = `${window.location.origin}/tools/html-share/view/${data.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('分享链接已复制到剪贴板');
      
    } catch (error) {
      console.error('发布失败:', error);
      toast.error('发布失败，请重试');
    } finally {
      setIsPublishing(false);
    }
  };

  // 删除分享
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分享吗？')) return;

    try {
      const { error } = await supabase
        .from('html_shares')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('删除成功');
      loadMyShares();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  // 复制分享链接
  const copyShareLink = (id: string) => {
    const shareUrl = `${window.location.origin}/tools/html-share/view/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('分享链接已复制到剪贴板');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 如果用户未登录，显示登录提示
  if (!loading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            HTML分享工具
          </h1>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
            编写HTML代码，实时预览效果，一键分享给他人
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">需要登录</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              请先登录以使用HTML分享工具
            </p>
            <Link
              href={`/auth/login?redirect=${encodeURIComponent('/tools/html-share')}`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HTML分享工具</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              编写HTML代码，实时预览效果，一键分享给他人
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/tools/html-share/help"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              使用说明
            </Link>
            <Link
              href="/tools/html-share/browse"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              浏览公开分享
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* HTML编辑器 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">HTML编辑器</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {htmlContent.length} 字符
            </div>
          </div>
          
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="在这里输入你的HTML代码..."
            spellCheck={false}
            style={{
              lineHeight: '1.5',
              tabSize: 2,
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace'
            }}
          />
        </div>

        {/* 实时预览 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">实时预览</h2>
          
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <iframe
              ref={previewRef}
              className="w-full h-96 bg-white"
              title="HTML预览"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* 发布设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">发布设置</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="给你的HTML页面起个标题"
              maxLength={100}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              可见性
            </label>
            <select
              value={isPublic ? 'public' : 'private'}
              onChange={(e) => setIsPublic(e.target.value === 'public')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="public">公开 - 任何人都可以访问</option>
              <option value="private">私有 - 只有你可以访问</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            描述（可选）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="简单描述一下这个HTML页面的内容"
            rows={3}
            maxLength={500}
          />
        </div>
        
        <button
          onClick={handlePublish}
          disabled={isPublishing || !title.trim() || !htmlContent.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              发布中...
            </>
          ) : (
            '发布分享'
          )}
        </button>
      </div>

      {/* 我的分享列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">我的分享</h2>
        </div>
        
        <div className="p-6">
          {loadingShares ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">加载中...</p>
            </div>
          ) : myShares.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">还没有分享任何HTML页面</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myShares.map((share) => (
                <div key={share.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {share.title}
                      </h3>
                      {share.description && (
                        <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                          {share.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {share.is_public ? '公开' : '私有'}
                        </span>
                        <span>
                          浏览 {share.view_count} 次
                        </span>
                        <span>
                          {new Date(share.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/tools/html-share/view/${share.id}`}
                        target="_blank"
                        className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        预览
                      </Link>
                      <button
                        onClick={() => copyShareLink(share.id)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        复制链接
                      </button>
                      <button
                        onClick={() => handleDelete(share.id)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}