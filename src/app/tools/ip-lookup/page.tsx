'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface IPInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  timezone: string;
  lat?: number;
  lon?: number;
}

export default function IPLookup() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [customIP, setCustomIP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取用户的公网IP信息
  const fetchIPInfo = async (ip?: string) => {
    console.log('开始查询IP:', ip || '当前用户IP'); // 调试信息
    setLoading(true);
    setError('');
    
    try {
      // 使用我们的API路由，添加时间戳避免缓存
      const timestamp = Date.now();
      const url = ip ? `/api/ip-lookup?ip=${encodeURIComponent(ip)}&t=${timestamp}` : `/api/ip-lookup?t=${timestamp}`;
      console.log('请求URL:', url); // 调试信息
      
      // 添加超时处理
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      // 添加缓存控制和错误处理
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }).finally(() => clearTimeout(timeoutId));
      
      if (!response.ok) {
        let errorMessage = '获取IP信息失败';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.error('解析错误响应失败:', e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('API响应数据:', data); // 调试信息
      
      // 即使有错误也显示部分信息
      setIpInfo({
        ip: data.ip || ip || '未知',
        country: data.country || '未知',
        region: data.region || '未知',
        city: data.city || '未知',
        isp: data.isp || '未知',
        timezone: data.timezone || '未知',
        lat: data.lat,
        lon: data.lon
      });
      
      // 如果有错误信息，显示在错误提示中
      if (data.error) {
        setError(`${data.error}`);
      }
    } catch (err) {
      console.error('IP查询错误:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('查询超时，请稍后再试');
      } else {
        setError(err instanceof Error ? err.message : '获取IP信息失败');
      }
      
      // 如果提供了IP，至少显示这个IP
      if (ip) {
        setIpInfo({
          ip: ip,
          country: '未知',
          region: '未知',
          city: '未知',
          isp: '未知',
          timezone: '未知'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时自动获取用户IP
  useEffect(() => {
    fetchIPInfo();
  }, []);

  // 查询自定义IP
  const handleCustomLookup = () => {
    if (!customIP.trim()) {
      setError('请输入有效的IP地址');
      return;
    }
    
    // 简单的IP格式验证
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(customIP.trim())) {
      setError('请输入有效的IPv4地址格式');
      return;
    }
    
    fetchIPInfo(customIP.trim());
  };

  // 重新获取当前IP
  const refreshCurrentIP = () => {
    console.log('点击了我的IP按钮'); // 调试信息
    setCustomIP('');
    setIpInfo(null); // 清除之前的信息
    // 强制清除缓存
    fetchIPInfo();
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
          公网IP查询工具
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          查询您的公网IP地址及地理位置信息
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* 查询控制面板 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                查询指定IP地址（可选）
              </label>
              <input
                type="text"
                value={customIP}
                onChange={(e) => setCustomIP(e.target.value)}
                placeholder="输入IP地址，如：8.8.8.8"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomLookup()}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCustomLookup}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '查询中...' : '查询IP'}
              </button>
              <button
                onClick={refreshCurrentIP}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                我的IP
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* IP信息展示 */}
        {ipInfo && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              IP地址信息
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">IP地址</p>
                    <p className="text-lg font-mono text-gray-600 dark:text-gray-300">{ipInfo.ip}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">国家/地区</p>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{ipInfo.country}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">省份/城市</p>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{ipInfo.region} / {ipInfo.city}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">网络服务商</p>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{ipInfo.isp}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">时区</p>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{ipInfo.timezone}</p>
                  </div>
                </div>

                {ipInfo.lat && ipInfo.lon && (
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-shrink-0 h-10 w-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-red-600 dark:text-red-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">经纬度</p>
                      <p className="text-lg font-mono text-gray-600 dark:text-gray-300">
                        {ipInfo.lat.toFixed(4)}, {ipInfo.lon.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 地图链接 */}
            {ipInfo.lat && ipInfo.lon && (
              <div className="mt-6 text-center">
                <a
                  href={`https://www.google.com/maps?q=${ipInfo.lat},${ipInfo.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  在地图中查看位置
                </a>
              </div>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
            使用说明
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• 页面加载时会自动显示您当前的公网IP地址信息</li>
            <li>• 您可以在输入框中输入任意IP地址来查询其地理位置信息</li>
            <li>• 点击&quot;我的IP&quot;按钮可以重新获取您当前的IP信息</li>
            <li>• 如果有经纬度信息，可以点击&quot;在地图中查看位置&quot;按钮在Google地图中查看具体位置</li>
            <li>• 本工具使用免费的IP地理位置数据库，信息仅供参考</li>
          </ul>
        </div>
      </div>
    </div>
  );
}