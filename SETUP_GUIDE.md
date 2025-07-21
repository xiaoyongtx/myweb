# 个人资料功能设置指南

如果你在使用个人资料功能时遇到问题，可能是因为Supabase中的数据库表和存储桶尚未正确设置。请按照以下步骤手动设置：

## 方法1：使用网页界面（推荐）

1. 登录到你的网站
2. 访问 `/admin/init-db` 路径
3. 点击"创建个人资料"按钮
4. 如果成功，你将看到成功消息，然后可以点击"前往个人资料页面"

## 方法2：在Supabase控制台中手动执行SQL

如果方法1不起作用，你可以在Supabase控制台中手动执行SQL：

1. 登录到你的 [Supabase控制台](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单中的"SQL编辑器"
4. 创建一个新的查询
5. 复制并粘贴 `supabase/manual_setup.sql` 文件中的SQL语句
6. 执行SQL语句

## 方法3：为当前用户手动创建个人资料

如果你只想为当前登录的用户创建个人资料，可以执行以下SQL：

```sql
-- 确保profiles表存在
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 为特定用户创建个人资料
INSERT INTO profiles (id, username, avatar_url, updated_at)
VALUES ('你的用户ID', NULL, NULL, now())
ON CONFLICT (id) DO NOTHING;
```

你可以在Supabase控制台的"认证"页面中找到你的用户ID。

## 验证设置

设置完成后，你应该能够：

1. 在个人资料页面看到你的信息（不再显示加载中）
2. 更新你的用户名和头像
3. 更改你的密码

如果你仍然遇到问题，请检查浏览器控制台中的错误消息，这可能会提供更多关于问题的信息。