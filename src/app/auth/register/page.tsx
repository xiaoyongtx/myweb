'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const RegisterForm = dynamic(() => import('./RegisterFormContent'), { ssr: false });

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-gray-600 dark:text-gray-400">加载中...</div>
    </div>}>
      <RegisterForm />
    </Suspense>
  );
}