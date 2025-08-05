'use client';

import { useState, useRef } from 'react';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';

interface QRItem {
  id: string;
  text: string;
  filename?: string;
  qrDataUrl?: string;
}

export default function QRBatchGenerator() {
  const [qrItems, setQrItems] = useState<QRItem[]>([]);
  const [batchText, setBatchText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [filenamePrefix, setFilenamePrefix] = useState('qr');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addQRItem = (text: string, filename?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setQrItems(prev => [...prev, { id, text, filename }]);
  };

  const handleBatchTextAdd = () => {
    if (!batchText.trim()) return;
    
    const lines = batchText.split('\n').filter(line => line.trim());
    lines.forEach((line, index) => {
      const text = line.trim();
      const filename = `${filenamePrefix}_${qrItems.length + index + 1}`;
      addQRItem(text, filename);
    });
    setBatchText('');
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        jsonData.forEach((row, index) => {
          if (row[0] && row[0].toString().trim()) {
            const text = row[0].toString().trim();
            const filename = row[1] ? row[1].toString().trim() : `${filenamePrefix}_${index + 1}`;
            addQRItem(text, filename);
          }
        });
      } catch (error) {
        console.error('Excel文件解析失败:', error);
        alert('Excel文件解析失败，请检查文件格式');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const removeQRItem = (id: string) => {
    setQrItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setQrItems([]);
  };

  const generateQRCodes = async () => {
    if (qrItems.length === 0) return;

    setIsGenerating(true);
    try {
      const updatedItems = await Promise.all(
        qrItems.map(async (item) => {
          try {
            const qrDataUrl = await QRCode.toDataURL(item.text, {
              width: qrSize,
              errorCorrectionLevel,
              color: {
                dark: foregroundColor,
                light: backgroundColor,
              },
            });
            return { ...item, qrDataUrl };
          } catch (error) {
            console.error(`生成二维码失败: ${item.text}`, error);
            return item;
          }
        })
      );
      setQrItems(updatedItems);
    } catch (error) {
      console.error('批量生成失败:', error);
      alert('批量生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSingle = (item: QRItem) => {
    if (!item.qrDataUrl) return;

    const link = document.createElement('a');
    link.href = item.qrDataUrl;
    link.download = `${item.filename || 'qr'}.png`;
    link.click();
  };

  const downloadAll = async () => {
    const itemsWithQR = qrItems.filter(item => item.qrDataUrl);
    if (itemsWithQR.length === 0) return;

    // 创建ZIP文件（简单实现，实际项目中建议使用JSZip库）
    for (const item of itemsWithQR) {
      if (item.qrDataUrl) {
        const link = document.createElement('a');
        link.href = item.qrDataUrl;
        link.download = `${item.filename || 'qr'}.png`;
        link.click();
        // 添加延迟避免浏览器阻止多个下载
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  const exportToExcel = () => {
    const data = qrItems.map((item, index) => ({
      '序号': index + 1,
      '内容': item.text,
      '文件名': item.filename || `${filenamePrefix}_${index + 1}`,
      '状态': item.qrDataUrl ? '已生成' : '未生成'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '二维码列表');
    XLSX.writeFile(workbook, `qr-batch-list-${Date.now()}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          二维码批量生成
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          批量生成二维码，支持Excel导入和自动编码功能
        </p>
      </div>

      {/* 输入区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 批量文本输入 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            批量文本输入
          </h3>
          <textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder="每行一个内容，支持网址、文本等"
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
          <button
            onClick={handleBatchTextAdd}
            disabled={!batchText.trim()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            添加到列表
          </button>
        </div>

        {/* Excel导入 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Excel文件导入
          </h3>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
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
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              选择Excel文件
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              第一列：内容，第二列：文件名（可选）
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* 设置面板 */}
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          二维码设置
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              尺寸: {qrSize}px
            </label>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              容错级别
            </label>
            <select
              value={errorCorrectionLevel}
              onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="L">低 (7%)</option>
              <option value="M">中 (15%)</option>
              <option value="Q">高 (25%)</option>
              <option value="H">最高 (30%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              前景色
            </label>
            <input
              type="color"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              背景色
            </label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              文件名前缀
            </label>
            <input
              type="text"
              value={filenamePrefix}
              onChange={(e) => setFilenamePrefix(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <button
          onClick={generateQRCodes}
          disabled={qrItems.length === 0 || isGenerating}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? '生成中...' : `批量生成 (${qrItems.length}个)`}
        </button>
        <button
          onClick={downloadAll}
          disabled={qrItems.filter(item => item.qrDataUrl).length === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          下载全部
        </button>
        <button
          onClick={exportToExcel}
          disabled={qrItems.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          导出Excel
        </button>
        <button
          onClick={clearAll}
          disabled={qrItems.length === 0}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          清空列表
        </button>
      </div>

      {/* 二维码列表 */}
      {qrItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            二维码列表 ({qrItems.length} 个)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {qrItems.map((item, index) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800"
              >
                <div className="text-center mb-3">
                  {item.qrDataUrl ? (
                    <img
                      src={item.qrDataUrl}
                      alt={`QR ${index + 1}`}
                      className="w-32 h-32 mx-auto border border-gray-200 dark:border-gray-600 rounded"
                    />
                  ) : (
                    <div className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
                      <span className="text-gray-400">未生成</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.text}>
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    文件名: {item.filename || `${filenamePrefix}_${index + 1}`}
                  </p>
                  <div className="flex space-x-2">
                    {item.qrDataUrl && (
                      <button
                        onClick={() => downloadSingle(item)}
                        className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        下载
                      </button>
                    )}
                    <button
                      onClick={() => removeQRItem(item.id)}
                      className="flex-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
            <h3 className="font-medium mb-2">输入方式</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>批量文本输入，每行一个内容</li>
              <li>Excel文件导入（第一列内容，第二列文件名）</li>
              <li>支持网址、文本、联系方式等</li>
              <li>自动生成文件名或自定义命名</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">自定义设置</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>尺寸：128px-512px可调</li>
              <li>容错级别：L/M/Q/H四个等级</li>
              <li>颜色：自定义前景和背景色</li>
              <li>批量下载和Excel导出</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>容错级别越高二维码越复杂但抗损坏能力越强；建议网址使用M级别，重要信息使用Q或H级别。
          </p>
        </div>
      </div>
    </div>
  );
}