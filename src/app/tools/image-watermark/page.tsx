'use client';

import { useState, useRef, useCallback } from 'react';

interface WatermarkResult {
  canvas: HTMLCanvasElement;
  blob: Blob;
  dataUrl: string;
}

export default function ImageWatermark() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string>('');
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [opacity, setOpacity] = useState(0.5);
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState('#ffffff');
  const [watermarkScale, setWatermarkScale] = useState(0.2);
  const [rotationAngle, setRotationAngle] = useState(-45); // 文字倾斜角度
  const [spacing, setSpacing] = useState(100); // 水印间距
  const [result, setResult] = useState<WatermarkResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setResult(null);

      const img = new Image();
      img.onload = () => {
        setImageInfo({ width: img.width, height: img.height });
      };
      img.src = url;
    }
  };

  const handleWatermarkImageSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setWatermarkImage(file);
      const url = URL.createObjectURL(file);
      setWatermarkImageUrl(url);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleWatermarkFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleWatermarkImageSelect(file);
    }
  };  const
 handleDragOver = (e: React.DragEvent) => {
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

  // 绘制重复文字水印
  const drawRepeatedTextWatermark = (ctx: CanvasRenderingContext2D, imgWidth: number, imgHeight: number) => {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 添加阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;

    const textMetrics = ctx.measureText(watermarkText);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    
    // 计算需要的行列数，确保完全覆盖
    const cols = Math.ceil(imgWidth / spacing) + 2;
    const rows = Math.ceil(imgHeight / spacing) + 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing - spacing / 2;
        const y = row * spacing - spacing / 2;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotationAngle * Math.PI) / 180);
        ctx.fillText(watermarkText, 0, 0);
        ctx.restore();
      }
    }
  };

  // 绘制重复图片水印
  const drawRepeatedImageWatermark = (ctx: CanvasRenderingContext2D, watermarkImg: HTMLImageElement, imgWidth: number, imgHeight: number) => {
    const watermarkWidth = watermarkImg.width * watermarkScale;
    const watermarkHeight = watermarkImg.height * watermarkScale;
    
    // 计算需要的行列数，确保完全覆盖
    const cols = Math.ceil(imgWidth / (watermarkWidth + spacing)) + 1;
    const rows = Math.ceil(imgHeight / (watermarkHeight + spacing)) + 1;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (watermarkWidth + spacing);
        const y = row * (watermarkHeight + spacing);
        
        ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);
      }
    }
  };

  const addWatermark = useCallback(async () => {
    if (!selectedImage || !imageUrl || !imageInfo) return;
    if (watermarkType === 'text' && !watermarkText.trim()) {
      alert('请输入水印文字');
      return;
    }
    if (watermarkType === 'image' && !watermarkImage) {
      alert('请选择水印图片');
      return;
    }

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
        ctx.globalAlpha = opacity;
        
        if (watermarkType === 'text') {
          drawRepeatedTextWatermark(ctx, img.width, img.height);
        } else if (watermarkType === 'image' && watermarkImageUrl) {
          const watermarkImg = new Image();
          watermarkImg.onload = () => {
            drawRepeatedImageWatermark(ctx, watermarkImg, img.width, img.height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const dataUrl = canvas.toDataURL('image/png');
                setResult({
                  canvas,
                  blob,
                  dataUrl
                });
              }
              setIsProcessing(false);
            }, 'image/png');
          };
          watermarkImg.src = watermarkImageUrl;
          return;
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const dataUrl = canvas.toDataURL('image/png');
            setResult({
              canvas,
              blob,
              dataUrl
            });
          }
          setIsProcessing(false);
        }, 'image/png');
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('添加水印失败:', error);
      alert('添加水印失败，请重试');
      setIsProcessing(false);
    }
  }, [selectedImage, imageUrl, imageInfo, watermarkType, watermarkText, watermarkImage, watermarkImageUrl, opacity, fontSize, fontColor, watermarkScale, rotationAngle, spacing]);

  const downloadResult = () => {
    if (!result) return;
    
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.download = `watermarked_${selectedImage?.name || 'image.png'}`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setSelectedImage(null);
    setImageUrl('');
    setWatermarkImage(null);
    setWatermarkImageUrl('');
    setResult(null);
    setImageInfo(null);
    setWatermarkText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (watermarkInputRef.current) {
      watermarkInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          图片加水印
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          为图片添加铺满式文字或图片水印，支持倾斜角度和透明度调节
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
                水印设置
              </h2>       
       <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  水印类型
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setWatermarkType('text')}
                    className={`p-4 border rounded-lg text-center transition-colors ${watermarkType === 'text'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                  >
                    <div className="text-sm font-medium">文字水印</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">添加文字水印</div>
                  </button>
                  <button
                    onClick={() => setWatermarkType('image')}
                    className={`p-4 border rounded-lg text-center transition-colors ${watermarkType === 'image'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                  >
                    <div className="text-sm font-medium">图片水印</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">添加图片水印</div>
                  </button>
                </div>
              </div>

              {watermarkType === 'text' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      水印文字
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="请输入水印文字"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        字体大小: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="100"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        字体颜色
                      </label>
                      <input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        倾斜角度: {rotationAngle}°
                      </label>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        value={rotationAngle}
                        onChange={(e) => setRotationAngle(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        水印间距: {spacing}px
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        value={spacing}
                        onChange={(e) => setSpacing(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {watermarkType === 'image' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    选择水印图片
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <svg className="w-4 h-4 mb-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {watermarkImage ? watermarkImage.name : '点击选择水印图片'}
                        </p>
                      </div>
                      <input
                        ref={watermarkInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleWatermarkFileInput}
                      />
                    </label>
                  </div>
                  {watermarkImage && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            水印大小: {Math.round(watermarkScale * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={watermarkScale}
                            onChange={(e) => setWatermarkScale(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            水印间距: {spacing}px
                          </label>
                          <input
                            type="range"
                            min="20"
                            max="200"
                            value={spacing}
                            onChange={(e) => setSpacing(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )} 
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    透明度: {Math.round(opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              </div>

              <button
                onClick={addWatermark}
                disabled={isProcessing || (watermarkType === 'text' && !watermarkText.trim()) || (watermarkType === 'image' && !watermarkImage)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? '处理中...' : '添加水印'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
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
              {imageInfo && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  尺寸: {imageInfo.width} × {imageInfo.height} 像素
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  水印效果预览
                </h2>
                {result && (
                  <button
                    onClick={downloadResult}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
                  >
                    下载图片
                  </button>
                )}
              </div> 
             {result ? (
                <div className="flex justify-center">
                  <img
                    src={result.dataUrl}
                    alt="水印效果"
                    className="max-w-full max-h-96 object-contain border border-gray-200 dark:border-gray-600 rounded"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      水印效果将在这里显示
                    </p>
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
            <h3 className="font-medium mb-2">文字水印</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>输入水印文字内容</li>
              <li>调节字体大小和颜色</li>
              <li>设置倾斜角度</li>
              <li>调节水印间距</li>
              <li>自动重复铺满图片</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">图片水印</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>支持PNG、JPG等格式</li>
              <li>调节水印大小</li>
              <li>设置水印间距</li>
              <li>保持原始比例</li>
              <li>自动重复铺满</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>透明度建议30%-70%，文字水印使用对比色，-45°角度不易被裁剪。
          </p>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}