'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useUser();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut();
        
        // 清除所有localStorage中的Supabase相关项
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // 清除所有sessionStorage中的Supabase相关项
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
        
        // 清除所有cookie
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        
        // 重定向到首页
        window.location.href = '/';
      } catch (error) {
        console.error('Error during logout:', error);
        // 即使出错也重定向到首页
        window.location.href = '/';
      }
    };
    
    performLogout();
  }, [signOut]);

  // 显示一个简单的加载状态
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">正在退出登录...</p>
      </div>
    </div>
  );
}