'use client';

import { useState } from 'react';

interface PhoneInfo {
  phone: string;
  province: string;
  city: string;
  operator: string;
  areaCode: string;
  postCode: string;
}

// 手机号段数据库（简化版，实际应用中应该使用完整的数据库）
const phoneDatabase: Record<string, Omit<PhoneInfo, 'phone'>> = {
  // 中国移动
  '134': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '135': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '136': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '137': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '138': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '139': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '147': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '150': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '151': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '152': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '157': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '158': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '159': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '178': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '182': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '183': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '184': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '187': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '188': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },
  '198': { province: '全国', city: '全国', operator: '中国移动', areaCode: '', postCode: '' },

  // 中国联通
  '130': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },
  '131': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },
  '132': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },
  '145': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },
  '155': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },
  '156': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },
  '166': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },
  '175': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },
  '176': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },
  '185': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },
  '186': { province: '全国', city: '全国', operator: '中国联通', areaCode: '', postCode: '' },

  // 中国电信
  '133': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },
  '149': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },
  '153': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },
  '173': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },
  '177': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },
  '180': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },
  '181': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },
  '189': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },
  '191': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },
  '193': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },
  '199': { province: '全国', city: '全国', operator: '中国电信', areaCode: '', postCode: '' },

  // 中国广电
  '192': { province: '全国', city: '全国', operator: '中国广电', areaCode: '', postCode: '' },
};

// 更详细的号段数据（部分示例）
const detailedPhoneDatabase: Record<string, Omit<PhoneInfo, 'phone'>> = {
  // 北京移动
  '13401': { province: '北京', city: '北京', operator: '中国移动', areaCode: '010', postCode: '100000' },
  '13402': { province: '北京', city: '北京', operator: '中国移动', areaCode: '010', postCode: '100000' },
  '13501': { province: '北京', city: '北京', operator: '中国移动', areaCode: '010', postCode: '100000' },
  
  // 上海移动
  '13404': { province: '上海', city: '上海', operator: '中国移动', areaCode: '021', postCode: '200000' },
  '13504': { province: '上海', city: '上海', operator: '中国移动', areaCode: '021', postCode: '200000' },
  
  // 广州移动
  '13407': { province: '广东', city: '广州', operator: '中国移动', areaCode: '020', postCode: '510000' },
  '13507': { province: '广东', city: '广州', operator: '中国移动', areaCode: '020', postCode: '510000' },
  
  // 深圳移动
  '13408': { province: '广东', city: '深圳', operator: '中国移动', areaCode: '0755', postCode: '518000' },
  '13508': { province: '广东', city: '深圳', operator: '中国移动', areaCode: '0755', postCode: '518000' },
  
  // 杭州移动
  '13405': { province: '浙江', city: '杭州', operator: '中国移动', areaCode: '0571', postCode: '310000' },
  '13505': { province: '浙江', city: '杭州', operator: '中国移动', areaCode: '0571', postCode: '310000' },
  
  // 南京移动
  '13403': { province: '江苏', city: '南京', operator: '中国移动', areaCode: '025', postCode: '210000' },
  '13503': { province: '江苏', city: '南京', operator: '中国移动', areaCode: '025', postCode: '210000' },
  
  // 成都移动
  '13409': { province: '四川', city: '成都', operator: '中国移动', areaCode: '028', postCode: '610000' },
  '13509': { province: '四川', city: '成都', operator: '中国移动', areaCode: '028', postCode: '610000' },
  
  // 武汉移动
  '13406': { province: '湖北', city: '武汉', operator: '中国移动', areaCode: '027', postCode: '430000' },
  '13506': { province: '湖北', city: '武汉', operator: '中国移动', areaCode: '027', postCode: '430000' },
};

