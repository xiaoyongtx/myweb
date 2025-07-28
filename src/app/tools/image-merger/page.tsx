'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

interface ImageFile {
  file: File;
  url: string;
  id: string;
}

export default function ImageMerger() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [mergeMode, setMergeMode] = useState<'grid' | 'horizontal' | 'vertical'>('grid');
  const [gridCols, setGridCols] = useState(2);
  const [spacing, setSpacing] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const newImages: ImageFile[] = imageFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const mergeImages = useCallback(async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 加载所有图片
      const loadedImages = await Promise.all(
        images.map(img => loadImage(img.url))
      );

      let canvasWidth = 0;
      let canvasHeight = 0;

      if (mergeMode === 'horizontal') {
        // 水平合并：宽度累加，高度取最大值
        const maxHeight = Math.max(...loadedImages.map(img => img.height));
        canvasWidth = loadedImages.reduce((sum, img) => sum + img.width, 0) + spacing * (images.length - 1);
        canvasHeight = maxHeight;
      } else if (mergeMode === 'vertical') {
        // 垂直合并：高度累加，宽度取最大值
        const maxWidth = Math.max(...loadedImages.map(img => img.width));
        canvasWidth = maxWidth;
        canvasHeight = loadedImages.reduce((sum, img) => sum + img.height, 0) + spacing * (images.length - 1);
      } else if (mergeMode === 'grid') {
        // 网格合并
        const rows = Math.ceil(images.length / gridCols);
        const maxWidth = Math.max(...loadedImages.map(img => img.width));
        const maxHeight = Math.max(...loadedImages.map(img => img.height));
        canvasWidth = maxWidth * gridCols + spacing * (gridCols - 1);
        canvasHeight = maxHeight * rows + spacing * (rows - 1);
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // 设置背景色
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 绘制图片
      let currentX = 0;
      let currentY = 0;

      loadedImages.forEach((img, index) => {
        if (mergeMode === 'horizontal') {
          // 水平排列，垂直居中
          const y = (canvasHeight - img.height) / 2;
          ctx.drawImage(img, currentX, y);
          currentX += img.width + spacing;
        } else if (mergeMode === 'vertical') {
          // 垂直排列，水平居中
          const x = (canvasWidth - img.width) / 2;
          ctx.drawImage(img, x, currentY);
          currentY += img.height + spacing;
        } else if (mergeMode === 'grid') {
          // 网格排列
          const row = Math.floor(index / gridCols);
          const col = index % gridCols;
          const maxWidth = Math.max(...loadedImages.map(img => img.width));
          const maxHeight = Math.max(...loadedImages.map(img => img.height));
          
          const x = col * (maxWidth + spacing) + (maxWidth - img.width) / 2;
          const y = row * (maxHeight + spacing) + (maxHeight - img.height) / 2;
          
          ctx.drawImage(img, x, y);
        }
      });

      // 生成结果
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setResultUrl(url);
        }
      }, 'image/png');

    } catch (error) {
      console.error('合并图片失败:', error);
      alert('合并图片失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [images, mergeMode, gridCols, spacing, backgroundColor]);

  const downloadResult = () => {
    if (!resultUrl) return;
    
    const link = document.createElement('a');
    link.download = `merged_image_${Date.now()}.png`;
    link.href = resultUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setResultUrl('');
  };

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
          图片合并工具
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          将多张图片合并为一张，支持网格、水平、垂直三种布局
        </p>
      </div>

      {/* 图片上传区域 */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              选择图片 ({images.length} 张)
            </h2>
            {images.length > 0 && (
              <button
                onClick={clearAll}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                清空全部
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-center w-full mb-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  点击选择多张图片或拖拽到此处
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
              />
            </label>
          </div>

          {/* 图片列表 */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={`图片 ${index + 1}`}
                    className="w-full h-24 object-cover rounded border border-gray-200 dark:border-gray-600"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <div className="flex space-x-1">
                      {index > 0 && (
                        <button
                          onClick={() => moveImage(index, index - 1)}
                          className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          title="向前移动"
                        >
                          ←
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          onClick={() => moveImage(index, index + 1)}
                          className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          title="向后移动"
                        >
                          →
                        </button>
                      )}
                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        title="删除"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <>
          {/* 合并设置 */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                合并设置
              </h2>
              
              {/* 合并模式选择 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  合并模式
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setMergeMode('grid')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      mergeMode === 'grid'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">网格合并</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">按网格排列</div>
                  </button>
                  <button
                    onClick={() => setMergeMode('horizontal')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      mergeMode === 'horizontal'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">水平合并</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">横向排列</div>
                  </button>
                  <button
                    onClick={() => setMergeMode('vertical')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      mergeMode === 'vertical'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">垂直合并</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">纵向排列</div>
                  </button>
                </div>
              </div>

              {/* 参数设置 */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {mergeMode === 'grid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      每行列数: {gridCols}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={gridCols}
                      onChange={(e) => setGridCols(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    间距: {spacing}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={spacing}
                    onChange={(e) => setSpacing(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
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
                      className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
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

              <button
                onClick={mergeImages}
                disabled={isProcessing || images.length === 0}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? '合并中...' : '开始合并'}
              </button>
            </div>
          </div>

          {/* 合并结果 */}
          {resultUrl && (
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    合并结果
                  </h2>
                  <button
                    onClick={downloadResult}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    下载图片
                  </button>
                </div>
                
                <div className="flex justify-center">
                  <img
                    src={resultUrl}
                    alt="合并结果"
                    className="max-w-full max-h-96 object-contain border border-gray-200 dark:border-gray-600 rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* 使用说明 */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          使用说明
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h3 className="font-medium mb-2">网格合并</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>按网格方式排列图片</li>
              <li>可设置每行的列数</li>
              <li>图片会自动换行排列</li>
              <li>适合制作照片墙</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">水平合并</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>图片横向排列</li>
              <li>高度以最高图片为准</li>
              <li>其他图片垂直居中</li>
              <li>适合制作横幅图</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">垂直合并</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>图片纵向排列</li>
              <li>宽度以最宽图片为准</li>
              <li>其他图片水平居中</li>
              <li>适合制作长图</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>可以通过拖拽图片上的箭头按钮来调整图片顺序，删除不需要的图片。
          </p>
        </div>
      </div>
    </div>
  );
}