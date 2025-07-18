'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';

export default function AuthDebug() {
  const { user, profile, loading } = useUser();
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-md text-xs opacity-50 hover:opacity-100"
      >
        调试
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-md text-xs max-w-xs overflow-auto max-h-60">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">认证状态调试</h3>
        <button onClick={() => setShowDebug(false)}>×</button>
      </div>
      <div>
        <p>加载状态: {loading ? '加载中' : '已完成'}</p>
        <p>用户: {user ? '已登录' : '未登录'}</p>
        {user && (
          <>
            <p>用户ID: {user.id.substring(0, 8)}...</p>
            <p>邮箱: {user.email}</p>
          </>
        )}
        <p>个人资料: {profile ? '已加载' : '未加载'}</p>
        {profile && (
          <>
            <p>用户名: {profile.username || '未设置'}</p>
            <p>头像: {profile.avatar_url ? '已设置' : '未设置'}</p>
          </>
        )}
      </div>
    </div>
  );
}