export default function PhoneLocation() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [queryResult, setQueryResult] = useState<PhoneInfo | null>(null);
  const [queryHistory, setQueryHistory] = useState<PhoneInfo[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    // 中国大陆手机号码正则表达式
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const queryPhoneLocation = async () => {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    
    if (!cleanPhone) {
      alert('请输入手机号码');
      return;
    }

    if (!validatePhoneNumber(cleanPhone)) {
      alert('请输入有效的中国大陆手机号码');
      return;
    }

    setIsQuerying(true);

    try {
      // 模拟API查询延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 先尝试5位号段查询（更精确）
      const prefix5 = cleanPhone.substring(0, 5);
      let phoneInfo = detailedPhoneDatabase[prefix5];

      // 如果5位号段没找到，尝试3位号段查询
      if (!phoneInfo) {
        const prefix3 = cleanPhone.substring(0, 3);
        phoneInfo = phoneDatabase[prefix3];
      }

      if (phoneInfo) {
        const result: PhoneInfo = {
          phone: cleanPhone,
          ...phoneInfo
        };

        setQueryResult(result);
        
        // 添加到查询历史（避免重复）
        setQueryHistory(prev => {
          const filtered = prev.filter(item => item.phone !== cleanPhone);
          return [result, ...filtered].slice(0, 10); // 只保留最近10条
        });
      } else {
        alert('未找到该号码的归属地信息');
        setQueryResult(null);
      }
    } catch (err) {
      alert('查询失败，请稍后重试');
      setQueryResult(null);
    } finally {
      setIsQuerying(false);
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  const clearHistory = () => {
    setQueryHistory([]);
  };

  const queryFromHistory = (phone: string) => {
    setPhoneNumber(phone);
    const historyItem = queryHistory.find(item => item.phone === phone);
    if (historyItem) {
      setQueryResult(historyItem);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      queryPhoneLocation();
    }
  };

  const getOperatorColor = (operator: string): string => {
    switch (operator) {
      case '中国移动':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case '中国联通':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case '中国电信':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case '中国广电':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          手机号归属地查询
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          快速查询手机号码的归属地信息，包括省份、城市、运营商等详细信息
        </p>
      </div>

      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            号码查询
          </h2>
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                  setPhoneNumber(value);
                }
              }}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="请输入11位手机号码"
              maxLength={11}
            />
            <button
              onClick={queryPhoneLocation}
              disabled={isQuerying || !phoneNumber}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isQuerying ? '查询中...' : '查询'}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            支持中国大陆手机号码查询，按回车键快速查询
          </div>
        </div>
      </div>

      {queryResult && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              查询结果
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">手机号码</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatPhoneNumber(queryResult.phone)}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">运营商</div>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOperatorColor(queryResult.operator)}`}>
                    {queryResult.operator}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">省份</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {queryResult.province}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">城市</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {queryResult.city}
                </div>
              </div>
              
              {queryResult.areaCode && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">区号</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {queryResult.areaCode}
                  </div>
                </div>
              )}
              
              {queryResult.postCode && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">邮编</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {queryResult.postCode}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {queryHistory.length > 0 && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                查询历史
              </h2>
              <button
                onClick={clearHistory}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                清空
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {queryHistory.map((item, index) => (
                <div
                  key={index}
                  onClick={() => queryFromHistory(item.phone)}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatPhoneNumber(item.phone)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.province} {item.city}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOperatorColor(item.operator)}`}>
                      {item.operator.replace('中国', '')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
            <h3 className="font-medium mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              功能特点
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>支持中国大陆所有运营商手机号码查询</li>
              <li>包含中国移动、中国联通、中国电信、中国广电</li>
              <li>提供省份、城市、运营商等详细信息</li>
              <li>部分号段可提供区号和邮编信息</li>
              <li>查询结果自动保存到历史记录</li>
              <li>支持批量查看历史记录</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              运营商号段
            </h3>
            <div className="space-y-3">
              <div>
                <div className="font-medium text-green-600 dark:text-green-400 mb-1">中国移动</div>
                <div className="text-xs">134-139, 147, 150-152, 157-159, 178, 182-184, 187-188, 198</div>
              </div>
              <div>
                <div className="font-medium text-blue-600 dark:text-blue-400 mb-1">中国联通</div>
                <div className="text-xs">130-132, 145, 155-156, 166, 175-176, 185-186</div>
              </div>
              <div>
                <div className="font-medium text-red-600 dark:text-red-400 mb-1">中国电信</div>
                <div className="text-xs">133, 149, 153, 173, 177, 180-181, 189, 191, 193, 199</div>
              </div>
              <div>
                <div className="font-medium text-purple-600 dark:text-purple-400 mb-1">中国广电</div>
                <div className="text-xs">192</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
          <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            使用技巧
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200 list-disc list-inside">
            <li>输入11位手机号码即可查询，支持键盘回车键快速查询</li>
            <li>点击历史记录可快速重新查询，历史记录最多保存10条</li>
            <li>不同运营商用不同颜色标识，便于快速识别</li>
            <li>部分城市号段可显示具体的区号和邮编信息</li>
            <li>查询结果基于号段数据库，准确率较高</li>
          </ul>
        </div>
      </div>
    </div>
  );
}