'use client';

import { useState, useRef } from 'react';

export default function ImageCompressor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState(70);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setCompressedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = () => {
    if (!originalImage) return;
    
    setIsCompressing(true);
    
    // Use the browser's Image constructor with a check for window to avoid SSR issues
    const img = typeof window !== 'undefined' ? new window.Image() : null;
    if (!img) {
      setIsCompressing(false);
      return;
    }
    img.src = originalImage;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (optional: maintain aspect ratio)
      const maxWidth = 1024;
      const maxHeight = 1024;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Compress image
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      setCompressedImage(compressedDataUrl);
      setIsCompressing(false);
    };
    
    img.onerror = () => {
      setIsCompressing(false);
      alert('图片加载失败，请重试');
    };
  };

  const downloadImage = () => {
    if (!compressedImage) return;
    
    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = 'compressed-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          图片压缩
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          压缩图片文件大小，同时保持良好的图片质量
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择图片
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900 dark:file:text-indigo-100
                hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              压缩质量: {quality}%
            </label>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>低质量</span>
              <span>高质量</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={compressImage}
              disabled={!originalImage || isCompressing}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompressing ? '压缩中...' : '压缩图片'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                原始图片
              </h3>
              {originalImage ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={originalImage} 
                    alt="Original" 
                    className="max-w-full h-auto" 
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md h-48 flex items-center justify-center text-gray-400">
                  未选择图片
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                压缩后图片
              </h3>
              {compressedImage ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={compressedImage} 
                    alt="Compressed" 
                    className="max-w-full h-auto" 
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                  <div className="mt-2 flex justify-center">
                    <button
                      onClick={downloadImage}
                      className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      下载图片
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md h-48 flex items-center justify-center text-gray-400">
                  {originalImage ? '点击"压缩图片"按钮' : '等待压缩'}
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
            <h3 className="font-medium mb-2">支持格式</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>支持JPG、PNG、GIF、WebP等常见格式</li>
              <li>自动转换为JPG格式输出</li>
              <li>保持图片宽高比不变</li>
              <li>最大尺寸限制1024x1024像素</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">压缩设置</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>质量范围：10%-90%</li>
              <li>推荐设置：70%（平衡质量与大小）</li>
              <li>低质量：文件更小，画质较差</li>
              <li>高质量：文件较大，画质更好</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>压缩后的图片会自动调整尺寸，适合网页使用。建议先备份原图再进行压缩。
          </p>
        </div>
      </div>
    </div>
  );
}