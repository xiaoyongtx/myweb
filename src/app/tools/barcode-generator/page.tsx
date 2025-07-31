'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import JsBarcode from 'jsbarcode';

const BARCODE_FORMATS = [
  { value: 'CODE128', label: 'Code 128', description: '通用条形码，支持数字、字母和符号' },
  { value: 'EAN13', label: 'EAN-13', description: '13位商品条形码，常用于零售商品' },
  { value: 'EAN8', label: 'EAN-8', description: '8位商品条形码，用于小包装商品' },
  { value: 'CODE39', label: 'Code 39', description: '支持数字、大写字母和部分符号' },
  { value: 'ITF14', label: 'ITF-14', description: '14位交叉二五码，用于物流包装' },
  { value: 'MSI', label: 'MSI', description: '仅支持数字的条形码格式' },
  { value: 'pharmacode', label: 'Pharmacode', description: '制药行业专用条形码' },
];

export default function BarcodeGenerator() {
  const [text, setText] = useState('123456789012');
  const [format, setFormat] = useState('CODE128');
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [fontSize, setFontSize] = useState(20);
  const [lineColor, setLineColor] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');
  const [margin, setMargin] = useState(10);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBarcode = () => {
    if (!text.trim()) {
      setError('请输入要生成条形码的内容');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 清空画布
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      const options: any = {
        format: format,
        width: width,
        height: height,
        displayValue: displayValue,
        fontSize: fontSize,
        lineColor: lineColor,
        background: background,
        margin: margin,
      };

      JsBarcode(canvas, text, options);
      
    } catch (err: any) {
      setError(`生成失败: ${err.message || '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `barcode-${text}-${format}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert('条形码已复制到剪贴板');
        }
      });
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请尝试下载');
    }
  };

  // 自动生成条形码
  useEffect(() => {
    const timer = setTimeout(() => {
      generateBarcode();
    }, 100);
    return () => clearTimeout(timer);
  }, [text, format, width, height, displayValue, fontSize, lineColor, background, margin]);

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
          条形码生成器
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          生成多种格式的条形码，支持自定义样式和尺寸
        </p>
      </div>

      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            基本设置
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                条形码内容
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="请输入要生成条形码的内容"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                条形码格式
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                {BARCODE_FORMATS.map((fmt) => (
                  <option key={fmt.value} value={fmt.value}>
                    {fmt.label} - {fmt.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  条宽度: {width}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  条高度: {height}px
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  条形码颜色
                </label>
                <input
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  背景颜色
                </label>
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="displayValue"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="displayValue" className="ml-2 block text-sm text-gray-900 dark:text-white">
                显示文本
              </label>
            </div>

            {displayValue && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  字体大小: {fontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                边距: {margin}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            条形码预览
          </h2>
          
          <div className="flex justify-center items-center min-h-[200px] bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            {error ? (
              <div className="text-center">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
              />
            )}
          </div>

          {!error && (
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={downloadBarcode}
                disabled={isGenerating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下载条形码
              </button>
              <button
                onClick={copyToClipboard}
                disabled={isGenerating}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                复制到剪贴板
              </button>
            </div>
          )}
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
            <h3 className="font-medium mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              支持的条形码格式
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Code 128:</strong> 最通用的条形码格式，支持数字、字母和符号</li>
              <li><strong>EAN-13:</strong> 13位商品条形码，需要输入12位数字</li>
              <li><strong>EAN-8:</strong> 8位商品条形码，需要输入7位数字</li>
              <li><strong>Code 39:</strong> 支持数字、大写字母和部分符号</li>
              <li><strong>ITF-14:</strong> 14位交叉二五码，仅支持偶数位数字</li>
              <li><strong>MSI:</strong> 仅支持数字的条形码格式</li>
              <li><strong>Pharmacode:</strong> 制药行业专用条形码</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              自定义设置
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>输入内容后会自动生成条形码预览</li>
              <li>可以调整条宽度、高度、颜色等样式参数</li>
              <li>支持显示或隐藏条形码下方的文本</li>
              <li>可自定义背景颜色和边距大小</li>
              <li>实时预览所有参数调整效果</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
          <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            使用技巧
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200 list-disc list-inside">
            <li>EAN-13和EAN-8会自动计算校验码，只需输入前面的数字</li>
            <li>Code 39格式的符号包括：-、.、空格、$、/、+、%</li>
            <li>ITF-14格式要求输入偶数位数字（通常是14位）</li>
            <li>生成的条形码可以下载为PNG格式图片</li>
            <li>支持复制到剪贴板，方便在其他应用中使用</li>
          </ul>
        </div>
      </div>
    </div>
  );
}