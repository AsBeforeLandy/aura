# 快速开始

## 安装

```bash
# 安装组件库
pnpm add @aura/ui

# 安装请求封装（可选）
pnpm add @aura/request

# 安装工具函数（可选）
pnpm add @aura/shared
```

## 使用组件

```tsx
import { Button } from '@aura/ui';

const App = () => (
  <Button type="primary" onClick={() => alert('Hello Aura!')}>
    点击我
  </Button>
);
```

## 使用请求封装

```tsx
import { get, post, setRequestDefaults } from '@aura/request';

// 设置全局配置
setRequestDefaults({
  baseURL: 'https://api.example.com',
  timeout: 15000,
});

// GET 请求
const data = await get('/users', { page: 1, size: 10 });

// POST 请求
const result = await post('/users', { name: 'Aura' });
```

## 开发模式

克隆项目后在本地启动开发服务器：

```bash
# 安装依赖
pnpm install

# 启动文档站
pnpm dev
```
