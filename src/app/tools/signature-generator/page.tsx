'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type SignatureType = 'draw' | 'type' | 'upload';

export default function SignatureGenerator() {
  const [signatureType, setSignatureType] = useState<SignatureType>('draw');
  const [typedText, setTypedText] = useState('');
  const [selectedFont, setSelectedFont] = useState('cursive');
  const [fontSize, setFontSize] = useState(48);
  const [signatureColor, setSignatureColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fonts = [
    { name: 'cursive', label: '草书体' },
    { name: 'serif', label: '衬线体' },
    { name: 'sans-serif', label: '无衬线体' },
    { name: 'monospace', label: '等宽体' },
    { name: 'fantasy', label: '装饰体' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布背景
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (signatureType === 'type' && typedText) {
      // 绘制文字签名
      ctx.fillStyle = signatureColor;
      ctx.font = `${fontSize}px ${selectedFont}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedText, canvas.width / 2, canvas.height / 2);
    } else if (signatureType === 'upload' && uploadedImage) {
      // 绘制上传的图片
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      };
      img.src = uploadedImage;
    }
  }, [signatureType, typedText, selectedFont, fontSize, signatureColor, backgroundColor, uploadedImage]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (signatureType !== 'draw') return;
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
        }
      }
    }
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || signatureType !== 'draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = signatureColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const downloadSignature = (format: 'png' | 'jpg' | 'svg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'svg') {
      // 创建SVG格式
      let svgContent = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">`;
      svgContent += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
      
      if (signatureType === 'type' && typedText) {
        svgContent += `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="${selectedFont}" font-size="${fontSize}" fill="${signatureColor}">${typedText}</text>`;
      }
      
      svgContent += '</svg>';
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signature-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // 创建PNG或JPG格式
      const dataURL = canvas.toDataURL(`image/${format}`);
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `signature-${Date.now()}.${format}`;
      link.click();
    }
  };

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
          电子签名生成
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          创建个性化的电子签名，支持手写、字体和图片签名
        </p>
      </div>

      {/* 签名类型选择 */}
      <div className="mb-8">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setSignatureType('draw')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              signatureType === 'draw'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            手写签名
          </button>
          <button
            onClick={() => setSignatureType('type')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              signatureType === 'type'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            文字签名
          </button>
          <button
            onClick={() => setSignatureType('upload')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              signatureType === 'upload'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            上传图片
          </button>
        </div>
      </div>

      {/* 设置面板 */}
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {signatureType === 'type' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  签名文字
                </label>
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="输入您的姓名"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  字体
                </label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {fonts.map((font) => (
                    <option key={font.name} value={font.name}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  字体大小: {fontSize}px
                </label>
                <input
                  type="range"
                  min="24"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
          
          {signatureType === 'upload' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                上传图片
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                选择图片
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              签名颜色
            </label>
            <input
              type="color"
              value={signatureColor}
              onChange={(e) => setSignatureColor(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              背景颜色
            </label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* 签名画布 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            签名预览
          </h3>
          {signatureType === 'draw' && (
            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              清除
            </button>
          )}
        </div>
        
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ backgroundColor }}
          />
        </div>
        
        {signatureType === 'draw' && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            在画布上拖动鼠标来绘制您的签名
          </p>
        )}
      </div>

      {/* 下载按钮 */}
      <div className="text-center">
        <div className="space-x-4">
          <button
            onClick={() => downloadSignature('png')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            下载 PNG
          </button>
          <button
            onClick={() => downloadSignature('jpg')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            下载 JPG
          </button>
          <button
            onClick={() => downloadSignature('svg')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            下载 SVG
          </button>
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
            <h3 className="font-medium mb-2">签名方式</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>手写签名：</strong>在画布上用鼠标绘制</li>
              <li><strong>文字签名：</strong>输入文字选择字体</li>
              <li><strong>上传图片：</strong>使用已有签名图片</li>
              <li>支持自定义颜色和样式</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">导出格式</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>PNG：</strong>透明背景，适合网页使用</li>
              <li><strong>JPG：</strong>小文件，适合一般用途</li>
              <li><strong>SVG：</strong>矢量格式，适合印刷</li>
              <li>支持高清输出和自定义尺寸</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>SVG格式支持无损缩放，推荐用于正式文档；手写签名时建议使用触控设备以获得更自然的效果。
          </p>
        </div>
      </div>
    </div>
  );
}