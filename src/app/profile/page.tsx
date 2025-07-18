'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, refreshProfile, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [username, setUsername] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // 加载用户资料
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url);
      }
    }
  }, [profile]);

  // 处理头像选择
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 触发文件选择对话框
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 更新个人资料
  const updateProfile = async () => {
    if (!user) return;
    
    setUpdating(true);
    setMessage({ type: '', text: '' });
    
    try {
      const supabase = (await import('@/lib/supabase')).createSupabaseClient();
      
      // 更新用户名
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      
      if (profileError) throw profileError;
      
      // 如果有新头像，上传并更新
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `avatars/${user.id}.${fileExt}`;
        
        // 上传头像
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        // 获取头像公共URL
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        // 更新用户头像URL
        const { error: avatarError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq('id', user.id);
        
        if (avatarError) throw avatarError;
      }
      
      await refreshProfile();
      setMessage({ type: 'success', text: '个人资料已更新' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: '更新个人资料失败，请重试' });
    } finally {
      setUpdating(false);
    }
  };

  // 更新密码
  const updatePassword = async () => {
    if (!user) return;
    
    // 验证新密码
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '密码长度至少为6个字符' });
      return;
    }
    
    setUpdating(true);
    setMessage({ type: '', text: '' });
    
    try {
      const supabase = (await import('@/lib/supabase')).createSupabaseClient();
      
      // 更新密码
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: '密码已更新' });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: '更新密码失败，请重试' });
    } finally {
      setUpdating(false);
    }
  };

  // 添加调试信息
  console.log('Profile page state:', { loading, user, profile });

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }
  
  // 如果用户未登录，显示提示
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">未登录</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">您需要登录才能访问个人资料页面</p>
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            前往登录
          </Link>
        </div>
      </div>
    );
  }
  
  // 如果用户已登录但没有个人资料，可能是数据库未初始化
  if (user && !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">数据库未初始化</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            无法加载个人资料，可能是因为数据库架构尚未初始化。
            请点击下面的按钮初始化数据库。
          </p>
          <Link
            href="/admin/init-db"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            初始化数据库
          </Link>
        </div>
      </div>
    );
  }

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
          个人资料
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          管理您的账户信息和设置
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          {/* 标签导航 */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                基本信息
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                修改密码
              </button>
            </nav>
          </div>

          {/* 消息提示 */}
          {message.text && (
            <div
              className={`p-4 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* 基本信息表单 */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div
                    className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                    onClick={triggerFileInput}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="头像预览"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl font-bold text-gray-400 dark:text-gray-500">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 shadow-md hover:bg-indigo-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  点击头像更换
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    电子邮箱
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    邮箱地址不可更改
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    用户名
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    placeholder="请输入您的用户名"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={updateProfile}
                    disabled={updating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? '保存中...' : '保存更改'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 修改密码表单 */}
          {activeTab === 'password' && (
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    新密码
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    placeholder="请输入新密码"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    确认新密码
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    placeholder="请再次输入新密码"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={updatePassword}
                    disabled={updating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? '更新中...' : '更新密码'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}