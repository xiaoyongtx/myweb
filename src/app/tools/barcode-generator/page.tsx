'use client';

import { useState, useRef, useEffect } from 'react';
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
            <h3 className="font-medium mb-2">支持格式</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Code 128 - 通用格式，支持数字、字母</li>
              <li>EAN-13/EAN-8 - 商品条形码</li>
              <li>Code 39 - 支持数字、大写字母</li>
              <li>ITF-14 - 交叉二五码</li>
              <li>MSI - 仅数字格式</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">使用方法</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>输入内容自动生成预览</li>
              <li>调整宽度、高度、颜色</li>
              <li>可显示/隐藏文本标签</li>
              <li>支持自定义背景和边距</li>
              <li>点击下载或复制条形码</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>EAN码会自动计算校验位，Code 39支持特殊符号：- . 空格 $ / + %
          </p>
        </div>
      </div>
    </div>
  );
}