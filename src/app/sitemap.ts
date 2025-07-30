import { MetadataRoute } from 'next'
import { seoConfig } from '@/lib/seo'

// 所有工具页面配置
const tools = [
  { id: 'code-formatter', priority: 0.9, changeFreq: 'weekly' },
  { id: 'json-formatter', priority: 0.9, changeFreq: 'weekly' },
  { id: 'ip-lookup', priority: 0.8, changeFreq: 'monthly' },
  { id: 'image-compressor', priority: 0.8, changeFreq: 'monthly' },
  { id: 'qr-generator', priority: 0.8, changeFreq: 'monthly' },
  { id: 'password-generator', priority: 0.8, changeFreq: 'monthly' },
  { id: 'color-picker', priority: 0.7, changeFreq: 'monthly' },
  { id: 'markdown-editor', priority: 0.8, changeFreq: 'monthly' },
  { id: 'timestamp-converter', priority: 0.7, changeFreq: 'monthly' },
  { id: 'url-shortener', priority: 0.7, changeFreq: 'monthly' },
  { id: 'qr-batch-generator', priority: 0.7, changeFreq: 'monthly' },
  { id: 'image-merger', priority: 0.6, changeFreq: 'monthly' },
  { id: 'image-splitter', priority: 0.6, changeFreq: 'monthly' },
  { id: 'image-watermark', priority: 0.6, changeFreq: 'monthly' },
  { id: 'image-to-pdf', priority: 0.6, changeFreq: 'monthly' },
  { id: 'pdf-tools', priority: 0.6, changeFreq: 'monthly' },
  { id: 'signature-generator', priority: 0.6, changeFreq: 'monthly' },
  { id: 'random-picker', priority: 0.6, changeFreq: 'monthly' },
  { id: 'todo-list', priority: 0.6, changeFreq: 'monthly' },
  { id: 'netdisk-manager', priority: 0.7, changeFreq: 'weekly' },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = seoConfig.siteUrl;
  
  // 核心页面
  const corePages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
      alternates: {
        languages: {
          'zh-CN': baseUrl,
          'en-US': `${baseUrl}/en`,
          'ja-JP': `${baseUrl}/ja`,
        },
      },
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: {
        languages: {
          'zh-CN': `${baseUrl}/tools`,
          'en-US': `${baseUrl}/en/tools`,
          'ja-JP': `${baseUrl}/ja/tools`,
        },
      },
    },
  ];

  // 工具页面
  const toolPages = tools.map(tool => ({
    url: `${baseUrl}/tools/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: tool.changeFreq as 'weekly' | 'monthly',
    priority: tool.priority,
  }));

  // 其他页面
  const otherPages = [
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  return [...corePages, ...toolPages, ...otherPages];
}