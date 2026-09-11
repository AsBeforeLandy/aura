# @aura/shared

Aura 组件库的共享工具层：框架无关的纯函数、设计令牌与类名工具。

## 安装

```bash
pnpm add @aura/shared
```

## 使用

```ts
import { classNames, prefixCls, auraTokens } from '@aura/shared';

classNames('aura-btn', isActive && 'aura-btn-active'); // 'aura-btn aura-btn-active'
prefixCls('button');                                   // 'aura-button'
auraTokens.colors.primary[700];                        // '#7c3aed'
```

## 导出内容

| 导出 | 说明 |
| --- | --- |
| `classNames(...args)` | 条件类名拼接，过滤 `false` / `null` / `undefined` |
| `prefixCls(name)` | 生成 `aura-` 前缀类名，统一命名空间 |
| `auraTokens` | 设计令牌（颜色 / 圆角 / 间距 / 字号），与 CSS 变量同源 |

## 说明

- 无 React 依赖，可在任意框架或 Node 环境中使用。
- 可被 tree-shaking（`sideEffects: false`），只引入用到的成员即可。

## 许可证

MIT
