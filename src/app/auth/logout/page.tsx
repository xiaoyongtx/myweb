'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';

export default function LogoutPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      setStatus('loading');
      setMessage('正在退出登录...');
      
      try {
        console.log('Creating Supabase client for logout...');
        const supabase = createSupabaseClient();
        
        // 检查当前会话状态
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Current session before logout:', sessionData.session ? 'Active' : 'None');
        
        // 直接调用Supabase的退出方法
        console.log('Calling supabase.auth.signOut()...');
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Error signing out:', error);
          setStatus('error');
          setMessage(`退出失败: ${error.message}`);
          return;
        }
        
        console.log('Sign out API call successful');
        
        // 检查退出后的会话状态
        const { data: afterLogoutSession } = await supabase.auth.getSession();
        console.log('Session after logout:', afterLogoutSession.session ? 'Still active (problem)' : 'None (good)');
        
        // 清除本地存储
        try {
          console.log('Clearing local storage...');
          localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0] + '-auth-token');
          sessionStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0] + '-auth-token');
          console.log('Local storage cleared');
        } catch (e) {
          console.warn('Could not clear local storage:', e);
        }
        
        setStatus('success');
        setMessage('退出成功！');
        
        // 立即重定向到首页
        console.log('Redirecting to home page...');
        router.push('/');
        router.refresh();
        
      } catch (error) {
        console.error('Exception during logout:', error);
        setStatus('error');
        setMessage(`退出过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };
    
    performLogout();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          退出登录
        </h1>
        
        <div className="mt-8">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div>
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md mb-4">
                <p className="text-green-800 dark:text-green-200">{message}</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  即将返回首页...
                </p>
              </div>
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                立即返回首页
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div>
              <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md mb-4">
                <p className="text-red-800 dark:text-red-200">{message}</p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  重试
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  返回首页
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}