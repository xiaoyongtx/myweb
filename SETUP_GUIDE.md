# Supabase配置指南

本指南将帮助你正确配置Supabase，以确保个人资料功能和其他Supabase相关功能正常工作。

## 1. Supabase项目设置

1. 登录到你的 [Supabase控制台](https://app.supabase.com)
2. 点击"New Project"
3. 填写项目名称、选择地区、设置数据库密码
4. 等待项目创建完成（可能需要几分钟）

## 2. 数据库表和存储桶设置

### 方法1：使用网页界面（推荐）

1. 登录到你的网站
2. 访问 `/admin/init-db` 路径
3. 点击"创建个人资料"按钮
4. 如果成功，你将看到成功消息，然后可以点击"前往个人资料页面"

### 方法2：在Supabase控制台中手动执行SQL

1. 登录到你的 [Supabase控制台](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单中的"SQL编辑器"
4. 创建一个新的查询
5. 复制并粘贴 `supabase/migrations/20250718_create_profiles_table.sql` 文件中的SQL语句
6. 执行SQL语句

## 3. 环境变量配置

在`.env.local`文件中设置以下环境变量：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

你可以从Supabase项目的设置页面获取这些值。

## 4. 验证Supabase连接

1. 确保你的环境变量已正确设置
2. 启动开发服务器：`npm run dev`
3. 访问网站主页
4. 检查浏览器控制台是否有任何Supabase连接错误

## 5. 常见问题解决

### 问题1：无法访问Supabase API
- 检查环境变量是否正确设置
- 确保没有拼写错误
- 确认Supabase项目已正确创建

### 问题2：数据库表不存在
- 按照上述步骤手动执行SQL创建表
- 检查SQL语句是否有错误
- 确保有网络连接

### 问题3：无法上传头像
- 确认已创建avatars存储桶
- 检查存储策略是否允许上传
- 确认用户已登录

如果你仍然遇到问题，请检查浏览器控制台中的错误消息，并参考Supabase官方文档。