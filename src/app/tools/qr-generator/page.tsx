'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function QRGenerator() {
  const [text, setText] = useState('https://example.com');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        await QRCode.toCanvas(canvas, text, {
          width: size,
          errorCorrectionLevel: errorLevel,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          margin: 2,
        });
        
        // 生成下载用的URL
        const dataUrl = canvas.toDataURL('image/png');
        setQrCodeUrl(dataUrl);
      }
    } catch (error) {
      console.error('生成二维码失败:', error);
      alert('生成二维码失败，请检查输入内容');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('二维码已复制到剪贴板！');
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请使用下载功能');
    }
  };

  // 自动生成二维码
  useEffect(() => {
    generateQRCode();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          二维码生成器
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          快速生成高质量的二维码，支持自定义样式和尺寸
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 左侧：设置面板 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              二维码设置
            </h2>
            
            {/* 文本输入 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                内容
              </label>
              <textarea
                className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入要生成二维码的内容（网址、文本等）"
              />
            </div>

            {/* 尺寸设置 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                尺寸: {size}px
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>128px</span>
                <span>512px</span>
              </div>
            </div>

            {/* 容错级别 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                容错级别
              </label>
              <select
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="L">低 (L) - 约7%</option>
                <option value="M">中 (M) - 约15%</option>
                <option value="Q">较高 (Q) - 约25%</option>
                <option value="H">高 (H) - 约30%</option>
              </select>
            </div>

            {/* 颜色设置 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  前景色
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  背景色
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={generateQRCode}
              disabled={isGenerating || !text.trim()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? '生成中...' : '生成二维码'}
            </button>
          </div>
        </div>

        {/* 右侧：预览和下载 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              预览
            </h2>
            
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
                />
              </div>
            </div>

            {qrCodeUrl && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={downloadQRCode}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  下载PNG
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  复制图片
                </button>
              </div>
            )}
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
            <h3 className="font-medium mb-2">支持内容</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>网址链接（http/https）</li>
              <li>纯文本内容</li>
              <li>联系信息（电话、邮箱）</li>
              <li>WiFi连接信息</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">功能特点</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>自定义尺寸和颜色</li>
              <li>四种容错级别可选</li>
              <li>支持PNG格式下载</li>
              <li>一键复制到剪贴板</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}