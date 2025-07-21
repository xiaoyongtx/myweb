'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SimpleLogoutPage() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  // 直接使用浏览器API清除所有存储
  const handleLogout = () => {
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
      
      setMessage('存储已清除，点击返回首页');
      
      // 刷新页面
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error during logout:', error);
      setMessage('退出时出错，请尝试刷新页面');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
          简易退出登录
        </h1>
        
        {message ? (
          <div className="mb-8">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md">
              <p className="text-green-800 dark:text-green-200">{message}</p>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              点击下面的按钮清除所有登录信息
            </p>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              清除登录信息
            </button>
          </div>
        )}
        
        <div className="mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}