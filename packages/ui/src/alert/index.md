---
title: Alert
subtitle: 警告提示
group: 反馈
category: Components
description: 警告提示，展示需要关注的信息。
order: 0
demo:
  cols: 1
toc: content
---

# Alert 警告提示

警告提示，展示需要关注的信息。

```tsx | pure
import { Alert } from '@aura/ui';
```

## 何时使用

- 当页面需要展示警告提示时
- 非浮层静态提示，始终显示在页面中

## 代码演示

<code src="./demo/basic.tsx" description="最简单的用法，展示各种类型的警告提示。">基本用法</code>
<code src="./demo/closable.tsx" description="设置 `closable` 可关闭警告提示，`showIcon` 展示对应图标。">可关闭</code>
<code src="./demo/action.tsx" description="`icon` 自定义图标，`action` 渲染右侧操作区。">操作区与自定义图标</code>
<code src="./demo/banner.tsx" description="`banner` 通栏模式，适合页面顶部公告。">通栏模式</code>

## API

### AlertProps

| 属性     | 说明                                              | 类型                                                       | 默认值      |
| -------- | ------------------------------------------------- | ---------------------------------------------------------- | ----------- |
| variant  | 提示类型                                          | `'default' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` |
| title    | 标题                                              | `ReactNode`                                                | -           |
| banner   | 是否用作页面顶部通栏（去圆角、居中展示）          | `boolean`                                                  | `false`     |
| closable | 是否可关闭                                        | `boolean`                                                  | `false`     |
| showIcon | 是否显示图标                                      | `boolean`                                                  | `false`     |
| icon     | 自定义图标（需配合 `showIcon`），覆盖变体默认图标 | `ReactNode`                                                | -           |
| action   | 右侧操作区（链接、按钮等）                        | `ReactNode`                                                | -           |
| onClose  | 关闭回调                                          | `() => void`                                               | -           |

继承 `HTMLAttributes<HTMLDivElement>`。
