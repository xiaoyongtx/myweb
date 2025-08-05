# 认证配置说明

## 问题描述

注册和重置密码时收到的邮件中的跳转链接指向 localhost，这是因为在开发环境中使用了本地地址。

## 解决方案

### 1. 环境变量配置

已经在 `.env` 和 `.env.local` 文件中添加了 `NEXT_PUBLIC_SITE_URL` 环境变量：

- **开发环境** (`.env.local`): `NEXT_PUBLIC_SITE_URL="http://localhost:3000"`
- **生产环境** (`.env`): `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

### 2. 代码修改

- 创建了 `src/lib/utils.ts` 工具函数来统一管理站点 URL
- 更新了注册页面 (`src/app/auth/register/page.tsx`) 使用新的 URL 构建方式
- 更新了忘记密码页面 (`src/app/auth/forgot-password/page.tsx`) 使用新的 URL 构建方式

### 3. 部署配置

#### 3.1 更新环境变量

在部署到生产环境时，请将 `.env` 文件中的 `NEXT_PUBLIC_SITE_URL` 修改为你的实际域名：

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

#### 3.2 Supabase 配置

在 Supabase 控制台中，需要配置以下设置：

1. **Authentication > URL Configuration**:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: 添加 `https://yourdomain.com/auth/callback`

2. **Authentication > Email Templates**:
   - 确认邮件模板中的链接会自动使用配置的 Site URL
   - 重置密码邮件模板中的链接也会自动使用配置的 Site URL

### 4. 验证配置

部署后，可以通过以下方式验证配置是否正确：

1. 注册新用户，检查确认邮件中的链接是否指向正确的域名
2. 使用忘记密码功能，检查重置邮件中的链接是否指向正确的域名
3. 点击邮件中的链接，确保能正确跳转到你的网站

### 5. 常见问题

#### Q: 为什么需要配置 NEXT_PUBLIC_SITE_URL？
A: 因为在服务端渲染时，无法获取到 `window.location.origin`，需要通过环境变量来指定正确的站点 URL。

#### Q: 开发环境和生产环境的配置有什么区别？
A: 开发环境使用 `http://localhost:3000`，生产环境使用实际的域名如 `https://yourdomain.com`。

#### Q: 如果忘记配置会怎样？
A: 邮件中的链接会指向 localhost，用户点击后无法正常访问，需要手动输入正确的网址。

### 6. 部署检查清单

- [ ] 更新 `.env` 中的 `NEXT_PUBLIC_SITE_URL` 为生产域名
- [ ] 在 Supabase 控制台配置正确的 Site URL 和 Redirect URLs
- [ ] 测试注册功能，确认邮件链接正确
- [ ] 测试重置密码功能，确认邮件链接正确
- [ ] 验证邮件链接点击后能正常跳转和工作