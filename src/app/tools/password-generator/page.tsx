'use client';

import { useState, useCallback } from 'react';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeChars, setExcludeChars] = useState('');
  const [strength, setStrength] = useState(0);
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]\\:;\"<>,.?/-=';

    let chars = '';
    if (includeLowercase) chars += lowercaseChars;
    if (includeUppercase) chars += uppercaseChars;
    if (includeNumbers) chars += numberChars;
    if (includeSymbols) chars += symbolChars;

    // Remove excluded characters
    if (excludeChars) {
      const excludeSet = new Set(excludeChars);
      chars = chars.split('').filter(char => !excludeSet.has(char)).join('');
    }

    // Ensure at least one character type is selected
    if (chars.length === 0) {
      alert('请至少选择一种字符类型！');
      return;
    }

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      generatedPassword += chars[randomIndex];
    }

    // Calculate password strength (0-5)
    let calculatedStrength = 0;
    if (length >= 8) calculatedStrength += 1;
    if (includeLowercase) calculatedStrength += 1;
    if (includeUppercase) calculatedStrength += 1;
    if (includeNumbers) calculatedStrength += 1;
    if (includeSymbols) calculatedStrength += 1;
    
    setPassword(generatedPassword);
    setStrength(calculatedStrength);
    setCopied(false);
  }, [length, includeLowercase, includeUppercase, includeNumbers, includeSymbols, excludeChars]);

  const copyToClipboard = async () => {
    if (password) {
      try {
        await navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          密码生成
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          生成安全、随机的密码
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              生成密码
            </label>
            <div className="flex">
              <input
                type="text"
                value={password}
                readOnly
                className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-l-md dark:bg-gray-700 dark:text-white font-mono"
              />
              <button
                onClick={generatePassword}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                生成
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!password}
                className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {copied ? '已复制' : '复制'}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeLowercase"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="includeLowercase" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                包含小写字母
              </label>
            </div>

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

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              排除字符 (可选)
            </label>
            <input
              type="text"
              value={excludeChars}
              onChange={(e) => setExcludeChars(e.target.value)}
              placeholder="例如: 0O1l"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              输入要排除的字符，如容易混淆的字符 0O1l
            </p>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">密码强度</span>
              <span className="text-sm font-medium">
                {strength === 0 && '非常弱'}
                {strength === 1 && '弱'}
                {strength === 2 && '弱'}
                {strength === 3 && '中等'}
                {strength === 4 && '强'}
                {strength === 5 && '非常强'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full"
                style={{
                  width: `${(strength / 5) * 100}%`,
                  backgroundColor: 
                    strength <= 1 ? '#ef4444' : 
                    strength === 2 ? '#f59e0b' : 
                    strength === 3 ? '#f59e0b' : 
                    strength === 4 ? '#3b82f6' : '#10b981'
                }}
              />
            </div>
          </div>
        </div>

      {/* 使用说明 */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          使用说明
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h3 className="font-medium mb-2">字符类型</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>小写字母 a-z</li>
              <li>大写字母 A-Z</li>
              <li>数字 0-9</li>
              <li>特殊符号 !@#$%等</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">安全建议</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>建议长度至少12位</li>
              <li>包含多种字符类型</li>
              <li>可排除易混淆字符</li>
              <li>使用密码管理器保存</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>强密码应包含大小写字母、数字和特殊符号，避免使用个人信息。
          </p>
        </div>
      </div>
    </div>
  );
}