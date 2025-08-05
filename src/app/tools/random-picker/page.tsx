'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

interface PickHistory {
  name: string;
  timestamp: Date;
  round: number;
}

export default function RandomPicker() {
  const [nameList, setNameList] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [pickedName, setPickedName] = useState('');
  const [excludePicked, setExcludePicked] = useState(true);
  const [pickedNames, setPickedNames] = useState<string[]>([]);
  const [history, setHistory] = useState<PickHistory[]>([]);
  const [round, setRound] = useState(1);
  const [spinDuration, setSpinDuration] = useState(3);
  const [showAnimation, setShowAnimation] = useState(true);
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [excelData, setExcelData] = useState<string[][]>([]);
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [startRow, setStartRow] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // 从localStorage加载数据
  useEffect(() => {
    const savedNames = localStorage.getItem('randomPickerNames');
    const savedHistory = localStorage.getItem('randomPickerHistory');
    const savedPickedNames = localStorage.getItem('randomPickerPicked');
    const savedRound = localStorage.getItem('randomPickerRound');

    if (savedNames) {
      try {
        setNameList(JSON.parse(savedNames));
      } catch (error) {
        console.error('加载名单失败:', error);
      }
    }

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    }

    if (savedPickedNames) {
      try {
        setPickedNames(JSON.parse(savedPickedNames));
      } catch (error) {
        console.error('加载已选名单失败:', error);
      }
    }

    if (savedRound) {
      setRound(parseInt(savedRound));
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('randomPickerNames', JSON.stringify(nameList));
  }, [nameList]);

  useEffect(() => {
    localStorage.setItem('randomPickerHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('randomPickerPicked', JSON.stringify(pickedNames));
  }, [pickedNames]);

  useEffect(() => {
    localStorage.setItem('randomPickerRound', round.toString());
  }, [round]);

  const addName = () => {
    const trimmedName = newName.trim();
    if (trimmedName && !nameList.includes(trimmedName)) {
      setNameList(prev => [...prev, trimmedName]);
      setNewName('');
    }
  };

  const removeName = (name: string) => {
    setNameList(prev => prev.filter(n => n !== name));
    setPickedNames(prev => prev.filter(n => n !== name));
  };

  const clearAllNames = () => {
    if (confirm('确定要清空所有名单吗？')) {
      setNameList([]);
      setPickedNames([]);
      setHistory([]);
      setCurrentName('');
      setPickedName('');
      setRound(1);
    }
  };

  const getAvailableNames = () => {
    return excludePicked ? nameList.filter(name => !pickedNames.includes(name)) : nameList;
  };

  const startPicking = () => {
    const availableNames = getAvailableNames();
    
    if (availableNames.length === 0) {
      if (excludePicked && pickedNames.length > 0) {
        alert('本轮所有人员都已被选中！请开始新一轮或取消排除已选中选项。');
      } else {
        alert('请先添加名单！');
      }
      return;
    }

    setIsSpinning(true);
    setPickedName('');
    
    if (showAnimation) {
      // 动画效果：快速切换显示名字
      let counter = 0;
      const maxCount = spinDuration * 20; // 每秒20次
      
      intervalRef.current = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * availableNames.length);
        setCurrentName(availableNames[randomIndex]);
        counter++;
        
        if (counter >= maxCount) {
          clearInterval(intervalRef.current!);
          finalizePick(availableNames);
        }
      }, 50);
    } else {
      // 直接选择
      setTimeout(() => {
        finalizePick(availableNames);
      }, 500);
    }
  };

  const finalizePick = (availableNames: string[]) => {
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    const selectedName = availableNames[randomIndex];
    
    setCurrentName(selectedName);
    setPickedName(selectedName);
    setIsSpinning(false);
    
    // 添加到已选中列表
    if (excludePicked) {
      setPickedNames(prev => [...prev, selectedName]);
    }
    
    // 添加到历史记录
    const historyItem: PickHistory = {
      name: selectedName,
      timestamp: new Date(),
      round
    };
    setHistory(prev => [historyItem, ...prev]);
    
    // 播放提示音（如果浏览器支持）
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play().catch(() => {});
    } catch (error) {
      // 忽略音频播放错误
    }
  };

  const resetRound = () => {
    if (confirm('确定要开始新一轮吗？这将清空已选中的名单。')) {
      setPickedNames([]);
      setRound(prev => prev + 1);
      setPickedName('');
      setCurrentName('');
    }
  };

  const importNames = () => {
    const names = importText
      .split(/[,，\n\r\t]/)
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length === 0) {
      alert('请输入有效的名单');
      return;
    }
    
    const newNames = names.filter(name => !nameList.includes(name));
    setNameList(prev => [...prev, ...newNames]);
    setImportText('');
    setShowImportModal(false);
    
    alert(`成功导入 ${newNames.length} 个新名字`);
  };

  const handleExcelFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 转换为二维数组
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '' 
        }) as string[][];
        
        if (jsonData.length === 0) {
          alert('Excel文件为空或格式不正确');
          return;
        }
        
        setExcelData(jsonData);
        setSelectedColumn(0);
        setStartRow(1);
        setShowExcelImportModal(true);
        
      } catch (error) {
        console.error('解析Excel文件失败:', error);
        alert('解析Excel文件失败，请检查文件格式');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const importFromExcel = () => {
    if (excelData.length === 0) return;
    
    const names: string[] = [];
    
    // 从指定行开始，提取指定列的数据
    for (let i = startRow; i < excelData.length; i++) {
      const row = excelData[i];
      if (row && row[selectedColumn]) {
        const name = String(row[selectedColumn]).trim();
        if (name && !names.includes(name)) {
          names.push(name);
        }
      }
    }
    
    if (names.length === 0) {
      alert('没有找到有效的名字数据');
      return;
    }
    
    const newNames = names.filter(name => !nameList.includes(name));
    setNameList(prev => [...prev, ...newNames]);
    setShowExcelImportModal(false);
    setExcelData([]);
    
    if (excelFileInputRef.current) {
      excelFileInputRef.current.value = '';
    }
    
    alert(`成功从Excel导入 ${newNames.length} 个新名字`);
  };

  const exportToExcel = () => {
    const data = [
      ['姓名', '状态', '轮次', '时间'],
      ...nameList.map(name => {
        const lastPicked = history.find(h => h.name === name);
        return [
          name,
          pickedNames.includes(name) ? '已选中' : '未选中',
          lastPicked ? `第${lastPicked.round}轮` : '-',
          lastPicked ? lastPicked.timestamp.toLocaleString() : '-'
        ];
      })
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '点名名单');
    
    XLSX.writeFile(workbook, `点名名单_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportNames = () => {
    const data = {
      nameList,
      history,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `random-picker-data-${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (confirm('确定要清空历史记录吗？')) {
      setHistory([]);
    }
  };

  const availableNames = getAvailableNames();
  const totalNames = nameList.length;
  const pickedCount = pickedNames.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          随机点名
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          公平、随机的点名工具，支持多轮点名和历史记录
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* 左侧：名单管理 */}
        <div className="flex flex-col h-full space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              名单管理 ({totalNames} 人)
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addName()}
                  placeholder="输入姓名..."
                  className="flex-1 h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={addName}
                  disabled={!newName.trim() || nameList.includes(newName.trim())}
                  className="h-10 px-6 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  添加
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="h-10 px-3 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  文本导入
                </button>
                <button
                  onClick={() => excelFileInputRef.current?.click()}
                  className="h-10 px-3 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center"
                >
                  Excel导入
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={exportNames}
                  className="h-10 px-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  导出JSON
                </button>
                <button
                  onClick={exportToExcel}
                  className="h-10 px-3 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center justify-center"
                >
                  导出Excel
                </button>
              </div>
              
              <button
                onClick={clearAllNames}
                className="w-full h-10 px-3 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                清空全部
              </button>
              
              {/* 隐藏的Excel文件输入 */}
              <input
                ref={excelFileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelFile}
                className="hidden"
              />
            </div>
          </div>

          {/* 名单列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
              当前名单
            </h3>
            
            {nameList.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                还没有添加任何名字
              </div>
            ) : (
              <div className="overflow-y-auto space-y-2 max-h-[calc(100vh-220px)]">
                {nameList.map((name, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                      pickedNames.includes(name)
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className={`flex-1 ${pickedNames.includes(name) ? 'line-through' : ''}`}>
                      {name}
                    </span>
                    <button
                      onClick={() => removeName(name)}
                      className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors ml-2"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 中间：点名区域 */}
        <div className="flex flex-col h-full space-y-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              第 {round} 轮点名
            </h2>
            
            {/* 状态显示 */}
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                可选人数: {availableNames.length} / {totalNames}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${totalNames > 0 ? (pickedCount / totalNames) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                已选中 {pickedCount} 人 ({totalNames > 0 ? Math.round((pickedCount / totalNames) * 100) : 0}%)
              </div>
            </div>

            {/* 点名显示区域 */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-56 h-56 rounded-full border-4 transition-all duration-300 ${
                isSpinning 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 animate-pulse' 
                  : pickedName
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
              }`}>
                <div className="text-center">
                  {isSpinning ? (
                    <div>
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                        {currentName || '准备中...'}
                      </div>
                      <div className="text-sm text-indigo-500 dark:text-indigo-300">
                        点名中...
                      </div>
                    </div>
                  ) : pickedName ? (
                    <div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {pickedName}
                      </div>
                      <div className="text-sm text-green-500 dark:text-green-300">
                        恭喜被选中！
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="text-lg mb-2">点击开始点名</div>
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="space-y-4">
              <button
                onClick={startPicking}
                disabled={isSpinning || availableNames.length === 0}
                className="w-full h-12 px-6 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium flex items-center justify-center"
              >
                {isSpinning ? '点名中...' : '开始点名'}
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={resetRound}
                  className="flex-1 h-10 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  新一轮
                </button>
                <button
                  onClick={() => {
                    setPickedName('');
                    setCurrentName('');
                  }}
                  className="flex-1 h-10 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  清除结果
                </button>
              </div>
            </div>
          </div>

          {/* 设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
              点名设置
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  排除已选中
                </label>
                <input
                  type="checkbox"
                  checked={excludePicked}
                  onChange={(e) => setExcludePicked(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  显示动画
                </label>
                <input
                  type="checkbox"
                  checked={showAnimation}
                  onChange={(e) => setShowAnimation(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </div>
              
              {showAnimation && (
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    动画时长: {spinDuration}秒
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={spinDuration}
                    onChange={(e) => setSpinDuration(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>1秒</span>
                    <span>10秒</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：历史记录 */}
        <div className="flex flex-col h-full space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                历史记录 ({history.length})
              </h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="h-8 px-3 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  清空
                </button>
              )}
            </div>
            
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                还没有点名记录
              </div>
            ) : (
              <div className="overflow-y-auto space-y-2 max-h-[calc(100vh-220px)]">
                {history.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {record.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        第{record.round}轮 · {record.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 ml-3">
                      #{history.length - index}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 文本导入模态框 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              文本导入名单
            </h3>
            
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="请输入名单，支持逗号、换行分隔&#10;例如：&#10;张三,李四,王五&#10;或者每行一个名字"
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
            />
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText('');
                }}
                className="h-10 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center justify-center"
              >
                取消
              </button>
              <button
                onClick={importNames}
                disabled={!importText.trim()}
                className="h-10 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel导入模态框 */}
      {showExcelImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Excel导入设置
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* 左侧：设置 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    选择包含姓名的列
                  </label>
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    {excelData[0]?.map((header, index) => (
                      <option key={index} value={index}>
                        列 {String.fromCharCode(65 + index)} {header ? `(${header})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    开始行 (跳过表头)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={excelData.length - 1}
                    value={startRow}
                    onChange={(e) => setStartRow(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    从第 {startRow + 1} 行开始导入数据
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <div className="font-medium mb-1">预览将导入的数据：</div>
                    <div className="max-h-32 overflow-y-auto">
                      {excelData.slice(startRow, startRow + 10).map((row, index) => {
                        const name = String(row[selectedColumn] || '').trim();
                        return name ? (
                          <div key={index} className="text-xs py-1">
                            {startRow + index + 1}. {name}
                          </div>
                        ) : null;
                      })}
                      {excelData.length > startRow + 10 && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          ... 还有 {excelData.length - startRow - 10} 行
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 右侧：数据预览 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excel数据预览 (前10行)
                </h4>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                  <div className="max-h-64 overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                            行
                          </th>
                          {excelData[0]?.map((header, index) => (
                            <th
                              key={index}
                              className={`px-2 py-1 text-left font-medium border-r border-gray-300 dark:border-gray-600 ${
                                index === selectedColumn
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {String.fromCharCode(65 + index)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {excelData.slice(0, 10).map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className={`border-b border-gray-200 dark:border-gray-600 ${
                              rowIndex >= startRow ? 'bg-green-50 dark:bg-green-900/10' : ''
                            }`}
                          >
                            <td className="px-2 py-1 text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600">
                              {rowIndex + 1}
                            </td>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className={`px-2 py-1 border-r border-gray-300 dark:border-gray-600 ${
                                  cellIndex === selectedColumn && rowIndex >= startRow
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 font-medium'
                                    : ''
                                }`}
                              >
                                {String(cell || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowExcelImportModal(false);
                  setExcelData([]);
                }}
                className="h-10 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center justify-center"
              >
                取消
              </button>
              <button
                onClick={importFromExcel}
                className="h-10 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                确认导入
              </button>
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
        <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h3 className="font-medium mb-2">基本功能</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>添加和管理名单</li>
              <li>随机公平点名</li>
              <li>支持多轮点名</li>
              <li>完整的历史记录</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">高级功能</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>文本批量导入名单</li>
              <li>Excel文件导入支持</li>
              <li>JSON/Excel数据导出</li>
              <li>排除已选中选项</li>
              <li>自定义动画效果</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">使用场景</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>课堂随机提问</li>
              <li>会议发言安排</li>
              <li>活动抽奖</li>
              <li>团队分组</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}