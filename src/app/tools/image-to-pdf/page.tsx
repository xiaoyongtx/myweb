'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument, PageSizes } from 'pdf-lib';

interface ImageFile {
  file: File;
  url: string;
  id: string;
}

export default function ImageToPDF() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Custom'>('A4');
  const [customWidth, setCustomWidth] = useState(595);
  const [customHeight, setCustomHeight] = useState(842);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const newImages = imageFiles.map(file => ({
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
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  const getPageDimensions = () => {
    switch (pageSize) {
      case 'A4':
        return PageSizes.A4;
      case 'Letter':
        return PageSizes.Letter;
      case 'Custom':
        return [customWidth, customHeight] as [number, number];
      default:
        return PageSizes.A4;
    }
  };

  const convertToPDF = async () => {
    if (images.length === 0) return;

    setIsConverting(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const pageDimensions = getPageDimensions();

      for (const imageFile of images) {
        const imageBytes = await imageFile.file.arrayBuffer();
        let image;

        if (imageFile.file.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (imageFile.file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          // 对于其他格式，先转换为canvas再转为PNG
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = imageFile.url;
          });

          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const pngDataUrl = canvas.toDataURL('image/png');
          const pngBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());
          image = await pdfDoc.embedPng(pngBytes);
        }

        const page = pdfDoc.addPage(pageDimensions);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        // 计算图片缩放比例，保持宽高比
        const imageAspectRatio = image.width / image.height;
        const pageAspectRatio = pageWidth / pageHeight;
        
        let scaledWidth, scaledHeight;
        if (imageAspectRatio > pageAspectRatio) {
          scaledWidth = pageWidth * 0.9; // 留10%边距
          scaledHeight = scaledWidth / imageAspectRatio;
        } else {
          scaledHeight = pageHeight * 0.9; // 留10%边距
          scaledWidth = scaledHeight * imageAspectRatio;
        }

        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `images-to-pdf-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('转换失败:', error);
      alert('转换失败，请重试');
    } finally {
      setIsConverting(false);
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
          图片转PDF
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          将多张图片合并转换为PDF文件，支持自定义页面大小和排版
        </p>
      </div>

      {/* 文件上传区域 */}
      <div className="mb-8">
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            点击选择图片文件
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            支持 JPG、PNG、GIF、WebP 等格式
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 页面设置 */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          页面设置
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              页面大小
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter' | 'Custom')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="A4">A4 (210×297mm)</option>
              <option value="Letter">Letter (216×279mm)</option>
              <option value="Custom">自定义</option>
            </select>
          </div>
          {pageSize === 'Custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  宽度 (pt)
                </label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  高度 (pt)
                </label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 图片预览和排序 */}
      {images.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            图片预览 ({images.length} 张)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
              >
                <img
                  src={image.url}
                  alt={`预览 ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        className="p-1 bg-white rounded text-gray-800 hover:bg-gray-100"
                        title="向前移动"
                      >
                        ←
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        className="p-1 bg-white rounded text-gray-800 hover:bg-gray-100"
                        title="向后移动"
                      >
                        →
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="p-1 bg-red-500 rounded text-white hover:bg-red-600"
                      title="删除"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 转换按钮 */}
      <div className="text-center">
        <button
          onClick={convertToPDF}
          disabled={images.length === 0 || isConverting}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isConverting ? '转换中...' : `转换为PDF (${images.length}张图片)`}
        </button>
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
              <li>JPG、PNG、GIF、WebP等常见图片格式</li>
              <li>支持A4、Letter和自定义页面大小</li>
              <li>每张图片占用一页PDF</li>
              <li>自动保持原始宽高比</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">操作说明</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>点击或拖拽上传多张图片</li>
              <li>可以调整图片顺序</li>
              <li>设置页面大小和排版</li>
              <li>一键转换并下载PDF</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>图片会自动缩放以适应页面大小，建议使用高分辨率图片以获得更好的PDF质量。
          </p>
        </div>
      </div>
    </div>
  );
}