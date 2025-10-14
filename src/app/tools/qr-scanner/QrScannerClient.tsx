'use client';

import { useState, useRef, useCallback } from 'react';
import jsQR from 'jsqr';

export default function QrScannerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setQrResult(null);
    setCopied(false);
    
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // 检查文件类型
    if (!selectedFile.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }
    
    setFile(selectedFile);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      processQRCode(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const processQRCode = (dataUrl: string) => {
    setLoading(true);
    setError(null);
    
    const image = new Image();
    image.onload = () => {
      try {
        // 创建canvas来处理图像
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          setError('浏览器不支持Canvas');
          setLoading(false);
          return;
        }
        
        // 设置canvas尺寸与图像一致
        canvas.width = image.width;
        canvas.height = image.height;
        
        // 绘制图像到canvas
        context.drawImage(image, 0, 0);
        
        // 获取图像数据
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // 使用jsQR库识别二维码
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          setQrResult(code.data);
        } else {
          setError('未能识别二维码，请确保图片清晰且包含完整的二维码');
        }
      } catch (err) {
        setError('处理图片时出错');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    image.onerror = () => {
      setError('加载图片失败');
      setLoading(false);
    };
    
    image.src = dataUrl;
  };

  const handleCopyClick = () => {
    if (!qrResult) return;
    
    navigator.clipboard.writeText(qrResult)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setError('复制失败，请手动复制');
      });
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setQrResult(null);
    setError(null);
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (!droppedFile.type.startsWith('image/')) {
        setError('请上传图片文件');
        return;
      }
      
      setFile(droppedFile);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        processQRCode(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!preview ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600">拖放图片到这里，或者</p>
            <div>
              <label className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer">
                选择图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative max-w-xs mx-auto">
              <img 
                src={preview} 
                alt="预览" 
                className="max-h-64 max-w-full mx-auto rounded shadow"
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
              重新选择
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {qrResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-green-800 mb-2">识别结果</h3>
          <div className="bg-white border border-gray-200 rounded p-3 mb-4 break-all">
            {qrResult}
          </div>
          <button
            onClick={handleCopyClick}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            {copied ? '已复制！' : '复制内容'}
          </button>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">使用说明</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>上传包含二维码的图片（支持拖放或点击上传）</li>
          <li>系统会自动识别图片中的二维码内容</li>
          <li>识别成功后，可以一键复制二维码内容</li>
          <li>支持常见图片格式：JPG、PNG、GIF等</li>
          <li>请确保二维码清晰可见，避免模糊或部分遮挡</li>
        </ul>
      </div>
    </div>
  );
}