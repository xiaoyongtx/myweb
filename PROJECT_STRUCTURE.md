# 项目结构优化计划

## 当前结构

```
myweb/
├── public/             # 静态资源
├── src/
│   ├── app/            # 应用页面
│   │   ├── auth/       # 认证相关页面
│   │   ├── profile/    # 个人资料页面
│   │   ├── tools/      # 工具页面
│   │   └── ...         # 其他页面
│   ├── components/     # 可复用组件
│   ├── contexts/       # React上下文
│   ├── lib/            # 工具函数和库
│   └── ...             # 其他源代码
├── supabase/           # Supabase配置和迁移
└── ...
```

## 优化建议

### 1. 组件结构优化

将组件目录按功能分类：

```
src/components/
├── auth/              # 认证相关组件
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ...
├── layout/            # 布局相关组件
│   ├── Navbar.tsx
│   ├── NavbarWrapper.tsx
│   ├── Footer.tsx
│   └── ...
├── profile/           # 个人资料相关组件
│   ├── ProfileForm.tsx
│   ├── AvatarUpload.tsx
│   └── ...
├── tools/             # 工具相关组件
│   ├── CodeEditor.tsx
│   ├── ColorPicker.tsx
│   └── ...
└── ui/                # 通用UI组件
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    └── ...
```

### 2. 工具函数优化

将lib目录按功能分类：

```
src/lib/
├── api/               # API相关函数
│   ├── ip-lookup.ts
│   └── ...
├── auth/              # 认证相关函数
│   ├── auth-helpers.ts
│   └── ...
├── supabase/          # Supabase相关函数
│   ├── supabase.ts
│   ├── supabase-server.ts
│   └── ...
└── utils/             # 通用工具函数
    ├── date-format.ts
    ├── validation.ts
    └── ...
```

### 3. 类型定义优化

创建专门的类型定义目录：

```
src/types/
├── auth.ts            # 认证相关类型
├── profile.ts         # 个人资料相关类型
├── tools.ts           # 工具相关类型
└── ...
```

### 4. 钩子函数优化

创建专门的钩子函数目录：

```
src/hooks/
├── useAuth.ts         # 认证相关钩子
├── useProfile.ts      # 个人资料相关钩子
├── useTools.ts        # 工具相关钩子
└── ...
```

### 5. 状态管理优化

将上下文按功能分类：

```
src/contexts/
├── AuthContext.tsx    # 认证相关上下文
├── ProfileContext.tsx # 个人资料相关上下文
├── ThemeContext.tsx   # 主题相关上下文
└── ...
```

## 实施计划

1. 首先创建新的目录结构
2. 逐步将现有文件移动到新的目录中
3. 更新导入路径
4. 测试确保功能正常

## 预期收益

1. 更好的代码组织和可维护性
2. 更容易找到和理解代码
3. 更好的团队协作
4. 更容易扩展和添加新功能