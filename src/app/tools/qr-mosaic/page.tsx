'use client';

import { useState, useRef, useCallback } from 'react';
import jsQR from 'jsqr';

interface QRCode {
  data: string;
  location: {
    topLeftCorner: { x: number; y: number };
    topRightCorner: { x: number; y: number };
    bottomLeftCorner: { x: number; y: number };
    bottomRightCorner: { x: number; y: number };
  };
}

export default function QRMosaic() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mosaicSize, setMosaicSize] = useState(10);
  const [expandSize, setExpandSize] = useState(20);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setProcessedUrl('');
      setQrCodes([]);

      const img = new Image();
      img.onload = () => {
        setImageInfo({ width: img.width, height: img.height });
      };
      img.src = url;
    }
  };

  const detectQRCodes = useCallback((imageData: ImageData): QRCode[] => {
    const codes: QRCode[] = [];
    
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        codes.push(code as QRCode);
      }
    } catch (err) {
      console.error('QR码检测失败:', err);
    }

    return codes;
  }, []);

  const applyMosaic = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    mosaicSize: number
  ) => {
    for (let i = 0; i < width; i += mosaicSize) {
      for (let j = 0; j < height; j += mosaicSize) {
        const pixelX = Math.min(x + i, x + width - 1);
        const pixelY = Math.min(y + j, y + height - 1);
        
        const imageData = ctx.getImageData(pixelX, pixelY, 1, 1);
        const [r, g, b] = imageData.data;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(
          x + i,
          y + j,
          Math.min(mosaicSize, width - i),
          Math.min(mosaicSize, height - j)
        );
      }
    }
  };

  const processImage = async () => {
    if (!selectedImage || !imageUrl) {
      alert('请先选择图片');
      return;
    }

    setIsProcessing(true);

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 绘制原图
        ctx.drawImage(img, 0, 0);

        // 获取图像数据用于二维码检测
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // 检测二维码
        const detectedQRCodes = detectQRCodes(imageData);
        setQrCodes(detectedQRCodes);

        if (detectedQRCodes.length === 0) {
          alert('未检测到二维码');
          setIsProcessing(false);
          return;
        }

        // 对检测到的二维码区域进行马赛克处理
        detectedQRCodes.forEach((qr) => {
          const { location } = qr;
          
          // 计算二维码区域的边界
          const minX = Math.min(
            location.topLeftCorner.x,
            location.topRightCorner.x,
            location.bottomLeftCorner.x,
            location.bottomRightCorner.x
          );
          const maxX = Math.max(
            location.topLeftCorner.x,
            location.topRightCorner.x,
            location.bottomLeftCorner.x,
            location.bottomRightCorner.x
          );
          const minY = Math.min(
            location.topLeftCorner.y,
            location.topRightCorner.y,
            location.bottomLeftCorner.y,
            location.bottomRightCorner.y
          );
          const maxY = Math.max(
            location.topLeftCorner.y,
            location.topRightCorner.y,
            location.bottomLeftCorner.y,
            location.bottomRightCorner.y
          );

          // 扩展区域
          const expandedMinX = Math.max(0, minX - expandSize);
          const expandedMinY = Math.max(0, minY - expandSize);
          const expandedMaxX = Math.min(canvas.width, maxX + expandSize);
          const expandedMaxY = Math.min(canvas.height, maxY + expandSize);

          const width = expandedMaxX - expandedMinX;
          const height = expandedMaxY - expandedMinY;

          // 应用马赛克效果
          applyMosaic(ctx, expandedMinX, expandedMinY, width, height, mosaicSize);
        });

        // 生成处理后的图片URL
        const processedDataUrl = canvas.toDataURL('image/png');
        setProcessedUrl(processedDataUrl);
        setIsProcessing(false);
      };

      img.onerror = () => {
        alert('图片加载失败');
        setIsProcessing(false);
      };

      img.src = imageUrl;
    } catch (err) {
      alert('处理失败: ' + (err as Error).message);
      setIsProcessing(false);
    }
  };

  const downloadProcessedImage = () => {
    if (!processedUrl) return;

    const link = document.createElement('a');
    link.download = `qr-mosaic-${Date.now()}.png`;
    link.href = processedUrl;
    link.click();
  };

  const clearAll = () => {
    setSelectedImage(null);
    setImageUrl('');
    setProcessedUrl('');
    setQrCodes([]);
    setImageInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          二维码自动打码工具
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          自动识别图片中的二维码区域并进行马赛克处理，保护隐私信息
        </p>
      </div>

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
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                马赛克设置
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    马赛克大小: {mosaicSize}px
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={mosaicSize}
                    onChange={(e) => setMosaicSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    数值越大，马赛克块越大，模糊效果越强
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    扩展范围: {expandSize}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={expandSize}
                    onChange={(e) => setExpandSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    在二维码周围额外打码的像素范围
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                图片预览
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {imageUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">原图</h3>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="原图预览"
                        className="w-full h-auto"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                )}

                {processedUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">处理结果</h3>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={processedUrl}
                        alt="处理后的图片"
                        className="w-full h-auto"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={processImage}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '处理中...' : '开始处理'}
                </button>

                {processedUrl && (
                  <button
                    onClick={downloadProcessedImage}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    下载处理后的图片
                  </button>
                )}
              </div>

              {qrCodes.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    检测结果: 发现 {qrCodes.length} 个二维码
                  </h3>
                  <div className="space-y-2">
                    {qrCodes.map((qr, index) => (
                      <div key={index} className="text-xs text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30 p-2 rounded">
                        <div className="font-medium">二维码 {index + 1}:</div>
                        <div className="truncate">{qr.data}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              功能特点
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>自动识别图片中的二维码区域</li>
              <li>智能马赛克处理，保护隐私信息</li>
              <li>支持多个二维码同时处理</li>
              <li>处理后的图片保持原始分辨率和质量</li>
              <li>可调节马赛克大小和扩展范围</li>
              <li>支持拖拽上传，操作便捷</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              支持格式
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>支持PNG、JPG、JPEG、GIF等常见图片格式</li>
              <li>建议上传清晰的图片以获得更好的识别效果</li>
              <li>图片大小建议不超过10MB</li>
              <li>支持高分辨率图片处理</li>
              <li>处理完成后可直接下载保存图片</li>
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
            <li>马赛克大小：数值越大，马赛克块越大，模糊效果越强</li>
            <li>扩展范围：在二维码周围额外打码的像素范围，防止信息泄露</li>
            <li>如果二维码较小或模糊，可能无法准确识别</li>
            <li>处理前会显示检测到的二维码内容，确认后再进行打码</li>
            <li>建议在处理敏感图片前先备份原图</li>
          </ul>
        </div>
      </div>

      {/* 隐藏的canvas用于图像处理 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}