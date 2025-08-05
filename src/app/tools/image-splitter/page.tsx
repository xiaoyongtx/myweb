'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface SplitResult {
  canvas: HTMLCanvasElement;
  blob: Blob;
  name: string;
  dataUrl: string;
}

interface PreviewGrid {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
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
  const [previewGrids, setPreviewGrids] = useState<PreviewGrid[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setSplitResults([]);

      // 获取图片尺寸信息
      const img = new Image();
      img.onload = () => {
        setImageInfo({ width: img.width, height: img.height });
      };
      img.src = url;
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  // 更新预览网格
  useEffect(() => {
    if (!imageInfo) return;

    const grids: PreviewGrid[] = [];
    const { width, height } = imageInfo;

    if (splitMode === 'grid') {
      const pieceWidth = width / gridCols;
      const pieceHeight = height / gridRows;

      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          grids.push({
            x: col * pieceWidth,
            y: row * pieceHeight,
            width: pieceWidth,
            height: pieceHeight,
            index: row * gridCols + col
          });
        }
      }
    } else if (splitMode === 'horizontal') {
      const pieceHeight = height / horizontalParts;

      for (let i = 0; i < horizontalParts; i++) {
        grids.push({
          x: 0,
          y: i * pieceHeight,
          width: width,
          height: pieceHeight,
          index: i
        });
      }
    } else if (splitMode === 'vertical') {
      const pieceWidth = width / verticalParts;

      for (let i = 0; i < verticalParts; i++) {
        grids.push({
          x: i * pieceWidth,
          y: 0,
          width: pieceWidth,
          height: height,
          index: i
        });
      }
    }

    setPreviewGrids(grids);
  }, [splitMode, gridRows, gridCols, horizontalParts, verticalParts, imageInfo]);

  const splitImage = useCallback(async () => {
    if (!selectedImage || !imageUrl || !imageInfo) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const totalParts = splitMode === 'grid' ? gridRows * gridCols :
          splitMode === 'horizontal' ? horizontalParts : verticalParts;

        // 批量处理分割，显示进度
        const results: SplitResult[] = [];
        setProcessingProgress(0);

        for (let i = 0; i < previewGrids.length; i++) {
          const grid = previewGrids[i];
          const pieceCanvas = document.createElement('canvas');
          const pieceCtx = pieceCanvas.getContext('2d');
          if (!pieceCtx) continue;

          pieceCanvas.width = grid.width;
          pieceCanvas.height = grid.height;

          pieceCtx.drawImage(
            img,
            grid.x,
            grid.y,
            grid.width,
            grid.height,
            0,
            0,
            grid.width,
            grid.height
          );

          const result = await new Promise<SplitResult | null>((resolve) => {
            pieceCanvas.toBlob((blob) => {
              if (blob) {
                const dataUrl = pieceCanvas.toDataURL('image/png');
                let name = '';

                if (splitMode === 'grid') {
                  const row = Math.floor(i / gridCols) + 1;
                  const col = (i % gridCols) + 1;
                  name = `piece_${row}_${col}.png`;
                } else if (splitMode === 'horizontal') {
                  name = `horizontal_${i + 1}.png`;
                } else {
                  name = `vertical_${i + 1}.png`;
                }

                resolve({
                  canvas: pieceCanvas,
                  blob,
                  name,
                  dataUrl
                });
              } else {
                resolve(null);
              }
            }, 'image/png');
          });

          if (result) {
            results.push(result);
          }

          // 更新进度
          setProcessingProgress(Math.round(((i + 1) / previewGrids.length) * 100));
        }

        setSplitResults(results);
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('切割图片失败:', error);
      alert('切割图片失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedImage, imageUrl, imageInfo, splitMode, gridRows, gridCols, horizontalParts, verticalParts, previewGrids]);

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

  const clearAll = () => {
    setSelectedImage(null);
    setImageUrl('');
    setSplitResults([]);
    setPreviewGrids([]);
    setImageInfo(null);
    setProcessingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

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
            <label
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${isDragOver
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-3 pb-3">
                <svg className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
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
                onChange={handleFileInput}
              />
            </label>
          </div>

          {selectedImage && imageInfo && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    已选择: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                    尺寸: {imageInfo.width} × {imageInfo.height} 像素
                  </p>
                </div>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  重新选择
                </button>
              </div>
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
                    className={`p-4 border rounded-lg text-center transition-colors ${splitMode === 'grid'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                  >
                    <div className="text-sm font-medium">网格切割</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">按行列切割</div>
                  </button>
                  <button
                    onClick={() => setSplitMode('horizontal')}
                    className={`p-4 border rounded-lg text-center transition-colors ${splitMode === 'horizontal'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                  >
                    <div className="text-sm font-medium">水平切割</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">按行切割</div>
                  </button>
                  <button
                    onClick={() => setSplitMode('vertical')}
                    className={`p-4 border rounded-lg text-center transition-colors ${splitMode === 'vertical'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                  >
                    <div className="text-sm font-medium">垂直切割</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">按列切割</div>
                  </button>
                </div>
              </div>

              {/* 快速预设 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  快速预设
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      setSplitMode('grid');
                      setGridRows(3);
                      setGridCols(3);
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    九宫格 (3×3)
                  </button>
                  <button
                    onClick={() => {
                      setSplitMode('grid');
                      setGridRows(2);
                      setGridCols(2);
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    四宫格 (2×2)
                  </button>
                  <button
                    onClick={() => {
                      setSplitMode('horizontal');
                      setHorizontalParts(3);
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    三段横切
                  </button>
                  <button
                    onClick={() => {
                      setSplitMode('vertical');
                      setVerticalParts(2);
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    左右对半
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

              <div className="space-y-3">
                {isProcessing && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                )}

                <button
                  onClick={splitImage}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? `处理中... ${processingProgress}%` : '开始切割'}
                </button>

                {previewGrids.length > 0 && !isProcessing && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    将生成 {previewGrids.length} 个图片文件
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 左右布局：原图预览和分割效果 */}
          <div className="mb-8">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 左侧：原图预览 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  原图预览
                </h2>
                <div className="relative flex justify-center">
                  <div className="relative inline-block">
                    <img
                      src={imageUrl}
                      alt="原图"
                      className="max-w-full max-h-96 object-contain border border-gray-200 dark:border-gray-600 rounded"
                    />
                    {/* 分割线预览 */}
                    {previewGrids.length > 0 && (
                      <div className="absolute inset-0 pointer-events-none">
                        <svg
                          className="w-full h-full"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          {previewGrids.map((grid, index) => {
                            // 计算相对于显示图片的位置
                            const img = document.querySelector('img[alt="原图"]') as HTMLImageElement;
                            if (!img || !imageInfo) return null;

                            const scaleX = img.clientWidth / imageInfo.width;
                            const scaleY = img.clientHeight / imageInfo.height;

                            return (
                              <rect
                                key={index}
                                x={grid.x * scaleX}
                                y={grid.y * scaleY}
                                width={grid.width * scaleX}
                                height={grid.height * scaleY}
                                fill="none"
                                stroke="#4F46E5"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                opacity="0.8"
                              />
                            );
                          })}
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                {imageInfo && (
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                    尺寸: {imageInfo.width} × {imageInfo.height} 像素
                  </div>
                )}
              </div>

              {/* 右侧：分割效果预览 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    分割效果预览
                  </h2>
                  {splitResults.length > 0 && (
                    <button
                      onClick={downloadAll}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
                    >
                      下载全部 ({splitResults.length})
                    </button>
                  )}
                </div>

                {splitResults.length > 0 ? (
                  <div className="flex justify-center">
                    <div className="inline-block">
                      {/* 根据分割模式渲染不同的布局 */}
                      {splitMode === 'grid' ? (
                        <div
                          className="grid gap-2.5"
                          style={{
                            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                            gridTemplateRows: `repeat(${gridRows}, 1fr)`
                          }}
                        >
                          {splitResults.map((result, index) => (
                            <div
                              key={index}
                              className="relative group cursor-pointer border-2 border-transparent hover:border-indigo-500 rounded transition-all duration-200"
                              onClick={() => downloadSingle(result)}
                              title={`点击下载 ${result.name}`}
                            >
                              <img
                                src={result.dataUrl}
                                alt={result.name}
                                className="w-full h-auto object-contain rounded"
                                style={{ maxWidth: '150px', maxHeight: '150px' }}
                              />
                              {/* 悬停时显示的下载图标 */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20 rounded">
                                <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              </div>
                              {/* 区域编号 */}
                              <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : splitMode === 'horizontal' ? (
                        <div className="flex flex-col gap-2.5">
                          {splitResults.map((result, index) => (
                            <div
                              key={index}
                              className="relative group cursor-pointer border-2 border-transparent hover:border-indigo-500 rounded transition-all duration-200"
                              onClick={() => downloadSingle(result)}
                              title={`点击下载 ${result.name}`}
                            >
                              <img
                                src={result.dataUrl}
                                alt={result.name}
                                className="w-full h-auto object-contain rounded"
                                style={{ maxWidth: '380px', maxHeight: '120px' }}
                              />
                              {/* 悬停时显示的下载图标 */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20 rounded">
                                <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              </div>
                              {/* 区域编号 */}
                              <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-2.5">
                          {splitResults.map((result, index) => (
                            <div
                              key={index}
                              className="relative group cursor-pointer border-2 border-transparent hover:border-indigo-500 rounded transition-all duration-200"
                              onClick={() => downloadSingle(result)}
                              title={`点击下载 ${result.name}`}
                            >
                              <img
                                src={result.dataUrl}
                                alt={result.name}
                                className="w-full h-auto object-contain rounded"
                                style={{ maxWidth: '120px', maxHeight: '380px' }}
                              />
                              {/* 悬停时显示的下载图标 */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20 rounded">
                                <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              </div>
                              {/* 区域编号 */}
                              <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">点击"开始切割"查看分割效果</p>
                      <p className="text-xs text-gray-400 mt-1">切割后可点击任意区域下载对应图片</p>
                    </div>
                  </div>
                )}

                {/* 分割结果信息 */}
                {splitResults.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-800 dark:text-green-200">
                        已生成 {splitResults.length} 个图片文件
                      </span>
                      <span className="text-green-600 dark:text-green-300 text-xs">
                        点击任意区域下载对应图片
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={previewCanvasRef} className="hidden" />

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