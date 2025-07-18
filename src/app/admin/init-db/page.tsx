'use client';

import { useState } from 'react';
import { initializeSupabaseSchema } from '@/lib/initSupabase';
import Link from 'next/link';

export default function InitDbPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInitDb = async () => {
    setStatus('loading');
    setMessage('正在初始化数据库...');
    
    try {
      const result = await initializeSupabaseSchema();
      
      if (result) {
        setStatus('success');
        setMessage('数据库初始化成功！现在您可以使用个人资料功能了。');
      } else {
        setStatus('error');
        setMessage('数据库初始化失败，请查看控制台获取详细错误信息。');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      setStatus('error');
      setMessage(`数据库初始化出错: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ← 返回首页
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          数据库初始化
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          初始化Supabase数据库架构，创建必要的表和存储桶
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-6">
          <div className="text-center">
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              如果您在使用个人资料功能时遇到问题，可能是因为数据库架构尚未初始化。
              点击下面的按钮初始化数据库架构。
            </p>
            
            {status === 'idle' && (
              <button
                onClick={handleInitDb}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                初始化数据库
              </button>
            )}
            
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p>{message}</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="text-green-600 dark:text-green-400">
                <svg className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-lg font-medium">{message}</p>
                <div className="mt-6">
                  <Link
                    href="/profile"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    前往个人资料页面
                  </Link>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="text-red-600 dark:text-red-400">
                <svg className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-lg font-medium">{message}</p>
                <button
                  onClick={handleInitDb}
                  className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  重试
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">手动初始化说明</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            如果自动初始化失败，您可以在Supabase控制台中手动执行以下SQL脚本：
          </p>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto">
            <pre className="text-sm text-gray-800 dark:text-gray-300">
              {`-- 创建profiles表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 启用行级安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own profile" 
  ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}