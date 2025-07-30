# API 接口文档

## 概述

项目基于 Next.js API Routes 构建，提供 RESTful API 接口。所有需要认证的接口都通过 Supabase Auth 进行用户验证。

## 认证方式

### Authorization Header

所有需要认证的 API 都需要在请求头中包含认证信息：

```http
Authorization: Bearer <supabase_access_token>
```

### Cookie 认证

Web 应用通过 HTTP Cookie 自动处理认证。

## 错误响应格式

所有 API 错误响应都遵循统一格式：

```json
{
  \"error\": \"错误描述\",
  \"message\": \"详细错误信息\",
  \"status\": 400
}
```

## 用户认证接口

### 测试认证状态

检查当前用户的认证状态。

**请求**
```http
GET /api/test-auth
```

**响应**
```json
{
  \"authenticated\": true,
  \"user\": {
    \"id\": \"uuid\",
    \"email\": \"user@example.com\"
  }
}
```

## IP 查询接口

### 查询 IP 地址信息

查询指定 IP 地址的地理位置和网络信息。

**请求**
```http
POST /api/ip-lookup
Content-Type: application/json

{
  \"ip\": \"8.8.8.8\"
}
```

**响应**
```json
{
  \"ip\": \"8.8.8.8\",
  \"country\": \"美国\",
  \"region\": \"加利福尼亚州\",
  \"city\": \"山景城\",
  \"isp\": \"Google LLC\",
  \"timezone\": \"America/Los_Angeles\"
}
```

**错误响应**
```json
{
  \"error\": \"Invalid IP address\",
  \"status\": 400
}
```

## URL 短链接口

### 创建短链接

将长链接转换为短链接。

**请求**
```http
POST /api/url-shortener
Content-Type: application/json

{
  \"url\": \"https://example.com/very/long/url\"
}
```

**响应**
```json
{
  \"shortUrl\": \"https://short.ly/abc123\",
  \"originalUrl\": \"https://example.com/very/long/url\",
  \"shortCode\": \"abc123\"
}
```

## 网盘链接管理接口

### 获取链接列表

获取当前用户的所有网盘链接。

**请求**
```http
GET /api/netdisk-links?page=1&limit=20&platform=baidu&search=关键词
```

**参数**
- `page`: 页码（可选，默认为1）
- `limit`: 每页条数（可选，默认为20）
- `platform`: 平台筛选（可选）
- `search`: 搜索关键词（可选）

**响应**
```json
{
  \"data\": [
    {
      \"id\": \"uuid\",
      \"name\": \"文件名称\",
      \"url\": \"https://pan.baidu.com/s/xxxxx\",
      \"extract_code\": \"1234\",
      \"platform\": \"baidu\",
      \"description\": \"文件描述\",
      \"tags\": [\"标签1\", \"标签2\"],
      \"created_at\": \"2024-01-01T00:00:00Z\",
      \"updated_at\": \"2024-01-01T00:00:00Z\"
    }
  ],
  \"total\": 100,
  \"page\": 1,
  \"limit\": 20,
  \"totalPages\": 5
}
```

### 批量添加链接

批量添加网盘链接。

**请求**
```http
POST /api/netdisk-links
Content-Type: application/json

{
  \"links\": [
    {
      \"name\": \"文件名称\",
      \"url\": \"https://pan.baidu.com/s/xxxxx\",
      \"extract_code\": \"1234\",
      \"platform\": \"baidu\",
      \"description\": \"文件描述\",
      \"tags\": [\"标签1\", \"标签2\"]
    }
  ]
}
```

**响应**
```json
{
  \"success\": true,
  \"added\": 1,
  \"data\": [
    {
      \"id\": \"uuid\",
      \"name\": \"文件名称\",
      \"url\": \"https://pan.baidu.com/s/xxxxx\",
      \"extract_code\": \"1234\",
      \"platform\": \"baidu\",
      \"description\": \"文件描述\",
      \"tags\": [\"标签1\", \"标签2\"],
      \"created_at\": \"2024-01-01T00:00:00Z\",
      \"updated_at\": \"2024-01-01T00:00:00Z\"
    }
  ]
}
```

### 批量删除链接

批量删除网盘链接。

**请求**
```http
DELETE /api/netdisk-links?ids=uuid1,uuid2,uuid3
```

**响应**
```json
{
  \"success\": true,
  \"deleted\": 3
}
```

### 更新单个链接

更新指定的网盘链接。

**请求**
```http
PUT /api/netdisk-links/[id]
Content-Type: application/json

{
  \"name\": \"新文件名称\",
  \"description\": \"新描述\",
  \"tags\": [\"新标签\"]
}
```

**响应**
```json
{
  \"success\": true,
  \"data\": {
    \"id\": \"uuid\",
    \"name\": \"新文件名称\",
    \"url\": \"https://pan.baidu.com/s/xxxxx\",
    \"extract_code\": \"1234\",
    \"platform\": \"baidu\",
    \"description\": \"新描述\",
    \"tags\": [\"新标签\"],
    \"created_at\": \"2024-01-01T00:00:00Z\",
    \"updated_at\": \"2024-01-01T12:00:00Z\"
  }
}
```

### 删除单个链接

删除指定的网盘链接。

**请求**
```http
DELETE /api/netdisk-links/[id]
```

**响应**
```json
{
  \"success\": true,
  \"deleted\": 1
}
```

## 数据验证

### 网盘链接验证规则

- `name`: 必填，1-100个字符
- `url`: 必填，有效的URL格式
- `extract_code`: 可选，1-20个字符
- `platform`: 必填，支持的平台名称
- `description`: 可选，最大500个字符
- `tags`: 可选，数组，每个标签最大50个字符

### 支持的网盘平台

- `baidu`: 百度网盘
- `quark`: 夸克网盘
- `aliyun`: 阿里云盘
- `onedrive`: OneDrive
- `googledrive`: Google Drive
- `other`: 其他平台

## 错误代码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

## 速率限制

目前未实施速率限制，但建议：
- IP查询：每分钟最多60次请求
- URL短链：每分钟最多30次请求
- 网盘链接：每分钟最多100次请求

## 示例代码

### JavaScript/TypeScript

```typescript
// 获取网盘链接列表
async function getNetdiskLinks(page = 1, limit = 20) {
  const response = await fetch(`/api/netdisk-links?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch links');
  }
  
  return await response.json();
}

// 添加网盘链接
async function addNetdiskLinks(links) {
  const response = await fetch('/api/netdisk-links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ links })
  });
  
  if (!response.ok) {
    throw new Error('Failed to add links');
  }
  
  return await response.json();
}
```

### cURL

```bash
# 获取网盘链接列表
curl -X GET \"http://localhost:3000/api/netdisk-links\" \\
  -H \"Authorization: Bearer your_access_token\"

# 添加网盘链接
curl -X POST \"http://localhost:3000/api/netdisk-links\" \\
  -H \"Content-Type: application/json\" \\
  -H \"Authorization: Bearer your_access_token\" \\
  -d '{
    \"links\": [
      {
        \"name\": \"测试文件\",
        \"url\": \"https://pan.baidu.com/s/test\",
        \"extract_code\": \"1234\",
        \"platform\": \"baidu\"
      }
    ]
  }'
```

## 相关文档

- [数据库设计](./database.md) - 数据表结构
- [认证系统](./authentication.md) - 用户认证
- [网盘管理](./netdisk-manager.md) - 网盘链接管理功能