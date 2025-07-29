# 网盘链接管理数据库设置

## 数据库表结构

### netdisk_links 表

该表用于存储用户的网盘链接信息，包含以下字段：

- `id`: UUID 主键，自动生成
- `user_id`: 用户ID，关联到 auth.users 表
- `name`: 链接名称
- `url`: 网盘链接地址
- `extract_code`: 提取码（可选）
- `platform`: 网盘平台名称
- `description`: 描述信息（可选）
- `tags`: 标签数组
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 设置步骤

### 1. 在 Supabase 中执行 SQL

1. 登录到你的 Supabase 项目
2. 进入 SQL Editor
3. 执行 `netdisk_links.sql` 文件中的所有 SQL 语句

### 2. 验证设置

执行以下查询来验证表是否创建成功：

```sql
-- 检查表结构
\d netdisk_links;

-- 检查 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'netdisk_links';
```

### 3. 权限说明

该表启用了行级安全策略 (RLS)，确保：

- 用户只能查看自己的链接
- 用户只能添加、修改、删除自己的链接
- 所有操作都需要用户认证

### 4. API 接口

- `GET /api/netdisk-links` - 获取用户的链接列表
- `POST /api/netdisk-links` - 批量添加链接
- `DELETE /api/netdisk-links?ids=id1,id2` - 批量删除链接
- `DELETE /api/netdisk-links/[id]` - 删除单个链接
- `PUT /api/netdisk-links/[id]` - 更新单个链接

所有接口都需要用户认证，并且只能操作用户自己的数据。

## 功能特性

1. **用户隔离**: 每个用户只能看到和操作自己的链接
2. **自动解析**: 支持从文本中自动解析网盘链接信息
3. **多平台支持**: 支持百度网盘、夸克网盘等主流平台
4. **搜索筛选**: 支持按名称、平台等条件搜索筛选
5. **批量操作**: 支持批量添加和删除链接
6. **数据持久化**: 数据保存在数据库中，不会丢失