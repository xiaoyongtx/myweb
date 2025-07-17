'use client';

import Link from 'next/link';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            验证您的邮箱
          </h2>
          <div className="mt-8 text-gray-600 dark:text-gray-400">
            <p className="mb-4">
              我们已向您的邮箱发送了一封验证邮件。请检查您的邮箱并点击邮件中的链接完成注册。
            </p>
            <p className="mb-4">
              如果您没有收到邮件，请检查垃圾邮件文件夹，或者稍后再试。
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              返回登录页面
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}