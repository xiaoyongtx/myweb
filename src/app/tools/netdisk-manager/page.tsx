'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

interface NetdiskLink {
  id: string;
  user_id: string;
  name: string;
  url: string;
  extract_code?: string;
  platform: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// 网盘平台识别
const detectPlatform = (url: string): string => {
  if (url.includes('pan.baidu.com')) return '百度网盘';
  if (url.includes('cloud.189.cn')) return '天翼云盘';
  if (url.includes('pan.xunlei.com')) return '迅雷网盘';
  if (url.includes('www.aliyundrive.com')) return '阿里云盘';
  if (url.includes('pan.quark.cn')) return '夸克网盘';
  if (url.includes('drive.google.com')) return 'Google Drive';
  if (url.includes('onedrive.live.com')) return 'OneDrive';
  if (url.includes('dropbox.com')) return 'Dropbox';
  return '其他';
};

// 从文本中提取多个链接信息
const parseNetdiskText = (text: string): Partial<NetdiskLink>[] => {
  const results: Partial<NetdiskLink>[] = [];
  
  // 先按段落分割文本，每个段落可能包含一个完整的分享信息
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  
  // 如果没有明显的段落分割，尝试按特定模式分割
  let segments: string[] = [];
  if (paragraphs.length <= 1) {
    // 按"通过"、"我用"等关键词分割
    segments = text.split(/(?=通过.*?分享|我用.*?给你分享)/).filter(s => s.trim());
  } else {
    segments = paragraphs;
  }
  
  // 如果还是只有一段，按链接分割
  if (segments.length <= 1) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    if (urls.length > 1) {
      segments = [];
      let lastIndex = 0;
      urls.forEach((url, index) => {
        const urlIndex = text.indexOf(url, lastIndex);
        if (index === 0) {
          // 第一个URL，包含前面的内容
          segments.push(text.substring(0, urlIndex + url.length));
        } else {
          // 后续URL，从上一个URL结束到当前URL结束
          segments.push(text.substring(lastIndex, urlIndex + url.length));
        }
        lastIndex = urlIndex + url.length;
      });
      // 添加最后一段剩余内容
      if (lastIndex < text.length) {
        const lastSegment = segments[segments.length - 1] + text.substring(lastIndex);
        segments[segments.length - 1] = lastSegment;
      }
    } else {
      segments = [text];
    }
  }
  
