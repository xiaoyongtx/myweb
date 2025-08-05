# 🚀 邮件链接修复指南

## 问题
注册和重置密码邮件中的链接指向 localhost，用户无法正常访问。

## ✅ 已完成的修复

### 1. 代码修改
- ✅ 创建了 `src/lib/utils.ts` 工具函数
- ✅ 更新了注册页面使用新的URL构建方式
- ✅ 更新了重置密码页面使用新的URL构建方式
- ✅ 添加了环境变量配置

### 2. 环境变量配置
- ✅ `.env.local`: `NEXT_PUBLIC_SITE_URL="http://localhost:3000"` (开发环境)
- ✅ `.env`: `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` (生产环境)

## 🔧 需要你完成的步骤

### 步骤 1: 更新生产环境域名
将 `.env` 文件中的域名改为你的实际域名：
```env
NEXT_PUBLIC_SITE_URL=https://你的实际域名.com
```

### 步骤 2: 配置 Supabase
1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication > URL Configuration**
4. 设置以下配置：
   - **Site URL**: `https://你的实际域名.com`
   - **Redirect URLs**: 添加 `https://你的实际域名.com/auth/callback`

### 步骤 3: 重新部署
重新部署你的应用，确保新的环境变量生效。

### 步骤 4: 测试验证
1. 注册新用户，检查邮件中的确认链接
2. 使用忘记密码功能，检查邮件中的重置链接
3. 确保链接指向正确的域名而不是 localhost

## 🧪 测试工具
运行测试脚本检查配置：
```bash
node scripts/test-auth-urls.js
```

## ❓ 常见问题

**Q: 我的域名是什么？**
A: 就是用户访问你网站的地址，比如 `https://mywebsite.com`

**Q: 如果我使用 Vercel 部署？**
A: Vercel 会自动提供域名，比如 `https://myproject.vercel.app`，使用这个作为你的站点URL

**Q: 修改后多久生效？**
A: 重新部署后立即生效，但已发送的邮件中的链接不会改变

## 🎯 验证成功的标志
- 注册邮件中的链接指向你的实际域名
- 重置密码邮件中的链接指向你的实际域名  
- 点击邮件链接能正常跳转到你的网站
- 用户能正常完成邮箱验证和密码重置流程