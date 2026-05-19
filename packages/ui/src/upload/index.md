---
title: Upload
subtitle: 上传
group: 表单高级
category: Components
description: 文件选择上传和拖拽上传控件。
order: 2
demo:
  cols: 2
toc: content
---

# Upload 上传

文件选择上传和拖拽上传控件。

```tsx | pure
import { Upload } from "@aura/ui";
```

## 何时使用

- 需要上传文件时
- 需要拖拽上传时

## 代码演示
<code src="./demo/text-list.tsx" description="基础用法 — text 列表。">基础用法 — text 列表</code>
<code src="./demo/picture-list.tsx" description="picture 列表。">picture 列表</code>
<code src="./demo/picture-card.tsx" description="picture-card 卡片模式。">picture-card 卡片模式</code>
<code src="./demo/limit-size.tsx" description="限制大小（最大 1KB）。">限制大小（最大 1KB）</code>
<code src="./demo/disabled.tsx" description="禁用状态。">禁用状态</code>
<code src="./demo/multiple.tsx" description="多选。">多选</code>
<code src="./demo/dragger.tsx" description="拖拽上传。">拖拽上传</code>
## API

### UploadProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| accept | 接受的文件类型 | `string` | - |
| multiple | 是否支持多选 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| maxSize | 文件大小上限（bytes） | `number` | - |
| listType | 文件列表展示风格 | `'text' \| 'picture' \| 'picture-card'` | `'text'` |
| action | 上传地址 | `string` | - |
| headers | 自定义请求头 | `Record<string, string>` | - |
| onChange | 文件列表变化回调 | `(fileList: UploadFile[]) => void` | - |
| beforeUpload | 上传前钩子 | `(file: File) => boolean \| Promise<File>` | - |

### UploadFile

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| uid | 唯一标识 | `string` |
| name | 文件名 | `string` |
| status | 上传状态 | `'uploading' \| 'done' \| 'error'` |
| url | 文件地址 | `string` |
