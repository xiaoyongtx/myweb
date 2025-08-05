/**
 * 获取站点的基础URL
 * 优先使用环境变量，如果没有则使用当前域名
 */
export function getSiteUrl(): string {
  // 优先使用环境变量中配置的站点URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // 如果在浏览器环境中，使用当前域名
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // 服务端渲染时的默认值
  return 'http://localhost:3000';
}

/**
 * 构建完整的URL路径
 */
export function buildUrl(path: string): string {
  const baseUrl = getSiteUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}