# 数据库设计

## 概述

项目使用 PostgreSQL 数据库（通过 Supabase 提供），采用行级安全策略（RLS）确保数据安全。

## 数据库表结构

### profiles 表

用户个人资料表，存储用户的基本信息。

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 字段说明

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, FOREIGN KEY | 用户ID，关联 auth.users 表 |
| username | TEXT | UNIQUE | 用户名，唯一 |
| avatar_url | TEXT | NULL | 头像URL |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新时间 |

#### 索引
- 主键索引：`id`
- 唯一索引：`username`

### netdisk_links 表

网盘链接管理表，存储用户的网盘链接信息。

```sql
CREATE TABLE netdisk_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  extract_code TEXT,
  platform TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 字段说明

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 链接ID，自动生成 |
| user_id | UUID | FOREIGN KEY, NOT NULL | 用户ID，关联 auth.users 表 |
| name | TEXT | NOT NULL | 链接名称 |
| url | TEXT | NOT NULL | 网盘链接地址 |
| extract_code | TEXT | NULL | 提取码（可选） |
| platform | TEXT | NOT NULL | 网盘平台名称 |
| description | TEXT | NULL | 描述信息 |
| tags | TEXT[] | DEFAULT '{}' | 标签数组 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新时间 |

#### 索引
- 主键索引：`id`
- 外键索引：`user_id`
- 复合索引：`(user_id, created_at DESC)` 用于用户链接列表查询

#### 触发器

自动更新 `updated_at` 字段：

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_netdisk_links_updated_at 
  BEFORE UPDATE ON netdisk_links 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 行级安全策略（RLS）

所有表都启用了行级安全策略，确保数据访问安全。

### profiles 表策略

```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户查看所有个人资料
CREATE POLICY "用户可以查看所有资料" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 允许用户更新自己的个人资料
CREATE POLICY "用户可以更新自己的资料" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 允许用户插入自己的个人资料
CREATE POLICY "用户可以插入自己的资料" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### netdisk_links 表策略

```sql
-- 启用 RLS
ALTER TABLE netdisk_links ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的链接
CREATE POLICY "用户只能查看自己的链接" ON netdisk_links
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的链接
CREATE POLICY "用户只能插入自己的链接" ON netdisk_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的链接
CREATE POLICY "用户只能更新自己的链接" ON netdisk_links
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的链接
CREATE POLICY "用户只能删除自己的链接" ON netdisk_links
  FOR DELETE USING (auth.uid() = user_id);
```

## 存储桶配置

### avatars 存储桶

用于存储用户头像文件。

#### 存储桶策略

```sql
-- 允许用户上传自己的头像
CREATE POLICY "用户可以上传自己的头像" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许用户查看头像
CREATE POLICY "头像文件可以被查看" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 允许用户更新自己的头像
CREATE POLICY "用户可以更新自己的头像" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许用户删除自己的头像
CREATE POLICY "用户可以删除自己的头像" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 数据库迁移

### 初始化脚本

项目提供了完整的数据库初始化脚本：

- `supabase/migrations/20250718_create_profiles_table.sql`
- `supabase/migrations/20250729_create_netdisk_links_table.sql`

### 执行迁移

1. 在 Supabase Dashboard 中打开 SQL Editor
2. 按顺序执行迁移文件中的 SQL 语句
3. 验证表创建和策略设置

### 验证数据库

执行以下查询验证数据库设置：

```sql
-- 检查表结构
\d profiles;
\d netdisk_links;

-- 检查 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'netdisk_links');

-- 检查存储桶
SELECT * FROM storage.buckets WHERE name = 'avatars';
```

## 性能优化

### 索引策略

1. **主键索引**：所有表都有主键索引
2. **外键索引**：user_id 字段有索引用于关联查询
3. **复合索引**：user_id + created_at 用于分页查询

### 查询优化

1. **分页查询**：使用 `LIMIT` 和 `OFFSET` 进行分页
2. **条件查询**：在 WHERE 子句中使用索引字段
3. **排序优化**：使用复合索引支持排序

### 连接池

Supabase 自动管理连接池，无需手动配置。

## 数据备份

### 自动备份

Supabase 提供自动备份功能：
- 每日自动备份
- 7天备份保留期
- 可手动创建备份点

### 数据导出

```sql
-- 导出用户数据
COPY profiles TO '/tmp/profiles.csv' DELIMITER ',' CSV HEADER;
COPY netdisk_links TO '/tmp/netdisk_links.csv' DELIMITER ',' CSV HEADER;
```

## 监控和维护

### 性能监控

在 Supabase Dashboard 中可以查看：
- 查询性能统计
- 数据库连接数
- 存储使用情况

### 定期维护

1. **清理过期数据**：定期清理不需要的数据
2. **索引维护**：监控索引使用情况
3. **权限审计**：定期检查 RLS 策略

## 相关文档

- [API文档](./api-reference.md) - 数据库访问 API
- [认证文档](./authentication.md) - 用户认证相关表
- [网盘管理](./netdisk-manager.md) - 网盘链接管理功能