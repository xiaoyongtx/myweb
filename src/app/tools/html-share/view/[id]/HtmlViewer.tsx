'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface HtmlShare {
  id: string;
  title: string;
  html_content: string;
  description: string | null;
  is_public: boolean;
  view_count: number;
  created_at: string;
  user_id: string;
}

interface HtmlViewerProps {
  share: HtmlShare;
}

export default function HtmlViewer({ share }: HtmlViewerProps) {
  const [viewUpdated, setViewUpdated] = useState(false);
  const supabase = createSupabaseClient();

  // 更新浏览次数
  useEffect(() => {
    const updateViewCount = async () => {
      if (viewUpdated) return;
      
      try {
        await supabase
          .from('html_shares')
          .update({ view_count: share.view_count + 1 })
          .eq('id', share.id);
        
        setViewUpdated(true);
      } catch (error) {
        console.error('更新浏览次数失败:', error);
      }
    };

    updateViewCount();
  }, [share.id, share.view_count, viewUpdated, supabase]);

  // 复制分享链接
  const copyShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('分享链接已复制到剪贴板');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部信息栏 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {share.title}
              </h1>
              {share.description && (
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {share.description}
                </p>
              )}
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  浏览 {share.view_count + (viewUpdated ? 1 : 0)} 次
                </span>
                <span>
                  发布于 {new Date(share.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={copyShareLink}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制链接
              </button>
              
              <Link
                href="/tools/html-share"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                创建我的分享
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* HTML内容展示区域 */}
      <div className="flex-1">
        <iframe
          srcDoc={share.html_content}
          className="w-full h-screen border-0"
          title={share.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          style={{ height: 'calc(100vh - 120px)' }}
        />
      </div>

      {/* 底部工具栏 */}
      <div className="fixed bottom-4 right-4 flex items-center space-x-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              由 HTML分享工具 提供支持
            </span>
            <Link
              href="/tools/html-share"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
            >
              创建你的分享
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}