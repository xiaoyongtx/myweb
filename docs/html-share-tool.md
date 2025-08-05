# HTML分享工具

## 功能概述

HTML分享工具是一个在线HTML编辑器和分享平台，允许用户创建、预览和分享HTML页面。

## 主要功能

### 1. 实时编辑和预览
- 左侧HTML编辑器支持完整的HTML、CSS和JavaScript语法
- 右侧实时预览窗口，代码修改后立即显示效果
- 支持语法高亮和代码格式化

### 2. 用户认证
- 需要登录才能使用分享功能
- 集成现有的用户认证系统
- 支持用户注册和登录

### 3. 分享管理
- 一键发布HTML页面
- 设置分享的可见性（公开/私有）
- 自动生成分享链接
- 查看分享的浏览统计

### 4. 公开浏览
- 浏览其他用户的公开分享
- 支持搜索和排序功能
- 复制分享链接

## 技术实现

### 数据库设计

```sql
CREATE TABLE html_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  html_content TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 页面结构

```
/tools/html-share/
├── page.tsx              # 主编辑器页面
├── browse/
│   └── page.tsx          # 公开分享浏览页面
├── view/[id]/
│   ├── page.tsx          # 分享查看页面
│   ├── HtmlViewer.tsx    # HTML查看器组件
│   └── not-found.tsx     # 404页面
└── help/
    └── page.tsx          # 使用说明页面
```

### API路由

```
/api/html-shares/
├── route.ts              # GET: 获取分享列表, POST: 创建分享
└── [id]/
    └── route.ts          # GET: 获取单个分享, PUT: 更新, DELETE: 删除, PATCH: 更新浏览次数
```

## 安全特性

### 1. 行级安全策略（RLS）
- 用户只能查看公开的分享或自己的分享
- 用户只能修改和删除自己的分享
- 严格的数据访问控制

### 2. 沙盒环境
- HTML内容在iframe沙盒中运行
- 限制恶意脚本的执行
- 防止XSS攻击

### 3. 输入验证
- 标题和描述长度限制
- HTML内容大小限制
- 防止SQL注入

## 使用流程

1. **登录账户** - 用户需要先登录才能使用分享功能
2. **编写代码** - 在编辑器中输入HTML、CSS、JavaScript代码
3. **实时预览** - 右侧窗口实时显示页面效果
4. **设置信息** - 填写标题、描述，选择可见性
5. **发布分享** - 点击发布按钮，自动生成分享链接
6. **管理分享** - 在"我的分享"中查看、复制链接或删除分享

## 特色功能

### 1. 智能代码编辑器
- 等宽字体显示
- 合适的行高和缩进
- 字符计数显示

### 2. 响应式设计
- 支持桌面和移动设备
- 自适应布局
- 深色模式支持

### 3. 社交分享
- 一键复制分享链接
- 浏览次数统计
- 公开分享广场

### 4. 用户体验
- 加载状态提示
- 错误处理和提示
- 友好的404页面

## 扩展功能

### 未来可能的功能扩展：
1. **代码模板** - 提供常用的HTML模板
2. **协作编辑** - 多人实时协作编辑
3. **版本控制** - 保存编辑历史
4. **导出功能** - 导出为HTML文件
5. **评论系统** - 对分享内容进行评论
6. **标签分类** - 为分享添加标签分类
7. **收藏功能** - 收藏喜欢的分享
8. **代码高亮** - 更好的语法高亮支持

## 部署说明

1. 执行数据库迁移脚本
2. 确保用户认证系统正常工作
3. 配置Supabase RLS策略
4. 部署前端页面和API路由

## 维护建议

1. 定期清理无效的分享内容
2. 监控数据库性能
3. 备份重要的分享数据
4. 更新安全策略