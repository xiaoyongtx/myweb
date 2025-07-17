'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [strength, setStrength] = useState(0);

  const generatePassword = useCallback(() => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]\\:;\"<>,.?/-=';

    let chars = lowercaseChars;
    if (includeUppercase) chars += uppercaseChars;
    if (includeNumbers) chars += numberChars;
    if (includeSymbols) chars += symbolChars;

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      generatedPassword += chars[randomIndex];
    }

    // Calculate password strength (0-4)
    let calculatedStrength = 0;
    if (length >= 8) calculatedStrength += 1;
    if (includeUppercase) calculatedStrength += 1;
    if (includeNumbers) calculatedStrength += 1;
    if (includeSymbols) calculatedStrength += 1;
    
    setPassword(generatedPassword);
    setStrength(calculatedStrength);
  }, [length, includeUppercase, includeNumbers, includeSymbols]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/tools"
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ← 返回工具箱
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          密码生成器
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          生成安全、随机的密码
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              生成密码
            </label>
            <div className="flex">
              <input
                type="text"
                value={password}
                readOnly
                className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-l-md dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={generatePassword}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
              >
                生成
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              密码长度: {length}
            </label>
            <input
              type="range"
              min="6"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeUppercase"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="includeUppercase" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                包含大写字母
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeNumbers"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="includeNumbers" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                包含数字
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeSymbols"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="includeSymbols" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                包含特殊符号
              </label>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">密码强度</span>
              <span className="text-sm font-medium">
                {strength === 0 && '非常弱'}
                {strength === 1 && '弱'}
                {strength === 2 && '中等'}
                {strength === 3 && '强'}
                {strength === 4 && '非常强'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full"
                style={{
                  width: `${(strength / 4) * 100}%`,
                  backgroundColor: 
                    strength <= 1 ? '#ef4444' : 
                    strength === 2 ? '#f59e0b' : 
                    strength === 3 ? '#3b82f6' : '#10b981'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}