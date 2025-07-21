'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';

export default function AuthDebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseClient();
        
        // 获取当前会话
        const { data: { session } } = await supabase.auth.getSession();
        
        // 获取环境变量信息（安全地）
        const envInfo = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        };
        
        setSessionInfo(session);
        setEnvInfo(envInfo);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleForceLogout = () => {
    try {
      // 清除所有本地存储
      localStorage.clear();
      sessionStorage.clear();
      
      // 清除所有cookie
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      // 刷新页面
      window.location.reload();
    } catch (error) {
      console.error('Error during force logout:', error);
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
          认证调试
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          检查当前的认证状态和环境变量
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  会话信息
                </h3>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto text-sm">
                  {sessionInfo ? JSON.stringify(sessionInfo, null, 2) : '无会话'}
                </pre>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                  登录状态
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {sessionInfo ? '已登录' : '未登录'}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  环境变量
                </h3>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(envInfo, null, 2)}
                </pre>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  操作
                </h3>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <button
                    onClick={handleForceLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    强制退出（清除所有存储）
                  </button>
                  
                  <div>
                    <Link
                      href="/auth/simple-logout"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      简易退出页面
                    </Link>
                  </div>
                  
                  <div>
                    <Link
                      href="/auth/logout"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      标准退出页面
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}