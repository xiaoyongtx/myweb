'use client';

import { useState, useEffect } from 'react';

export default function TimestampConverter() {
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [inputDateTime, setInputDateTime] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Shanghai');
  const [timestampUnit, setTimestampUnit] = useState<'seconds' | 'milliseconds'>('seconds');
  const [convertedDateTime, setConvertedDateTime] = useState('');
  const [convertedTimestamp, setConvertedTimestamp] = useState('');

  const timezones = [
    { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
    { value: 'UTC', label: 'UTC时间 (UTC+0)' },
    { value: 'America/New_York', label: '纽约时间 (UTC-5/-4)' },
    { value: 'America/Los_Angeles', label: '洛杉矶时间 (UTC-8/-7)' },
    { value: 'Europe/London', label: '伦敦时间 (UTC+0/+1)' },
    { value: 'Europe/Paris', label: '巴黎时间 (UTC+1/+2)' },
    { value: 'Asia/Tokyo', label: '东京时间 (UTC+9)' },
    { value: 'Asia/Seoul', label: '首尔时间 (UTC+9)' },
    { value: 'Australia/Sydney', label: '悉尼时间 (UTC+10/+11)' },
  ];

  // 更新当前时间戳
  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTimestamp(Date.now());
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 时间戳转日期时间
  const convertTimestampToDateTime = () => {
    if (!inputTimestamp) return;

    try {
      let timestamp = parseInt(inputTimestamp);
      
      // 如果是秒级时间戳，转换为毫秒
      if (timestampUnit === 'seconds') {
        timestamp *= 1000;
      }

      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        setConvertedDateTime('无效的时间戳');
        return;
      }

      // 格式化日期时间
      const formatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: selectedTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
      });

      const formattedDate = formatter.format(date);
      
      // 获取ISO格式
      const isoString = date.toISOString();
      
      // 获取时区偏移
      const timezoneOffset = getTimezoneOffset(date, selectedTimezone);
      
      const result = {
        formatted: formattedDate,
        iso: isoString,
        timezone: timezoneOffset,
        seconds: Math.floor(timestamp / 1000),
        milliseconds: timestamp
      };
      setConvertedDateTime(JSON.stringify(result));
    } catch (error) {
      setConvertedDateTime('转换失败，请检查时间戳格式');
    }
  };

  // 日期时间转时间戳
  const convertDateTimeToTimestamp = () => {
    if (!inputDateTime) return;

    try {
      const date = new Date(inputDateTime);
      
      if (isNaN(date.getTime())) {
        setConvertedTimestamp('无效的日期时间');
        return;
      }

      const timestamp = date.getTime();
      const secondsTimestamp = Math.floor(timestamp / 1000);

      const result = {
        seconds: secondsTimestamp,
        milliseconds: timestamp,
        iso: date.toISOString(),
        local: date.toLocaleString('zh-CN', { timeZone: selectedTimezone })
      };
      setConvertedTimestamp(JSON.stringify(result));
    } catch (error) {
      setConvertedTimestamp('转换失败，请检查日期时间格式');
    }
  };

  // 获取时区偏移信息
  const getTimezoneOffset = (date: Date, timezone: string) => {
    try {
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
      const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
      return `UTC${offset >= 0 ? '+' : ''}${offset}`;
    } catch {
      return 'Unknown';
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    }).catch(() => {
      alert('复制失败');
    });
  };

  // 获取常用时间戳
  const getCommonTimestamps = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    return [
      { label: '现在', timestamp: Math.floor(now.getTime() / 1000) },
      { label: '今天开始', timestamp: Math.floor(today.getTime() / 1000) },
      { label: '明天开始', timestamp: Math.floor(tomorrow.getTime() / 1000) },
      { label: '昨天开始', timestamp: Math.floor(yesterday.getTime() / 1000) },
      { label: '本周开始', timestamp: Math.floor(weekStart.getTime() / 1000) },
      { label: '本月开始', timestamp: Math.floor(monthStart.getTime() / 1000) },
      { label: '今年开始', timestamp: Math.floor(yearStart.getTime() / 1000) },
    ];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          时间戳转换
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          时间戳与日期时间的相互转换，支持多种时区和格式
        </p>
      </div>

      {/* 当前时间显示 */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          当前时间
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">当前时间戳(秒)</p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-lg font-mono">
                {Math.floor(currentTimestamp / 1000)}
              </code>
              <button
                onClick={() => copyToClipboard(Math.floor(currentTimestamp / 1000).toString())}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                复制
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">当前时间戳(毫秒)</p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-lg font-mono">
                {currentTimestamp}
              </code>
              <button
                onClick={() => copyToClipboard(currentTimestamp.toString())}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                复制
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">当前日期时间</p>
          <code className="block px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-lg">
            {new Date(currentTimestamp).toLocaleString('zh-CN', { 
              timeZone: selectedTimezone,
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              weekday: 'long'
            })}
          </code>
        </div>
      </div>

      {/* 时区选择 */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          时区设置
        </label>
        <select
          value={selectedTimezone}
          onChange={(e) => setSelectedTimezone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 时间戳转日期时间 */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            时间戳 → 日期时间
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                时间戳单位
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="seconds"
                    checked={timestampUnit === 'seconds'}
                    onChange={(e) => setTimestampUnit(e.target.value as 'seconds')}
                    className="mr-2"
                  />
                  秒 (10位)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="milliseconds"
                    checked={timestampUnit === 'milliseconds'}
                    onChange={(e) => setTimestampUnit(e.target.value as 'milliseconds')}
                    className="mr-2"
                  />
                  毫秒 (13位)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                输入时间戳
              </label>
              <input
                type="text"
                value={inputTimestamp}
                onChange={(e) => setInputTimestamp(e.target.value)}
                placeholder={timestampUnit === 'seconds' ? '1640995200' : '1640995200000'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={convertTimestampToDateTime}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              转换为日期时间
            </button>

            {convertedDateTime && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  转换结果
                </label>
                {(() => {
                  try {
                    const result = JSON.parse(convertedDateTime);
                    return (
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">格式化时间</div>
                          <div className="text-blue-800 dark:text-blue-200 font-mono">{result.formatted}</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">ISO格式</div>
                          <div className="text-green-800 dark:text-green-200 font-mono">{result.iso}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">Unix时间戳(秒)</div>
                            <div className="text-purple-800 dark:text-purple-200 font-mono">{result.seconds}</div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">Unix时间戳(毫秒)</div>
                            <div className="text-orange-800 dark:text-orange-200 font-mono">{result.milliseconds}</div>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">时区偏移</div>
                          <div className="text-gray-800 dark:text-gray-200 font-mono">{result.timezone}</div>
                        </div>
                      </div>
                    );
                  } catch {
                    return (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="text-red-800 dark:text-red-200">{convertedDateTime}</div>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        </div>

        {/* 日期时间转时间戳 */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            日期时间 → 时间戳
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                输入日期时间
              </label>
              <input
                type="datetime-local"
                value={inputDateTime}
                onChange={(e) => setInputDateTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                也可以输入如: 2024-01-01 12:00:00
              </p>
            </div>

            <button
              onClick={convertDateTimeToTimestamp}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              转换为时间戳
            </button>

            {convertedTimestamp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  转换结果
                </label>
                {(() => {
                  try {
                    const result = JSON.parse(convertedTimestamp);
                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">Unix时间戳(秒)</div>
                            <div className="text-purple-800 dark:text-purple-200 font-mono">{result.seconds}</div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">Unix时间戳(毫秒)</div>
                            <div className="text-orange-800 dark:text-orange-200 font-mono">{result.milliseconds}</div>
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">ISO格式</div>
                          <div className="text-green-800 dark:text-green-200 font-mono">{result.iso}</div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">本地时间</div>
                          <div className="text-blue-800 dark:text-blue-200 font-mono">{result.local}</div>
                        </div>
                      </div>
                    );
                  } catch {
                    return (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="text-red-800 dark:text-red-200">{convertedTimestamp}</div>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 常用时间戳 */}
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          常用时间戳
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {getCommonTimestamps().map((item) => (
            <button
              key={item.label}
              onClick={() => setInputTimestamp(item.timestamp.toString())}
              className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-center"
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {item.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {item.timestamp}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          使用说明
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h3 className="font-medium mb-2">时间戳格式</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>秒级：</strong>10位数字（如：1640995200）</li>
              <li><strong>毫秒级：</strong>13位数字（如：1640995200000）</li>
              <li><strong>起始时间：</strong>1970年1月1日 00:00:00 UTC</li>
              <li>支持正负时间戳转换</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">功能特性</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>支持9个主要时区转换</li>
              <li>实时显示当前时间戳</li>
              <li>常用时间戳快速选择</li>
              <li>一键复制到剪贴板</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>时间戳是计算机系统中表示时间的标准方式，广泛用于数据库、日志文件和API接口中。
          </p>
        </div>
      </div>
    </div>
  );
}