#!/usr/bin/env node

/**
 * 测试认证URL配置的脚本
 * 运行: node scripts/test-auth-urls.js
 */

// 模拟环境变量
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

// 复制工具函数逻辑
function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return 'http://localhost:3000';
}

function buildUrl(path) {
  const baseUrl = getSiteUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

console.log('🔍 测试认证URL配置...\n');

console.log('环境变量:');
console.log(`NEXT_PUBLIC_SITE_URL: ${siteUrl}`);
console.log('');

console.log('工具函数测试:');
console.log(`getSiteUrl(): ${getSiteUrl()}`);
console.log(`buildUrl('/auth/callback'): ${buildUrl('/auth/callback')}`);
console.log(`buildUrl('/auth/reset-password'): ${buildUrl('/auth/reset-password')}`);
console.log('');

console.log('✅ 预期的邮件链接:');
console.log(`注册确认链接: ${buildUrl('/auth/callback')}`);
console.log(`重置密码链接: ${buildUrl('/auth/reset-password')}`);
console.log('');

console.log('📝 注意事项:');
console.log('1. 确保在生产环境中设置正确的 NEXT_PUBLIC_SITE_URL');
console.log('2. 在 Supabase 控制台中配置相同的 Site URL');
console.log('3. 添加回调URL到 Supabase 的 Redirect URLs 列表');

console.log('\n🚀 测试不同环境:');
console.log('开发环境 (localhost):');
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
console.log(`  注册确认: ${buildUrl('/auth/callback')}`);
console.log(`  重置密码: ${buildUrl('/auth/reset-password')}`);

console.log('\n生产环境 (示例域名):');
process.env.NEXT_PUBLIC_SITE_URL = 'https://yourdomain.com';
console.log(`  注册确认: ${buildUrl('/auth/callback')}`);
console.log(`  重置密码: ${buildUrl('/auth/reset-password')}`);