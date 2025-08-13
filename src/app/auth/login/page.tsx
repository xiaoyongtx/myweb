'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('./LoginFormContent'), { ssr: false });

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-gray-600 dark:text-gray-400">加载中...</div>
    </div>}>
      <LoginForm />
    </Suspense>
  );
}