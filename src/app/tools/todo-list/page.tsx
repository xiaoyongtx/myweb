'use client';

import { useState, useEffect } from 'react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'category'>('date');
  const [searchTerm, setSearchTerm] = useState('');

  // 从localStorage加载数据
  useEffect(() => {
    const saved = localStorage.getItem('todoList');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTodos(parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        })));
      } catch (error) {
        console.error('加载待办事项失败:', error);
      }
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('todoList', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;

    const todo: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date(),
      priority: newPriority,
      category: newCategory.trim() || '默认'
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo('');
    setNewCategory('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const editTodo = (id: string, newText: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };

  const clearAll = () => {
    if (confirm('确定要清空所有待办事项吗？')) {
      setTodos([]);
    }
  };

  // 过滤和排序
  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    .filter(todo => 
      todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  };

  const categories = Array.from(new Set(todos.map(t => t.category)));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const exportTodos = () => {
    const data = {
      todos,
      exportDate: new Date().toISOString(),
      stats
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTodos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.todos && Array.isArray(data.todos)) {
          const importedTodos = data.todos.map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
          }));
          setTodos(prev => [...importedTodos, ...prev]);
          alert(`成功导入 ${importedTodos.length} 个待办事项`);
        }
      } catch (error) {
        alert('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          待办清单
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          高效管理你的任务和计划
        </p>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-sm text-blue-800 dark:text-blue-200">总计</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
          <div className="text-sm text-green-800 dark:text-green-200">已完成</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.active}</div>
          <div className="text-sm text-orange-800 dark:text-orange-200">待完成</div>
        </div>
      </div>

      {/* 添加新任务 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          添加新任务
        </h2>
        
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="输入新的待办事项..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                优先级
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                分类
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="工作、学习、生活..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={addTodo}
                disabled={!newTodo.trim()}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                添加任务
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 过滤和搜索 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              搜索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索任务或分类..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              状态过滤
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">全部</option>
              <option value="active">待完成</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              排序方式
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'category')}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="date">创建时间</option>
              <option value="priority">优先级</option>
              <option value="category">分类</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={clearCompleted}
              className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              清除已完成
            </button>
            <button
              onClick={clearAll}
              className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              清空全部
            </button>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            任务列表 ({filteredTodos.length})
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={exportTodos}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              导出
            </button>
            <label className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">
              导入
              <input
                type="file"
                accept=".json"
                onChange={importTodos}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {todos.length === 0 ? '还没有任何待办事项，添加一个开始吧！' : '没有找到匹配的任务'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <TodoItemComponent
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* 分类统计 */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            分类统计
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(category => {
              const categoryTodos = todos.filter(t => t.category === category);
              const completed = categoryTodos.filter(t => t.completed).length;
              return (
                <div key={category} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">{category}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {completed}/{categoryTodos.length}
                  </div>
                </div>
              );
            })}
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
            <h3 className="font-medium mb-2">基本功能</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>添加、编辑、删除待办事项</li>
              <li>设置优先级（高、中、低）</li>
              <li>分类管理任务</li>
              <li>标记完成状态</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">高级功能</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>按状态、优先级、分类筛选</li>
              <li>搜索功能快速定位</li>
              <li>分类统计和进度跟踪</li>
              <li>点击任务文本可直接编辑</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>提示：</strong>数据保存在浏览器本地，清除浏览器数据会丢失任务。建议定期备份重要任务。
          </p>
        </div>
      </div>
    </div>
  );
}

// 单个待办事项组件
function TodoItemComponent({ 
  todo, 
  onToggle, 
  onDelete, 
  onEdit, 
  getPriorityColor 
}: {
  todo: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  getPriorityColor: (priority: string) => string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    if (editText.trim() && editText !== todo.text) {
      onEdit(todo.id, editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
      todo.completed 
        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
    }`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
      />
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEdit}
            onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            autoFocus
          />
        ) : (
          <div
            className={`cursor-pointer ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
            onClick={() => setIsEditing(true)}
          >
            {todo.text}
          </div>
        )}
        
        <div className="flex items-center space-x-2 mt-1">
          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(todo.priority)}`}>
            {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
          </span>
          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full">
            {todo.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {todo.createdAt.toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <button
        onClick={() => onDelete(todo.id)}
        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        title="删除"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}