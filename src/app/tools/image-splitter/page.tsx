'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

interface SplitResult {
  canvas: HTMLCanvasElement;
  blob: Blob;
  name: string;
}

export default function ImageSplitter() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [splitMode, setSplitMode] = useState<'grid' | 'horizontal' | 'vertical'>('grid');
  const [gridRows, setGridRows] = useState(2);
  const [gridCols, setGridCols] = useState(2);
  const [horizontalParts, setHorizontalParts] = useState(2);
  const [verticalParts, setVerticalParts] = useState(2);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setSplitResults([]);
    }
  };

  const splitImage = useCallback(async () => {
    if (!selectedImage || !imageUrl) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const results: SplitResult[] = [];

        if (splitMode === 'grid') {
          const pieceWidth = img.width / gridCols;
          const pieceHeight = img.height / gridRows;

          for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
              const pieceCanvas = document.createElement('canvas');
              const pieceCtx = pieceCanvas.getContext('2d');
              if (!pieceCtx) continue;

              pieceCanvas.width = pieceWidth;
              pieceCanvas.height = pieceHeight;

              pieceCtx.drawImage(
                img,
                col * pieceWidth,
                row * pieceHeight,
                pieceWidth,
                pieceHeight,
                0,
                0,
                pieceWidth,
                pieceHeight
              );

              pieceCanvas.toBlob((blob) => {
                if (blob) {
                  results.push({
                    canvas: pieceCanvas,
                    blob,
                    name: `piece_${row + 1}_${col + 1}.png`
                  });
                  
                  if (results.length === gridRows * gridCols) {
                    setSplitResults([...results]);
                  }
                }
              }, 'image/png');
            }
          }
        } else if (splitMode === 'horizontal') {
          const pieceHeight = img.height / horizontalParts;

          for (let i = 0; i < horizontalParts; i++) {
            const pieceCanvas = document.createElement('canvas');
            const pieceCtx = pieceCanvas.getContext('2d');
            if (!pieceCtx) continue;

            pieceCanvas.width = img.width;
            pieceCanvas.height = pieceHeight;

            pieceCtx.drawImage(
              img,
              0,
              i * pieceHeight,
              img.width,
              pieceHeight,
              0,
              0,
              img.width,
              pieceHeight
            );

            pieceCanvas.toBlob((blob) => {
              if (blob) {
                results.push({
                  canvas: pieceCanvas,
                  blob,
                  name: `horizontal_${i + 1}.png`
                });
                
                if (results.length === horizontalParts) {
                  setSplitResults([...results]);
                }
              }
            }, 'image/png');
          }
        } else if (splitMode === 'vertical') {
          const pieceWidth = img.width / verticalParts;

          for (let i = 0; i < verticalParts; i++) {
            const pieceCanvas = document.createElement('canvas');
            const pieceCtx = pieceCanvas.getContext('2d');
            if (!pieceCtx) continue;

            pieceCanvas.width = pieceWidth;
            pieceCanvas.height = img.height;

            pieceCtx.drawImage(
              img,
              i * pieceWidth,
              0,
              pieceWidth,
              img.height,
              0,
              0,
              pieceWidth,
              img.height
            );

            pieceCanvas.toBlob((blob) => {
              if (blob) {
                results.push({
                  canvas: pieceCanvas,
                  blob,
                  name: `vertical_${i + 1}.png`
                });
                
                if (results.length === verticalParts) {
                  setSplitResults([...results]);
                }
              }
            }, 'image/png');
          }
        }
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('切割图片失败:', error);
      alert('切割图片失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedImage, imageUrl, splitMode, gridRows, gridCols, horizontalParts, verticalParts]);

  const downloadSingle = (result: SplitResult) => {
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.download = result.name;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    splitResults.forEach((result, index) => {
      setTimeout(() => {
        downloadSingle(result);
      }, index * 100);
    });
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
          图片切割
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          将图片按网格、水平或垂直方向切割成多个部分
        </p>
      </div>

      {/* 图片上传区域 */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            选择图片
          </h2>
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">点击上传</span> 或拖拽图片到此处
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  支持 PNG, JPG, JPEG, GIF 格式
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
            </label>
          </div>

          {selectedImage && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                已选择: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <>
          {/* 切割设置 */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                切割设置
              </h2>
              
              {/* 切割模式选择 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  切割模式
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setSplitMode('grid')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      splitMode === 'grid'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">网格切割</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">按行列切割</div>
                  </button>
                  <button
                    onClick={() => setSplitMode('horizontal')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      splitMode === 'horizontal'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">水平切割</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">按行切割</div>
                  </button>
                  <button
                    onClick={() => setSplitMode('vertical')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      splitMode === 'vertical'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">垂直切割</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">按列切割</div>
                  </button>
                </div>
              </div>

              {/* 切割参数设置 */}
              <div className="mb-6">
                {splitMode === 'grid' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        行数: {gridRows}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={gridRows}
                        onChange={(e) => setGridRows(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        列数: {gridCols}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={gridCols}
                        onChange={(e) => setGridCols(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                  </div>
                )}

                {splitMode === 'horizontal' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      切割份数: {horizontalParts}
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={horizontalParts}
                      onChange={(e) => setHorizontalParts(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                )}

                {splitMode === 'vertical' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      切割份数: {verticalParts}
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={verticalParts}
                      onChange={(e) => setVerticalParts(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={splitImage}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? '处理中...' : '开始切割'}
              </button>
            </div>
          </div>

          {/* 原图预览 */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                原图预览
              </h2>
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt="原图"
                  className="max-w-full max-h-96 object-contain border border-gray-200 dark:border-gray-600 rounded"
                />
              </div>
            </div>
          </div>

          {/* 切割结果 */}
          {splitResults.length > 0 && (
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    切割结果 ({splitResults.length} 个文件)
                  </h2>
                  <button
                    onClick={downloadAll}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    下载全部
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {splitResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <img
                        src={URL.createObjectURL(result.blob)}
                        alt={result.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
                        {result.name}
                      </p>
                      <button
                        onClick={() => downloadSingle(result)}
                        className="w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        下载
                      </button>
                    </div>
                  ))}
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
            <h3 className="font-medium mb-2">网格切割</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>按行列将图片切成网格</li>
              <li>可设置1-10行和1-10列</li>
              <li>适合制作拼图或九宫格</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">水平切割</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>按水平方向切割图片</li>
              <li>可设置2-10个部分</li>
              <li>适合长图分段显示</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">垂直切割</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>按垂直方向切割图片</li>
              <li>可设置2-10个部分</li>
              <li>适合宽图分段显示</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}