import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '开发者工具箱',
    short_name: '开发者工具箱',
    description: '专业的开发者工具箱，提供代码格式化、JSON工具、IP查询、Markdown编辑器等实用功能',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    orientation: 'portrait-primary',
    categories: ['productivity', 'developer', 'utilities'],
    lang: 'zh-CN',
    icons: [
      {
        src: '/images/icon.jpg',
        sizes: '192x192',
        type: 'image/jpeg'
      },
      {
        src: '/images/icon.jpg',
        sizes: '512x512',
        type: 'image/jpeg'
      },
      {
        src: '/images/icon.jpg',
        sizes: '180x180',
        type: 'image/jpeg'
      }
    ]
  }
}