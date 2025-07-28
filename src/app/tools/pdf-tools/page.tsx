'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';

interface PDFFile {
  file: File;
  name: string;
  id: string;
  pageCount?: number;
  url?: string;
}

export default function PDFTools() {
  const [mode, setMode] = useState<'merge' | 'split'>('merge');
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitPageRanges, setSplitPageRanges] = useState('');
  const [splitMode, setSplitMode] = useState<'pages' | 'ranges'>('pages');
  const [pagesPerSplit, setPagesPerSplit] = useState(1);
  const [previewFile, setPreviewFile] = useState<PDFFile | null>(null);
  const [previewPageNum, setPreviewPageNum] = useState(1);
  const [previewScale, setPreviewScale] = useState(1.0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'canvas' | 'iframe'>('canvas');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 键盘快捷键和鼠标滚轮处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showPreview || previewMode !== 'canvas') return;
      
      switch (event.key) {
        case '=':
        case '+':
          event.preventDefault();
          setPreviewScale(prev => Math.min(2.0, prev + 0.1));
          break;
        case '-':
          event.preventDefault();
          setPreviewScale(prev => Math.max(0.5, prev - 0.1));
          break;
        case '0':
          event.preventDefault();
          setPreviewScale(1.0);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setPreviewPageNum(prev => Math.max(1, prev - 1));
          break;
        case 'ArrowRight':
          event.preventDefault();
          setPreviewPageNum(prev => Math.min(previewPages.length, prev + 1));
          break;
        case 'Escape':
          event.preventDefault();
          closePreview();
          break;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (!showPreview || previewMode !== 'canvas') return;
      
      // 检查是否在预览内容区域
      const target = event.target as Element;
      if (target.closest('.preview-content')) {
        event.preventDefault();
        
        if (event.deltaY < 0) {
          // 向上滚动，放大
          setPreviewScale(prev => Math.min(2.0, prev + 0.1));
        } else {
          // 向下滚动，缩小
          setPreviewScale(prev => Math.max(0.5, prev - 0.1));
        }
      }
    };

    if (showPreview) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [showPreview, previewMode, previewPages.length]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    const newPdfFiles: PDFFile[] = [];
    
    for (const file of pdfFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        
        newPdfFiles.push({
          file,
          name: file.name,
          id: Math.random().toString(36).substr(2, 9),
          pageCount,
          url: URL.createObjectURL(file)
        });
      } catch (error) {
        console.error(`加载PDF文件 ${file.name} 失败:`, error);
        alert(`文件 ${file.name} 不是有效的PDF文件`);
      }
    }

    setPdfFiles(prev => [...prev, ...newPdfFiles]);
  };

  const removePdfFile = (id: string) => {
    setPdfFiles(prev => {
      const fileToRemove = prev.find(pdf => pdf.id === id);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(pdf => pdf.id !== id);
    });
    
    // 如果删除的是正在预览的文件，关闭预览
    if (previewFile?.id === id) {
      setShowPreview(false);
      setPreviewFile(null);
    }
  };

  const movePdfFile = (fromIndex: number, toIndex: number) => {
    setPdfFiles(prev => {
      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      return newFiles;
    });
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      alert('请至少选择2个PDF文件进行合并');
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `merged_${Date.now()}.pdf`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('PDF合并完成！');
    } catch (error) {
      console.error('合并PDF失败:', error);
      alert('合并PDF失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const splitPDF = async () => {
    if (pdfFiles.length !== 1) {
      alert('拆分模式下请只选择一个PDF文件');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfFile = pdfFiles[0];
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const totalPages = originalPdf.getPageCount();

      let ranges: { start: number; end: number; name: string }[] = [];

      if (splitMode === 'pages') {
        // 按页数拆分
        for (let i = 0; i < totalPages; i += pagesPerSplit) {
          const start = i;
          const end = Math.min(i + pagesPerSplit - 1, totalPages - 1);
          ranges.push({
            start,
            end,
            name: `pages_${start + 1}_to_${end + 1}`
          });
        }
      } else {
        // 按范围拆分
        const rangeStrings = splitPageRanges.split(',').map(s => s.trim()).filter(s => s);
        
        for (let i = 0; i < rangeStrings.length; i++) {
          const rangeStr = rangeStrings[i];
          let start: number, end: number;
          
          if (rangeStr.includes('-')) {
            const [startStr, endStr] = rangeStr.split('-');
            start = parseInt(startStr) - 1;
            end = parseInt(endStr) - 1;
          } else {
            start = end = parseInt(rangeStr) - 1;
          }
          
          if (start >= 0 && end >= start && end < totalPages) {
            ranges.push({
              start,
              end,
              name: `pages_${start + 1}_to_${end + 1}`
            });
          }
        }
      }

      if (ranges.length === 0) {
        alert('没有有效的页面范围');
        return;
      }

      // 创建并下载每个拆分的PDF
      for (const range of ranges) {
        const newPdf = await PDFDocument.create();
        const pageIndices = [];
        for (let i = range.start; i <= range.end; i++) {
          pageIndices.push(i);
        }
        
        const pages = await newPdf.copyPages(originalPdf, pageIndices);
        pages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `${pdfFile.name.replace('.pdf', '')}_${range.name}.pdf`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // 添加延迟避免浏览器阻止多个下载
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      alert(`PDF拆分完成！生成了 ${ranges.length} 个文件`);
    } catch (error) {
      console.error('拆分PDF失败:', error);
      alert('拆分PDF失败，请检查页面范围设置');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFiles = () => {
    // 清理URL对象
    pdfFiles.forEach(pdf => {
      if (pdf.url) {
        URL.revokeObjectURL(pdf.url);
      }
    });
    
    setPdfFiles([]);
    setShowPreview(false);
    setPreviewFile(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderPDFPages = async (file: File) => {
    setIsLoadingPreview(true);
    try {
      // 动态导入pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');
      
      // 设置worker - 使用更稳定的配置
      if (typeof window !== 'undefined') {
        // 尝试多个worker源
        const workerSources = [
          `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
          `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`,
          `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
        ];
        
        // 设置默认worker源
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
      }).promise;
      
      const pages: string[] = [];
      const numPages = Math.min(pdf.numPages, 10); // 最多预览10页
      
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.0 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
              canvasContext: context,
              viewport: viewport,
              canvas: canvas
            }).promise;
            
            pages.push(canvas.toDataURL());
          }
        } catch (pageError) {
          console.error(`渲染第 ${pageNum} 页失败:`, pageError);
          // 继续处理下一页
        }
      }
      
      if (pages.length === 0) {
        throw new Error('无法渲染任何页面');
      }
      
      setPreviewPages(pages);
    } catch (error) {
      console.error('PDF渲染失败:', error);
      
      // 尝试使用备用方案 - 直接显示PDF URL
      try {
        const url = URL.createObjectURL(file);
        setPreviewPages([url]); // 使用URL而不是canvas数据
      } catch (fallbackError) {
        console.error('备用方案也失败:', fallbackError);
        alert('PDF预览失败，可能是文件格式不支持或文件损坏');
        setPreviewPages([]);
      }
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const openPreview = async (pdf: PDFFile) => {
    setPreviewFile(pdf);
    setPreviewPageNum(1);
    setPreviewScale(1.0);
    setShowPreview(true);
    setPreviewPages([]);
    
    // 首先尝试使用PDF.js渲染
    try {
      await renderPDFPages(pdf.file);
    } catch (error) {
      console.error('PDF.js渲染失败，使用备用方案:', error);
      // 如果PDF.js失败，直接使用PDF URL
      if (pdf.url) {
        setPreviewPages([pdf.url]);
        setPreviewMode('iframe');
      }
    }
  };

  const openSimplePreview = (pdf: PDFFile) => {
    if (pdf.url) {
      window.open(pdf.url, '_blank');
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
    setPreviewPages([]);
  };

  // 清理URL对象
  useEffect(() => {
    return () => {
      pdfFiles.forEach(pdf => {
        if (pdf.url) {
          URL.revokeObjectURL(pdf.url);
        }
      });
    };
  }, []);

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
          PDF合并与拆分工具
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          轻松合并多个PDF文件或将PDF拆分成多个文件
        </p>
      </div>

      {/* 模式选择 */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            选择操作模式
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('merge')}
              className={`p-6 border rounded-lg text-center transition-colors ${
                mode === 'merge'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-lg font-medium mb-2">PDF合并</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                将多个PDF文件合并为一个文件
              </div>
            </button>
            <button
              onClick={() => setMode('split')}
              className={`p-6 border rounded-lg text-center transition-colors ${
                mode === 'split'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-lg font-medium mb-2">PDF拆分</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                将一个PDF文件拆分为多个文件
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 文件上传区域 */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'merge' ? '选择要合并的PDF文件' : '选择要拆分的PDF文件'}
              {pdfFiles.length > 0 && ` (${pdfFiles.length} 个文件)`}
            </h2>
            {pdfFiles.length > 0 && (
              <button
                onClick={clearFiles}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                清空文件
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-center w-full mb-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">点击上传</span> 或拖拽PDF文件到此处
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {mode === 'merge' ? '支持选择多个PDF文件' : '请选择一个PDF文件'}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,application/pdf"
                multiple={mode === 'merge'}
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* 文件列表 */}
          {pdfFiles.length > 0 && (
            <div className="space-y-3">
              {pdfFiles.map((pdf, index) => (
                <div key={pdf.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {pdf.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {pdf.pageCount ? `${pdf.pageCount} 页` : '加载中...'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* 预览按钮 */}
                    <button
                      onClick={() => openPreview(pdf)}
                      className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="预览"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    {/* 新窗口打开按钮 */}
                    <button
                      onClick={() => openSimplePreview(pdf)}
                      disabled={!pdf.url}
                      className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="在新窗口打开"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                    
                    {/* 移动按钮 - 仅在合并模式且文件数量大于1时显示 */}
                    {mode === 'merge' && pdfFiles.length > 1 ? (
                      <>
                        <button
                          onClick={() => movePdfFile(index, index - 1)}
                          disabled={index === 0}
                          className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="向上移动"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => movePdfFile(index, index + 1)}
                          disabled={index === pdfFiles.length - 1}
                          className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="向下移动"
                        >
                          ↓
                        </button>
                      </>
                    ) : (
                      // 占位符，保持按钮对齐
                      <>
                        <div className="w-8 h-8"></div>
                        <div className="w-8 h-8"></div>
                      </>
                    )}
                    
                    {/* 删除按钮 */}
                    <button
                      onClick={() => removePdfFile(pdf.id)}
                      className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 拆分设置 */}
      {mode === 'split' && pdfFiles.length === 1 && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              拆分设置
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  拆分方式
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSplitMode('pages')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      splitMode === 'pages'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium">按页数拆分</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      每N页生成一个文件
                    </div>
                  </button>
                  <button
                    onClick={() => setSplitMode('ranges')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      splitMode === 'ranges'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium">按范围拆分</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      指定页面范围
                    </div>
                  </button>
                </div>
              </div>

              {splitMode === 'pages' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    每个文件包含页数: {pagesPerSplit}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={pagesPerSplit}
                    onChange={(e) => setPagesPerSplit(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>1页</span>
                    <span>10页</span>
                  </div>
                </div>
              )}

              {splitMode === 'ranges' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    页面范围 (总共 {pdfFiles[0]?.pageCount || 0} 页)
                  </label>
                  <input
                    type="text"
                    value={splitPageRanges}
                    onChange={(e) => setSplitPageRanges(e.target.value)}
                    placeholder="例如: 1-3, 5, 7-10"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    用逗号分隔多个范围，例如: 1-3, 5, 7-10 表示第1-3页、第5页、第7-10页
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {pdfFiles.length > 0 && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-center">
              <button
                onClick={mode === 'merge' ? mergePDFs : splitPDF}
                disabled={isProcessing || (mode === 'merge' && pdfFiles.length < 2) || (mode === 'split' && pdfFiles.length !== 1)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
              >
                {isProcessing ? '处理中...' : mode === 'merge' ? '合并PDF' : '拆分PDF'}
              </button>
            </div>
            
            {mode === 'merge' && pdfFiles.length < 2 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                请至少选择2个PDF文件进行合并
              </p>
            )}
            
            {mode === 'split' && pdfFiles.length !== 1 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                拆分模式下请只选择一个PDF文件
              </p>
            )}
          </div>
        </div>
      )}

      {/* PDF预览模态框 */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-full max-h-[95vh] flex flex-col mx-4">
            {/* 预览头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {previewFile.name}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {previewMode === 'canvas' ? `第 ${previewPageNum} 页 / 共 ${previewFile.pageCount} 页` : 'PDF预览'}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* 缩放控制 - 仅在canvas模式下显示 */}
                {previewMode === 'canvas' && (
                  <>
                    <button
                      onClick={() => setPreviewScale(prev => Math.max(0.5, prev - 0.1))}
                      disabled={previewScale <= 0.5}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="缩小 (-)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <div className="flex flex-col items-center min-w-[80px]">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {Math.round(previewScale * 100)}%
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        50%-200%
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setPreviewScale(prev => Math.min(2.0, prev + 0.1))}
                      disabled={previewScale >= 2.0}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="放大 (+)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setPreviewScale(1.0)}
                      disabled={previewScale === 1.0}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="重置到100% (0)"
                    >
                      重置
                    </button>
                  </>
                )}
                
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="关闭"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* 预览内容 */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto preview-content">
              <div className="flex justify-center items-start min-h-full p-4">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <div className="text-gray-500 dark:text-gray-400">正在加载PDF预览...</div>
                    </div>
                  </div>
                ) : previewPages.length > 0 ? (
                  <div className="w-full max-w-full">
                    {previewPages[previewPageNum - 1]?.startsWith('data:image') ? (
                      <div className="flex justify-center w-full">
                        <div 
                          className="inline-block"
                          style={{
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.2s ease-in-out'
                          }}
                        >
                          <img
                            src={previewPages[previewPageNum - 1]}
                            alt={`第 ${previewPageNum} 页`}
                            style={{
                              maxWidth: '100%',
                              height: 'auto'
                            }}
                            className="shadow-lg rounded border border-gray-200 dark:border-gray-600"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <iframe
                          src={previewPages[previewPageNum - 1]}
                          title={`第 ${previewPageNum} 页`}
                          style={{
                            width: '100%',
                            height: '600px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem'
                          }}
                          className="shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="text-gray-500 dark:text-gray-400">PDF预览加载失败</div>
                      <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        请检查PDF文件是否有效，或尝试使用"在新窗口打开"功能
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 页面导航 - 仅在canvas模式下显示 */}
            {previewMode === 'canvas' && (
              <div className="flex items-center justify-center space-x-4 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setPreviewPageNum(prev => Math.max(1, prev - 1))}
                  disabled={previewPageNum <= 1 || isLoadingPreview}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">跳转到</span>
                  <input
                    type="number"
                    min="1"
                    max={Math.min(previewPages.length, previewFile?.pageCount || 1)}
                    value={previewPageNum}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      const maxPage = Math.min(previewPages.length, previewFile?.pageCount || 1);
                      if (page >= 1 && page <= maxPage) {
                        setPreviewPageNum(page);
                      }
                    }}
                    disabled={isLoadingPreview}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-center disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    / {Math.min(previewPages.length, previewFile?.pageCount || 0)} 页
                  </span>
                </div>
                
                <button
                  onClick={() => setPreviewPageNum(prev => Math.min(Math.min(previewPages.length, previewFile?.pageCount || 1), prev + 1))}
                  disabled={previewPageNum >= Math.min(previewPages.length, previewFile?.pageCount || 1) || isLoadingPreview}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
            
            {previewMode === 'canvas' && (
              <div className="px-4 pb-2 space-y-2">
                {previewPages.length < (previewFile?.pageCount || 0) && (
                  <div className="text-xs text-center text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                    ⚠️ 为了性能考虑，仅预览前 {previewPages.length} 页 (共 {previewFile?.pageCount} 页)
                  </div>
                )}
                <div className="text-xs text-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  💡 快捷键: +/- 缩放, 0 重置, ←/→ 翻页, Esc 关闭 | 鼠标滚轮缩放
                </div>
              </div>
            )}
          </div>
        </div>
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
            <h3 className="font-medium mb-2">PDF合并</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>选择多个PDF文件</li>
              <li>可调整文件合并顺序</li>
              <li>支持在线预览每个文件</li>
              <li>保持原始页面质量</li>
              <li>自动生成合并后的文件</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">PDF拆分</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>按页数拆分：每N页一个文件</li>
              <li>按范围拆分：指定具体页面</li>
              <li>支持预览确认页面内容</li>
              <li>支持复杂的页面范围设置</li>
              <li>批量下载拆分后的文件</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>所有PDF处理都在浏览器本地完成，不会上传到服务器，保护您的文件隐私。点击预览按钮可以查看PDF内容。如果预览失败，可以点击"在新窗口打开"按钮使用浏览器内置的PDF查看器。
          </p>
        </div>
      </div>
    </div>
  );
}