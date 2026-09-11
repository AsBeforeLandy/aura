# @aura/request

基于原生 `fetch` 的轻量 HTTP 请求封装，提供拦截器、超时与统一错误处理。

## 安装

```bash
pnpm add @aura/request
```

## 使用

```ts
import { createRequest } from '@aura/request';

const request = createRequest({
  baseURL: '/api',
  timeout: 10000,
});

const users = await request.get('/users', { page: 1 });
```

## 说明

- 无第三方 HTTP 库依赖，直接基于原生 `fetch`。
- 可在浏览器与 Node 18+ 环境使用。
- 可被 tree-shaking（`sideEffects: false`）。

## 许可证

MIT