  // 为每个段落解析链接信息
  segments.forEach((segment, index) => {
    const trimmedSegment = segment.trim();
    if (!trimmedSegment) return;
    
    // 查找URL
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const urlMatch = trimmedSegment.match(urlRegex);
    if (!urlMatch) return;
    
    const url = urlMatch[1];
    let name = '';
    let extractCode = '';
    
    // 提取码匹配模式
    const codePatterns = [
      // 百度网盘标准格式："提取码: 5cyf"
      /提取码[：:]\s*([a-zA-Z0-9]{2,8})/i,
      // 百度网盘URL中的pwd参数："?pwd=5cyf"
      /[?&]pwd=([a-zA-Z0-9]{2,8})/i,
      // 其他格式
      /密码[：:]\s*([a-zA-Z0-9]{2,8})/i,
      /code[：:]\s*([a-zA-Z0-9]{2,8})/i,
      /pwd[：:]\s*([a-zA-Z0-9]{2,8})/i,
      /\/~([a-zA-Z0-9]{6,12})~/i, // 夸克网盘格式（虽然新版本没有）
    ];
    
    // 在当前段落中查找提取码
    for (const pattern of codePatterns) {
      const codeMatch = trimmedSegment.match(pattern);
      if (codeMatch) {
        extractCode = codeMatch[1];
        break;
      }
    }
    
    // 名称提取策略
    const namePatterns = [
      // 夸克网盘："我用夸克网盘分享了「AI复活照片，亲人再现眼前：让你的照片秒变视频详细教程」"
      /我用夸克网盘分享了[「"]([^」"]+)[」"]/i,
      // 百度网盘："通过网盘分享的文件：DK英语10000词.rar"
      /通过.*?网盘分享的文件[：:]([^链接\n\r]+?)(?:链接|$)/i,
      // 百度网盘简化版："分享的文件：公务员考试资料库"
      /分享的文件[：:]([^链接\n\r]+)/i,
      // 直接在链接前的标题："公务员考试资料库链接:"
      /([^\n\r]*?)链接[：:]/i,
      // 2026公务员9… 这种省略格式
      /分享的文件[：:]([^链接\n\r]*?)[…\.]*链接/i,
    ];
    
    // 尝试各种名称提取模式
    for (const pattern of namePatterns) {
      const nameMatch = trimmedSegment.match(pattern);
      if (nameMatch && nameMatch[1].trim()) {
        name = nameMatch[1].trim();
        break;
      }
    }
    
    // 如果还没找到名称，尝试从段落开头提取
    if (!name) {
      const lines = trimmedSegment.split(/[\n\r]/).map(line => line.trim()).filter(line => line);
      for (const line of lines) {
        // 跳过包含无用信息的行
        if (line.includes('http') || 
            line.includes('提取码') || 
            line.includes('密码') ||
            line.includes('复制这段内容') ||
            line.includes('打开') ||
            line.includes('即可获取') ||
            line.includes('APP') ||
            line.length < 2) {
          continue;
        }
        
        // 清理行内容
        let cleanLine = line;
        // 移除"通过xxx分享的文件："前缀
        cleanLine = cleanLine.replace(/^通过.*?分享的文件[：:]/, '');
        // 移除"我用xxx给你分享了"前缀和引号
        cleanLine = cleanLine.replace(/^我用.*?给你分享了[「"]/, '').replace(/[」"].*$/, '');
        // 移除"链接:"后缀
        cleanLine = cleanLine.replace(/链接[：:].*$/, '');
        // 移除文件扩展名后的多余内容（如.rar链接:）
        cleanLine = cleanLine.replace(/\.(rar|zip|7z|pdf|doc|docx|xls|xlsx|ppt|pptx|mp4|avi|mkv|mp3|flac|jpg|png|gif).*$/i, '.$1');
        
        cleanLine = cleanLine.trim();
        if (cleanLine && cleanLine.length > 1 && cleanLine.length < 200) {
          name = cleanLine;
          break;
        }
      }
    }
    
    // 清理名称
    if (name) {
      name = name.replace(/[：:]+$/, '').trim();
      // 移除开头的数字编号
      name = name.replace(/^\d+[\.\s]*/, '');
      // 移除省略号
      name = name.replace(/[…\.]+$/, '');
    }
    
    results.push({
      name: name || `链接 ${index + 1}`,
      url,
      extract_code: extractCode,
      description: '',
      platform: detectPlatform(url),
      tags: []
    });
  });
  
