'use client';

import { useState } from 'react';

interface IPInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  timezone: string;
  lat?: number;
  lon?: number;
  type?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
}

interface IPHistory {
  ip: string;
  timestamp: number;
  info: IPInfo;
}

export default function IPLookup() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [customIP, setCustomIP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<IPHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentUserIP, setCurrentUserIP] = useState<string>('');

  // 获取用户的公网IP信息
  const fetchIPInfo = async (ip?: string) => {
    setLoading(true);
    setError('');
    
    try {
      const timestamp = Date.now();
      const url = ip ? `/api/ip-lookup?ip=${encodeURIComponent(ip)}&t=${timestamp}` : `/api/ip-lookup?t=${timestamp}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
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
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      const ipInfoData: IPInfo = {
        ip: data.ip || ip || '未知',
        country: data.country || '未知',
        region: data.region || '未知',
        city: data.city || '未知',
        isp: data.isp || '未知',
        timezone: data.timezone || '未知',
        lat: data.lat,
        lon: data.lon,
        type: data.type,
        mobile: data.mobile,
        proxy: data.proxy,
        hosting: data.hosting
      };
      
      setIpInfo(ipInfoData);
      
      // 如果不是查询当前用户IP，则保存到历史记录
      if (ip && ip !== currentUserIP) {
        const newHistory: IPHistory = {
          ip: ipInfoData.ip,
          timestamp: Date.now(),
          info: ipInfoData
        };
        setHistory(prev => [newHistory, ...prev.slice(0, 9)]); // 保留最近10条记录
      } else if (!ip) {
        setCurrentUserIP(ipInfoData.ip);
      }
      
      if (data.error) {
        setError(`${data.error}`);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('查询超时，请稍后再试');
      } else {
        setError(err instanceof Error ? err.message : '获取IP信息失败');
      }
      
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

  // IP格式验证
  const validateIP = (ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  // 查询自定义IP
  const handleCustomLookup = () => {
    if (!customIP.trim()) {
      setError('请输入有效的IP地址');
      return;
    }
    
    if (!validateIP(customIP.trim())) {
      setError('请输入有效的IP地址格式（支持IPv4和IPv6）');
      return;
    }
    
    fetchIPInfo(customIP.trim());
  };

  // 重新获取当前IP
  const refreshCurrentIP = () => {
    setCustomIP('');
    setIpInfo(null);
    fetchIPInfo();
  };

  // 从历史记录中选择IP
  const selectFromHistory = (historyItem: IPHistory) => {
    setCustomIP(historyItem.ip);
    setIpInfo(historyItem.info);
    setShowHistory(false);
  };

  // 清除历史记录
  const clearHistory = () => {
    setHistory([]);
    setShowHistory(false);
  };

  // 获取IP类型标签
  const getIPTypeLabel = (info: IPInfo) => {
    const labels = [];
    if (info.mobile) labels.push('移动网络');
    if (info.proxy) labels.push('代理');
    if (info.hosting) labels.push('托管服务器');
    if (info.type && info.type !== 'undefined') labels.push(info.type);
    return labels.length > 0 ? labels.join(' | ') : '普通网络';
  };

  // 格式化地址显示
  const formatLocation = (info: IPInfo) => {
    const parts = [];
    if (info.country && info.country !== '未知') parts.push(info.country);
    if (info.region && info.region !== '未知' && info.region !== info.country) parts.push(info.region);
    if (info.city && info.city !== '未知' && info.city !== info.region) parts.push(info.city);
    return parts.length > 0 ? parts.join(' - ') : '未知';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          IP地址查询
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          专业的IP地址查询工具，支持IPv4和IPv6地址查询
        </p>
      </div>

      {/* 主查询面板 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            IP地址查询
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={customIP}
              onChange={(e) => setCustomIP(e.target.value)}
              placeholder="输入IP地址，如：8.8.8.8"
              className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-l-md dark:bg-gray-700 dark:text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomLookup()}
            />
            <button
              onClick={handleCustomLookup}
              disabled={loading || !customIP.trim()}
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '查询中...' : '查询'}
            </button>
            <button
              onClick={refreshCurrentIP}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              查询我的IP
            </button>
          </div>
        </div>

        {/* 历史记录按钮 */}
        {history.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
            >
              查询历史 ({history.length})
            </button>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* 历史记录面板 */}
      {showHistory && history.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">查询历史</h3>
            <button
              onClick={clearHistory}
              className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm"
            >
              清除历史
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item, index) => (
              <div
                key={index}
                onClick={() => selectFromHistory(item)}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-mono text-sm text-indigo-600 dark:text-indigo-400">{item.ip}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {item.info.country} {item.info.city}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
  
    {/* IP信息展示 */}
      {ipInfo && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {/* 头部信息 */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  IP地址详细信息
                  <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    查询成功
                  </span>
                </h2>
                <p className="text-indigo-100 text-sm mt-1">查询时间: {new Date().toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono text-white">{ipInfo.ip}</div>
                <div className="text-indigo-100 text-sm">{getIPTypeLabel(ipInfo)}</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* 基本信息表格 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 w-32">
                      IP地址
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {ipInfo.ip}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800">
                      归属地
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <span className="mr-2">🌍</span>
                        {formatLocation(ipInfo)}
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800">
                      运营商
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <span className="mr-2">🏢</span>
                        {ipInfo.isp}
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800">
                      时区
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <span className="mr-2">🕐</span>
                        {ipInfo.timezone}
                      </div>
                    </td>
                  </tr>
                  {ipInfo.lat && ipInfo.lon && (
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800">
                        坐标
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          <span className="font-mono">
                            {ipInfo.lat.toFixed(6)}, {ipInfo.lon.toFixed(6)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800">
                      网络类型
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span>{getIPTypeLabel(ipInfo)}</span>
                        {ipInfo.mobile && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">移动</span>}
                        {ipInfo.proxy && <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">代理</span>}
                        {ipInfo.hosting && <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">托管</span>}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 操作按钮 */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {ipInfo.lat && ipInfo.lon && (
                <>
                  <a
                    href={`https://map.baidu.com/?latlng=${ipInfo.lat},${ipInfo.lon}&title=IP位置&content=${ipInfo.ip}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    百度地图
                  </a>
                  <a
                    href={`https://apis.map.qq.com/uri/v1/marker?marker=coord:${ipInfo.lat},${ipInfo.lon};title:IP位置;addr:${ipInfo.ip}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    腾讯地图
                  </a>
                </>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(ipInfo.ip)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                复制IP
              </button>
              <button
                onClick={() => {
                  const info = `IP: ${ipInfo.ip}\n归属地: ${ipInfo.country} ${ipInfo.region} ${ipInfo.city}\n运营商: ${ipInfo.isp}\n时区: ${ipInfo.timezone}`;
                  navigator.clipboard.writeText(info);
                }}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                复制详情
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 功能说明和常用IP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            使用说明
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">基本功能</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>点击"查询我的IP"获取当前公网IP</li>
                <li>支持IPv4和IPv6地址格式查询</li>
                <li>提供详细的地理位置信息</li>
                <li>显示运营商和网络类型</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">高级功能</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>支持地图定位和信息复制</li>
                <li>自动保存查询历史记录</li>
                <li>常用公共DNS快速查询</li>
                <li>数据来源于专业IP数据库</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>提示：</strong>IP地址信息可能因网络环境而异，查询结果仅供参考。
            </p>
          </div>
        </div>

        {/* 常用公共DNS */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
            常用公共IP
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Google DNS</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setCustomIP('8.8.8.8'); fetchIPInfo('8.8.8.8'); }}
                  className="px-3 py-1 bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 rounded text-xs font-mono hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  disabled={loading}
                >
                  8.8.8.8
                </button>
                <button
                  onClick={() => { setCustomIP('8.8.4.4'); fetchIPInfo('8.8.4.4'); }}
                  className="px-3 py-1 bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 rounded text-xs font-mono hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  disabled={loading}
                >
                  8.8.4.4
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Cloudflare DNS</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setCustomIP('1.1.1.1'); fetchIPInfo('1.1.1.1'); }}
                  className="px-3 py-1 bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 rounded text-xs font-mono hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  disabled={loading}
                >
                  1.1.1.1
                </button>
                <button
                  onClick={() => { setCustomIP('1.0.0.1'); fetchIPInfo('1.0.0.1'); }}
                  className="px-3 py-1 bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 rounded text-xs font-mono hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  disabled={loading}
                >
                  1.0.0.1
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">阿里DNS</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setCustomIP('223.5.5.5'); fetchIPInfo('223.5.5.5'); }}
                  className="px-3 py-1 bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 rounded text-xs font-mono hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  disabled={loading}
                >
                  223.5.5.5
                </button>
                <button
                  onClick={() => { setCustomIP('223.6.6.6'); fetchIPInfo('223.6.6.6'); }}
                  className="px-3 py-1 bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 rounded text-xs font-mono hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  disabled={loading}
                >
                  223.6.6.6
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">腾讯DNS</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setCustomIP('119.29.29.29'); fetchIPInfo('119.29.29.29'); }}
                  className="px-3 py-1 bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 rounded text-xs font-mono hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  disabled={loading}
                >
                  119.29.29.29
                </button>
                <button
                  onClick={() => { setCustomIP('182.254.116.116'); fetchIPInfo('182.254.116.116'); }}
                  className="px-3 py-1 bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 rounded text-xs font-mono hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  disabled={loading}
                >
                  182.254.116.116
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}