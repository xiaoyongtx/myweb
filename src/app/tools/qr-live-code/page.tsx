'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
// @ts-ignore
import gifshot from 'gifshot';

interface QRImage {
  id: string;
  file: File;
  preview: string;
}

export default function QRLiveCode() {
  const [images, setImages] = useState<QRImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGif, setGeneratedGif] = useState<string | null>(null);
  const [globalDuration, setGlobalDuration] = useState(1000); // 全局时长设置
  const [gifSettings, setGifSettings] = useState({
    quality: 1, // 改为最高质量
    repeat: 0, // 0 = infinite loop
    width: 400, // 提高默认分辨率
    height: 400
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: QRImage[] = [];
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const id = Date.now().toString() + index;
        const preview = URL.createObjectURL(file);
        newImages.push({
          id,
          file,
          preview
        });
      }
    });

    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // 清理预览URL
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };


  const moveImage = (id: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newImages = [...prev];
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      return newImages;
    });
  };

  const generateGif = async () => {
    if (images.length === 0) return;

    setIsGenerating(true);
    try {
      // 先检测所有图片的尺寸，找到最大尺寸
      const imageSizes = await Promise.all(
        images.map(async (imgData) => {
          return new Promise<{ width: number; height: number }>((resolve) => {
            const img = new Image();
            img.onload = () => {
              resolve({ width: img.width, height: img.height });
            };
            img.src = imgData.preview;
          });
        })
      );

      // 找到最大尺寸
      const maxWidth = Math.max(...imageSizes.map(s => s.width));
      const maxHeight = Math.max(...imageSizes.map(s => s.height));
      
      // 设置GIF尺寸，最小400px，最大800px，保持原始比例
      const maxSize = Math.max(maxWidth, maxHeight);
      let targetSize = Math.min(Math.max(maxSize, 400), 800);
      
      // 如果原图很小（比如小于200px），则使用2倍放大
      if (maxSize < 200) {
        targetSize = maxSize * 2;
      }

      // 预处理所有图片为高质量base64
      const processedImages = await Promise.all(
        images.map(async (imgData) => {
          return new Promise<string>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')!;
              
              // 使用高分辨率canvas
              canvas.width = targetSize;
              canvas.height = targetSize;
              
              // 启用抗锯齿和高质量渲染
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              
              // 白色背景
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // 计算缩放比例，保持宽高比
              const scale = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
              );
              
              const scaledWidth = img.width * scale;
              const scaledHeight = img.height * scale;
              const x = (canvas.width - scaledWidth) / 2;
              const y = (canvas.height - scaledHeight) / 2;
              
              // 使用高质量绘制
              ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
              
              // 输出高质量PNG
              resolve(canvas.toDataURL('image/png', 1.0));
            };
            img.src = imgData.preview;
          });
        })
      );

      // 创建包含时长信息的图片数组
      const imagesWithDuration: string[] = [];
      const frameCount = Math.max(1, Math.round(globalDuration / 100)); // 每100ms一帧
      
      processedImages.forEach((processedImage) => {
        for (let i = 0; i < frameCount; i++) {
          imagesWithDuration.push(processedImage);
        }
      });

      // 使用gifshot生成高质量GIF
      gifshot.createGIF({
        images: imagesWithDuration,
        gifWidth: targetSize,
        gifHeight: targetSize,
        interval: 0.1, // 每帧间隔0.1秒
        numWorkers: 2,
        sampleInterval: 1, // 减少采样间隔，提高质量
        quality: 1, // 最高质量
        // 禁用dithering可能会提高质量
        // dithering: false
      }, (obj: any) => {
        if (!obj.error) {
          setGeneratedGif(obj.image);
        } else {
          console.error('生成GIF失败:', obj.error);
          alert('生成GIF失败，请重试');
        }
        setIsGenerating(false);
      });
    } catch (error) {
      console.error('生成GIF失败:', error);
      alert('生成GIF失败，请重试');
      setIsGenerating(false);
    }
  };

  const downloadGif = () => {
    if (!generatedGif) return;
    
    const link = document.createElement('a');
    link.download = 'qr-live-code.gif';
    link.href = generatedGif;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setGeneratedGif(null);
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
          二维码活码工具
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          上传多张二维码图片，设置展示时长，生成动态GIF活码
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 左侧：上传和设置 */}
        <div className="space-y-6">
          {/* 上传区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              上传二维码图片
            </h2>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">点击上传</span>
                  或拖拽图片到此处
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  支持 PNG, JPG, JPEG 格式
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {images.length > 0 && (
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  已上传 {images.length} 张图片
                </span>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  清空所有
                </button>
              </div>
            )}
          </div>

          {/* 时长设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              时长设置
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                每张图片展示时长: {globalDuration}毫秒 ({(globalDuration/1000).toFixed(1)}秒)
              </label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={globalDuration}
                onChange={(e) => setGlobalDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0.1s</span>
                <span>10s</span>
              </div>
            </div>
          </div>

          {/* GIF设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              GIF设置
            </h2>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• 尺寸：自动检测原图尺寸（最小400px，最大800px）</p>
                <p>• 质量：高质量模式</p>
                <p>• 循环：无限循环播放</p>
              </div>

              <button
                onClick={generateGif}
                disabled={images.length === 0 || isGenerating}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? '生成中...' : '生成高清GIF动图'}
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：图片列表和预览 */}
        <div className="space-y-6">
          {/* 图片列表 */}
          {images.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                图片序列
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <img
                      src={image.preview}
                      alt={`二维码 ${index + 1}`}
                      className="w-12 h-12 object-cover rounded border"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {image.file.name}
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => moveImage(image.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveImage(image.id, 'down')}
                        disabled={index === images.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeImage(image.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GIF预览 */}
          {generatedGif && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                GIF预览
              </h2>
              
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img
                    src={generatedGif}
                    alt="生成的GIF"
                    className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={downloadGif}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  下载GIF
                </button>
              </div>
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
            <h3 className="font-medium mb-2">操作步骤</h3>
            <ol className="space-y-1 list-decimal list-inside">
              <li>上传多张二维码图片</li>
              <li>设置每张图片的显示时长</li>
              <li>调整图片顺序和GIF参数</li>
              <li>点击生成GIF动图</li>
              <li>预览并下载生成的活码</li>
            </ol>
          </div>
          <div>
            <h3 className="font-medium mb-2">功能特点</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>支持拖拽上传多图片</li>
              <li>时长精确到毫秒级控制</li>
              <li>可调整图片播放顺序</li>
              <li>自定义GIF尺寸和质量</li>
              <li>实时预览生成效果</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}