  return results;
};

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function NetdiskManager() {
  const { user, loading: userLoading } = useUser();
  const [links, setLinks] = useState<NetdiskLink[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // 从数据库加载数据
  const loadLinks = useCallback(async (resetPage = false) => {
    if (!user) {
      setLinks([]);
      setLoading(false);
      return;
    }

    try {
      const currentPage = resetPage ? 1 : pagination.page;
      const params = new URLSearchParams();
      if (selectedPlatform) params.append('platform', selectedPlatform);
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', currentPage.toString());
      params.append('pageSize', pagination.pageSize.toString());

      const response = await fetch(`/api/netdisk-links?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setLinks(data.links || []);
        setPagination(data.pagination || {
          page: currentPage,
          pageSize: pagination.pageSize,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        toast.error(data.error || '加载链接失败');
      }
    } catch (error) {
      toast.error('加载链接失败');
    } finally {
      setLoading(false);
    }
  }, [user, selectedPlatform, searchTerm, pagination.page, pagination.pageSize]);

  useEffect(() => {
    if (!userLoading) {
      loadLinks(true); // 重置到第一页
    }
  }, [user, userLoading, selectedPlatform, searchTerm]);

  useEffect(() => {
    if (!userLoading && user) {
      loadLinks(); // 不重置页码
    }
  }, [pagination.page, pagination.pageSize]);
  
  // 添加链接
  const addLinks = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (!inputText.trim()) {
      toast.error('请输入链接信息');
      return;
    }
    
    const parsedLinks = parseNetdiskText(inputText);
    if (parsedLinks.length === 0) {
      toast.error('无法解析链接信息，请检查输入格式');
      return;
    }
    
    const newLinks = parsedLinks.map((parsed) => ({
      name: parsed.name!,
      url: parsed.url!,
      extract_code: parsed.extract_code,
      platform: parsed.platform!,
      description: parsed.description || '',
      tags: parsed.tags || [],
    }));

    try {
      const response = await fetch('/api/netdisk-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ links: newLinks }),
      });

      const data = await response.json();

      if (response.ok) {
        setInputText('');
        toast.success(`成功添加 ${newLinks.length} 个链接`);
        await loadLinks(true); // 重新加载数据，重置到第一页
      } else {
        toast.error(data.error || '保存链接失败');
      }
    } catch (error) {
      toast.error('保存链接失败');
    }
  };
  
  // 删除单个链接
  const deleteLink = async (id: string) => {
    if (!confirm('确定要删除这个链接吗？')) return;

    try {
      const response = await fetch(`/api/netdisk-links/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('链接删除成功');
        await loadLinks(); // 重新加载数据
      } else {
        toast.error(data.error || '删除链接失败');
      }
    } catch (error) {
      toast.error('删除链接失败');
    }
  };

  // 批量删除链接
  const deleteSelectedLinks = async () => {
    if (selectedLinks.length === 0) {
      toast.error('请先选择要删除的链接');
      return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedLinks.length} 个链接吗？`)) return;

    try {
      const response = await fetch(`/api/netdisk-links?ids=${selectedLinks.join(',')}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedLinks([]);
        toast.success(`成功删除 ${selectedLinks.length} 个链接`);
        await loadLinks(); // 重新加载数据
      } else {
        toast.error(data.error || '删除链接失败');
      }
    } catch (error) {
      toast.error('删除链接失败');
    }
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedLinks.length === links.length) {
      setSelectedLinks([]);
    } else {
      setSelectedLinks(links.map(link => link.id));
    }
  };

  // 切换单个选择
  const toggleSelectLink = (id: string) => {
    setSelectedLinks(prev => 
      prev.includes(id) 
        ? prev.filter(linkId => linkId !== id)
        : [...prev, id]
    );
  };
  
  // 复制链接信息
  const copyLink = (link: NetdiskLink) => {
    const text = `${link.name} ${link.url}${link.extract_code ? ` 提取码: ${link.extract_code}` : ''}${link.description ? ` ${link.description}` : ''}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('链接信息已复制到剪贴板');
    });
  };
  
  // 获取所有平台（这里需要从所有数据中获取，而不是当前页）
  const [allPlatforms, setAllPlatforms] = useState<string[]>([]);
  
  // 加载所有平台选项
  const loadPlatforms = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/netdisk-links?pageSize=1000'); // 获取足够多的数据来提取平台
      const data = await response.json();
      if (response.ok) {
        const platforms = Array.from(new Set(data.links?.map((link: NetdiskLink) => link.platform).filter(Boolean) || [])) as string[];
        setAllPlatforms(platforms);
      }
    } catch (error) {
      // 静默处理错误
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading && user) {
      loadPlatforms();
    }
  }, [user, userLoading, loadPlatforms]);

  // 分页控制函数
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const changePageSize = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };

  // 如果用户未登录，显示登录提示
  if (!userLoading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            网盘链接管理
          </h1>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
            管理和整理你的网盘分享链接，支持自动解析、搜索筛选和快速分享
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">需要登录</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              请先登录以使用网盘链接管理功能
            </p>
            <Link
              href={`/auth/login?redirect=${encodeURIComponent('/tools/netdisk-manager')}`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          网盘链接管理
        </h1>
        <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
          管理和整理你的网盘分享链接，支持自动解析、搜索筛选和快速分享
        </p>
      </div>

      {/* 添加链接区域 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          添加新链接
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              粘贴链接信息（支持多个链接）
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`粘贴包含网盘链接的文本，支持多个链接，例如：

百度网盘示例：
通过网盘分享的文件：DK英语10000词.rar
链接: https://pan.baidu.com/s/12ei0KgPLzJd6UeZ8KJvJZQ?pwd=5cyf 
提取码: 5cyf

夸克网盘示例：
我用夸克网盘分享了「AI复活照片，亲人再现眼前：让你的照片秒变视频详细教程」
链接：https://pan.quark.cn/s/6947d5f0e57c`}
              className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addLinks}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              解析并保存
            </button>
            <button
              onClick={() => setInputText('')}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              清空
            </button>
          </div>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              搜索关键词
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索名称、描述..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              平台筛选
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">全部平台</option>
              {allPlatforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            {selectedLinks.length > 0 && (
              <button
                onClick={deleteSelectedLinks}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                删除选中 ({selectedLinks.length})
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? '加载中...' : `共 ${pagination.total} 个链接，当前显示第 ${pagination.page} 页，每页 ${pagination.pageSize} 条`}
          </div>
        </div>
      </div>

      {/* 链接表格 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">加载中...</div>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              {pagination.total === 0 ? '还没有添加任何链接' : '没有找到匹配的链接'}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLinks.length === links.length && links.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    平台
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    提取码
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    链接
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {links.map(link => (
                  <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLinks.includes(link.id)}
                        onChange={() => toggleSelectLink(link.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                        {link.name}
                      </div>
                      {link.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {link.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                        {link.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {link.extract_code && (
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-red-600 dark:text-red-400 font-mono text-sm">
                          {link.extract_code}
                        </code>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm max-w-xs truncate block"
                        title={link.url}
                      >
                        {link.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(link.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyLink(link)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="复制链接信息"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => deleteLink(link.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="删除链接"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 分页导航 */}
      {!loading && links.length > 0 && pagination.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
              显示第 {((pagination.page - 1) * pagination.pageSize) + 1} 到 {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，共 {pagination.total} 条记录
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* 每页显示选择 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">每页显示：</label>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => changePageSize(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={20}>20条</option>
                  <option value={50}>50条</option>
                  <option value={100}>100条</option>
                </select>
              </div>
              
              {/* 分页控件 */}
              <div className="flex items-center space-x-2">
                {/* 上一页 */}
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  上一页
                </button>
              
              {/* 页码 */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const totalPages = pagination.totalPages;
                  const currentPage = pagination.page;
                  
                  if (totalPages <= 7) {
                    // 如果总页数小于等于7，显示所有页码
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            i === currentPage
                              ? 'text-white bg-indigo-600 border border-indigo-600'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                  } else {
                    // 复杂分页逻辑
                    // 始终显示第一页
                    pages.push(
                      <button
                        key={1}
                        onClick={() => goToPage(1)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          1 === currentPage
                            ? 'text-white bg-indigo-600 border border-indigo-600'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        1
                      </button>
                    );
                    
                    // 如果当前页距离第一页较远，显示省略号
                    if (currentPage > 4) {
                      pages.push(
                        <span key="ellipsis1" className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">...</span>
                      );
                    }
                    
                    // 显示当前页附近的页码
                    const startPage = Math.max(2, currentPage - 1);
                    const endPage = Math.min(totalPages - 1, currentPage + 1);
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            i === currentPage
                              ? 'text-white bg-indigo-600 border border-indigo-600'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // 如果当前页距离最后一页较远，显示省略号
                    if (currentPage < totalPages - 3) {
                      pages.push(
                        <span key="ellipsis2" className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">...</span>
                      );
                    }
                    
                    // 始终显示最后一页
                    if (totalPages > 1) {
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            totalPages === currentPage
                              ? 'text-white bg-indigo-600 border border-indigo-600'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }
                  }
                  
                  return pages;
                })()}
                </div>
                
                {/* 下一页 */}
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-8">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">使用说明</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• 支持同时解析多个网盘链接，每个链接会自动识别平台类型</li>
          <li>• 自动提取链接名称、提取码等信息</li>
          <li>• 支持百度网盘、阿里云盘、天翼云盘、夸克网盘等主流网盘平台</li>
          <li>• 可以搜索、筛选和快速复制分享链接信息</li>
          <li>• 支持批量选择和删除链接</li>
        </ul>
      </div>
    </div>
  );
}