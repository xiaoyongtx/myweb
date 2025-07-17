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
          颜色选择器
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          选择并转换颜色格式
        </p>
      </div>

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
                  let h = 0, s = 0, l = (max + min) / 2;
                  
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
  );
}