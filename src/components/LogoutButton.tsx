'use client';

import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  onLogout?: () => void;
}

export default function LogoutButton({ 
  className, 
  children = '退出登录',
  onLogout
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // 确保只在客户端执行
      if (typeof window !== 'undefined') {
        // 1. 清除所有localStorage中的Supabase相关项
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // 2. 清除所有sessionStorage中的Supabase相关项
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
        
        // 3. 清除所有cookie
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      }
      
      // 4. 调用可选的onLogout回调
      if (onLogout) {
        onLogout();
      }
      
      // 5. 强制刷新页面并重定向到首页
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // 即使出错也重定向到首页
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className || "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"}
    >
      {isLoggingOut ? '退出中...' : children}
    </button>
  );
}