'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';

export default function ManualSetupPage() {
  const { user, refreshProfile } = useUser();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const [stepStatus, setStepStatus] = useState<Record<number, 'idle' | 'loading' | 'success' | 'error'>>({
    1: 'idle',
    2: 'idle',
    3: 'idle'
  });

  // 步骤1：检查用户是否已登录
  const checkUser = () => {
    setStepStatus({ ...stepStatus, 1: 'loading' });
    
    if (!user) {
      setStepStatus({ ...stepStatus, 1: 'error' });
      setMessage('您需要先登录才能继续');
      return false;
    }
    
    setStepStatus({ ...stepStatus, 1: 'success' });
    setStep(2);
    return true;
  };

  // 步骤2：直接创建个人资料
  const createProfile = async () => {
    if (!user) return;
    
    setStepStatus({ ...stepStatus, 2: 'loading' });
    
    try {
      const supabase = createSupabaseClient();
      
      // 直接插入个人资料
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            username: user.email?.split('@')[0] || null,
            avatar_url: null,
            updated_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) {
        console.error('Error creating profile:', error);
        setStepStatus({ ...stepStatus, 2: 'error' });
        setMessage(`创建个人资料失败: ${error.message}`);
        return;
      }
      
      setStepStatus({ ...stepStatus, 2: 'success' });
      setStep(3);
    } catch (error) {
      console.error('Exception creating profile:', error);
      setStepStatus({ ...stepStatus, 2: 'error' });
      setMessage(`创建个人资料出错: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 步骤3：刷新个人资料
  const refreshUserProfile = async () => {
    setStepStatus({ ...stepStatus, 3: 'loading' });
    
    try {
      await refreshProfile();
      setStepStatus({ ...stepStatus, 3: 'success' });
      setStatus('success');
      setMessage('个人资料设置完成！');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setStepStatus({ ...stepStatus, 3: 'error' });
      setStatus('error');
      setMessage(`刷新个人资料失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 执行所有步骤
  const handleSetup = async () => {
    setStatus('loading');
    setMessage('正在设置个人资料...');
    
    // 步骤1：检查用户
    if (!checkUser()) return;
    
    // 步骤2：创建个人资料
    await createProfile();
    
    // 步骤3：刷新个人资料
    await refreshUserProfile();
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
          手动设置个人资料
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          使用简化的方法创建个人资料
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-6">
          <div className="space-y-8">
            {/* 步骤指示器 */}
            <div className="flex justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stepStatus[s] === 'success' ? 'bg-green-500' :
                    stepStatus[s] === 'error' ? 'bg-red-500' :
                    stepStatus[s] === 'loading' ? 'bg-yellow-500' :
                    step >= s ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                  } text-white font-medium`}>
                    {stepStatus[s] === 'success' ? '✓' :
                     stepStatus[s] === 'error' ? '✗' :
                     stepStatus[s] === 'loading' ? '...' : s}
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {s === 1 ? '检查用户' : s === 2 ? '创建资料' : '刷新资料'}
                  </div>
                </div>
              ))}
            </div>

            {/* 状态和消息 */}
            {message && (
              <div className={`p-4 rounded-md ${
                status === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200' :
                status === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {message}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-center">
              {status === 'idle' && (
                <button
                  onClick={handleSetup}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  开始设置
                </button>
              )}
              
              {status === 'loading' && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                  <span>处理中...</span>
                </div>
              )}
              
              {status === 'success' && (
                <Link
                  href="/profile"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  前往个人资料页面
                </Link>
              )}
              
              {status === 'error' && (
                <button
                  onClick={handleSetup}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  重试
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">用户信息</h2>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto">
            <pre className="text-sm text-gray-800 dark:text-gray-300">
              {user ? JSON.stringify({
                id: user.id,
                email: user.email,
                created_at: user.created_at
              }, null, 2) : '未登录'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}