'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
  updated_at: string;
}

export default function BrowseHtmlShares() {
  const [shares, setShares] = useState<HtmlShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'view_count'>('created_at');
  
  // 加载公开的分享列表
  const loadShares = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('html_shares')
        .select('*')
        .eq('is_public', true);

      // 排序
      if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('view_count', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error('加载分享列表失败:', error);
      toast.error('加载分享列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
  }, [sortBy]);

  // 过滤分享
  const filteredShares = shares.filter(share => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      share.title.toLowerCase().includes(query) ||
      (share.description && share.description.toLowerCase().includes(query))
    );
  });

  // 复制分享链接
  const copyShareLink = (id: string) => {
    const shareUrl = `${window.location.origin}/tools/html-share/view/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('分享链接已复制到剪贴板');
  };

  // 获取HTML内容预览
  const getPreviewText = (htmlContent: string) => {
    // 移除HTML标签，获取纯文本预览
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">浏览HTML分享</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          发现其他用户分享的精彩HTML页面
        </p>
      </div>

      {/* 搜索和排序 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 dark:text-white"
              placeholder="搜索标题或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'created_at' | 'view_count')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="created_at">按发布时间</option>
            <option value="view_count">按浏览次数</option>
          </select>
          
          <Link
            href="/tools/html-share"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            创建分享
          </Link>
        </div>
      </div>

      {/* 分享列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">加载中...</p>
        </div>
      ) : filteredShares.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {searchQuery ? '没有找到相关分享' : '还没有公开的分享'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery ? '尝试使用不同的关键词搜索' : '成为第一个分享HTML页面的用户吧！'}
          </p>
          <div className="mt-6">
            <Link
              href="/tools/html-share"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              创建HTML分享
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShares.map((share) => (
            <div
              key={share.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-2">
                      {share.title}
                    </h3>
                    {share.description && (
                      <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                        {share.description}
                      </p>
                    )}
                    
                    {/* HTML内容预览 */}
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {getPreviewText(share.html_content)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {share.view_count}
                    </span>
                    <span>
                      {new Date(share.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center space-x-2">
                  <Link
                    href={`/tools/html-share/view/${share.id}`}
                    target="_blank"
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    查看
                  </Link>
                  <button
                    onClick={() => copyShareLink(share.id)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 搜索结果提示 */}
      {searchQuery && filteredShares.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            找到 <span className="font-semibold text-indigo-600 dark:text-indigo-400">{filteredShares.length}</span> 个相关分享
          </p>
        </div>
      )}
    </div>
  );
}