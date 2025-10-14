'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestAuth() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // 测试 Supabase 连接
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult(`连接错误: ${error.message}`);
      } else {
        setResult(`连接成功! 当前会话: ${data.session ? '已登录' : '未登录'}`);
      }
    } catch (error: any) {
      setResult(`连接失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
      });
      
      if (error) {
        setResult(`注册测试错误: ${error.message}`);
      } else {
        setResult(`注册测试成功! 用户ID: ${data.user?.id}`);
      }
    } catch (error: any) {
      setResult(`注册测试失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          认证功能测试
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试 Supabase 连接'}
          </button>
          
          <button
            onClick={testSignUp}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试注册功能'}
          </button>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-md border">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              测试结果:
            </h2>
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}