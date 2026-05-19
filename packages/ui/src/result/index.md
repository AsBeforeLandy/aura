---
title: Result
subtitle: 结果
group: 反馈
category: Components
description: 用于反馈一系列操作任务的处理结果。
order: 4
demo:
  cols: 2
toc: content
---

# Result 结果

用于反馈一系列操作任务的处理结果。

```tsx | pure
import { Result } from "@aura/ui";
```

## 何时使用

- 操作完成后展示结果
- 错误页面（403/404/500）

## 代码演示
<code src="./demo/success.tsx" description="成功。">成功</code>
<code src="./demo/error.tsx" description="错误。">错误</code>
<code src="./demo/warning.tsx" description="警告。">警告</code>
<code src="./demo/info.tsx" description="信息。">信息</code>
<code src="./demo/404.tsx" description="404。">404</code>
<code src="./demo/403.tsx" description="403。">403</code>
<code src="./demo/500.tsx" description="500。">500</code>
<code src="./demo/custom-icon.tsx" description="自定义图标。">自定义图标</code>
<code src="./demo/error-page.tsx" description="用于展示 403、404、500 等错误页面。">错误页面</code>
## API

### ResultProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 结果类型 | `'success' \| 'error' \| 'warning' \| 'info' \| '404' \| '403' \| '500'` | `'info'` |
| title | 标题（必填） | `ReactNode` | - |
| subtitle | 副标题 | `ReactNode` | - |
| icon | 自定义图标 | `ReactNode` | - |
| extra | 附加内容（如操作按钮） | `ReactNode` | - |

继承 `HTMLAttributes<HTMLDivElement>`。
