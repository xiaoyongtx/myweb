'use client';

import { useState } from 'react';
import { pinyin } from 'pinyin-pro';

export default function PinyinTool() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState({
    fullPinyin: '',
    abbreviation: '',
    nonetonePinyin: ''
  });
  const [copyStatus, setCopyStatus] = useState('');

  const convertToPinyin = (text: string) => {
    if (!text.trim()) {
      setResult({ fullPinyin: '', abbreviation: '', nonetonePinyin: '' });
      return;
    }

    // 获取完整拼音（带声调）
    const fullPinyin = pinyin(text, { toneType: 'symbol', separator: ' ' });
    
    // 获取无声调拼音
    const nonetonePinyin = pinyin(text, { toneType: 'none', separator: ' ' });
    
    // 获取拼音缩写（首字母）
    const abbreviation = pinyin(text, { pattern: 'first', toneType: 'none' });

    setResult({
      fullPinyin,
      nonetonePinyin,
      abbreviation
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    convertToPinyin(text);
  };

  const clearAll = () => {
    setInputText('');
    setResult({ fullPinyin: '', abbreviation: '', nonetonePinyin: '' });
    setCopyStatus('');
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`${type}已复制`);
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      setCopyStatus('复制失败');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          中文转拼音
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          输入中文文本，自动转换为拼音和拼音缩写
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 输入区域 */}
        <div className="w-full lg:w-1/2">
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">中文输入</div>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder="请输入中文文本，例如：你好世界"
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white text-sm resize-none"
          />
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              字符数: {inputText.length}
            </span>
            <div className="flex gap-2">
              {copyStatus && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  {copyStatus}
                </span>
              )}
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>

        {/* 结果显示区域 */}
        <div className="w-full lg:w-1/2 space-y-4">
          {/* 完整拼音（带声调） */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-gray-700 dark:text-gray-300">完整拼音（带声调）</div>
              {result.fullPinyin && (
                <button
                  onClick={() => copyToClipboard(result.fullPinyin, '完整拼音')}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  复制
                </button>
              )}
            </div>
            <textarea
              value={result.fullPinyin}
              readOnly
              className="w-full h-20 p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none dark:bg-gray-800 dark:text-white font-mono text-sm bg-gray-50 dark:bg-gray-900"
              placeholder="完整拼音将显示在这里..."
            />
          </div>

          {/* 无声调拼音 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-gray-700 dark:text-gray-300">无声调拼音</div>
              {result.nonetonePinyin && (
                <button
                  onClick={() => copyToClipboard(result.nonetonePinyin, '无声调拼音')}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  复制
                </button>
              )}
            </div>
            <textarea
              value={result.nonetonePinyin}
              readOnly
              className="w-full h-20 p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none dark:bg-gray-800 dark:text-white font-mono text-sm bg-gray-50 dark:bg-gray-900"
              placeholder="无声调拼音将显示在这里..."
            />
          </div>

          {/* 拼音缩写 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-gray-700 dark:text-gray-300">拼音缩写（首字母）</div>
              {result.abbreviation && (
                <button
                  onClick={() => copyToClipboard(result.abbreviation, '拼音缩写')}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  复制
                </button>
              )}
            </div>
            <textarea
              value={result.abbreviation}
              readOnly
              className="w-full h-20 p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none dark:bg-gray-800 dark:text-white font-mono text-sm bg-gray-50 dark:bg-gray-900"
              placeholder="拼音缩写将显示在这里..."
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
            <h3 className="font-medium mb-2">主要功能</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>完整拼音：</strong>包含声调符号，便于学习发音</li>
              <li><strong>无声调拼音：</strong>纯字母拼音，便于输入</li>
              <li><strong>拼音缩写：</strong>每个字的首字母，快速输入</li>
              <li>支持混合文本（中英文数字符号等）</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">使用技巧</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>输入中文文本，自动实时转换</li>
              <li>点击"复制"按钮快速复制结果</li>
              <li>支持长文本和段落转换</li>
              <li>适用于中文学习、输入法等场景</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>带声调的拼音适合学习发音，无声调拼音适合输入法使用，拼音缩写适合快速记忆和输入。
          </p>
        </div>
      </div>
    </div>
  );
}