'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ColorPicker() {
  const [color, setColor] = useState('#3b82f6');
  
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
          颜色选择
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          选择并转换颜色格式
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col items-center gap-6">
          <div 
            className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: color }}
          />
          
          <div className="flex flex-col gap-4 w-full max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                HEX 颜色值
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                手动输入 HEX
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
                placeholder="#RRGGBB"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">RGB</div>
                <div className="font-mono">
                  {(() => {
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    return `${r}, ${g}, ${b}`;
                  })()}
                </div>
              </div>
              
              <div className="p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">HSL</div>
                <div className="font-mono">
                  {(() => {
                    // HEX to RGB first
                    const r = parseInt(color.slice(1, 3), 16) / 255;
                    const g = parseInt(color.slice(3, 5), 16) / 255;
                    const b = parseInt(color.slice(5, 7), 16) / 255;
                    
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    let h = 0, s = 0;
                    const l = (max + min) / 2;
                    
                    if (max !== min) {
                      const d = max - min;
                      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                      switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                      }
                      h /= 6;
                    }
                    
                    return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
                  })()}
                </div>
              </div>
              
              <div className="p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">CMYK</div>
                <div className="font-mono">
                  {(() => {
                    // HEX to RGB first
                    const r = parseInt(color.slice(1, 3), 16) / 255;
                    const g = parseInt(color.slice(3, 5), 16) / 255;
                    const b = parseInt(color.slice(5, 7), 16) / 255;
                    
                    const k = 1 - Math.max(r, g, b);
                    const c = (1 - r - k) / (1 - k);
                    const m = (1 - g - k) / (1 - k);
                    const y = (1 - b - k) / (1 - k);
                    
                    return `${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%`;
                  })()}
                </div>
              </div>
            </div>
          </div>
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
            <h3 className="font-medium mb-2">颜色格式</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>HEX：</strong>网页常用格式（#RRGGBB）</li>
              <li><strong>RGB：</strong>红绿蓝三原色值（0-255）</li>
              <li><strong>HSL：</strong>色相、饱和度、亮度</li>
              <li><strong>CMYK：</strong>印刷四色模式</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">使用方法</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>点击颜色选择器选择颜色</li>
              <li>手动输入HEX值（如#FF0000）</li>
              <li>自动转换为其他格式</li>
              <li>实时预览颜色效果</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>HEX格式最适合网页开发，RGB适合屏幕显示，CMYK适合印刷设计。
          </p>
        </div>
      </div>
    </div>
  );
}