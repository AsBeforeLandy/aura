---
title: FileCard
subtitle: 文件卡片
group:
  title: 交互
  order: 402
category: Components
description: 附件与引用文件的基本展示单元：扩展名图标、文件名、格式化大小、上传进度、失败原因与移除按钮。
order: 14
demo:
  cols: 1
toc: content
---

# FileCard 文件卡片

## 何时使用

- 展示一个附带的文件：上传中、上传完成、上传失败、普通引用；
- 通常配合 [`Attachments`](/x-components/attachments) 组成输入框上方的附件条，
  也可单独用于消息里的文件引用。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="静态的四种状态；并可从列表移除文件、模拟上传进度。">状态与移除</code>

## API

### FileCardProps

| 参数        | 说明                                                                  | 类型                                         | 默认值   |
| ----------- | --------------------------------------------------------------------- | -------------------------------------------- | -------- |
| name        | 文件名（建议带扩展名）                                                | `string`                                     | -        |
| size        | 字节数；内部格式化为 B / KB / MB / GB                                 | `number`                                     | -        |
| status      | 状态：`init` 普通展示 / `uploading` 进度 / `done` 成功 / `error` 失败 | `'init' \| 'uploading' \| 'done' \| 'error'` | `'init'` |
| percent     | `status="uploading"` 时的进度（0–100，越界钳制）                      | `number`                                     | -        |
| description | 文件描述                                                              | `ReactNode`                                  | -        |
| errorTip    | 失败原因；`status="error"` 时替代 description 显示                    | `ReactNode`                                  | -        |
| icon        | 自定义图标；缺省渲染内置文件图标                                      | `ReactNode`                                  | -        |
| onRemove    | 移除按钮回调；不传则不渲染按钮                                        | `(name: string) => void`                     | -        |

## 注意事项

- 大小格式化规则：B 取整，KB 及以上保留一位小数（如 `1.5 MB`）；
- `status="error"` 时 `errorTip` 会顶替 `description`，卡片边框与图标同步转为错误色；
- 进度条带 `role="progressbar"` 与 `aria-valuenow/min/max`，读屏可感知；
- 扩展名徽标取自文件名最后一段（小写展示，样式层大写），无扩展名时不渲染。
