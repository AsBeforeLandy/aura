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
import { Upload } from '@aura/ui';
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
<code src="./demo/controlled.tsx" description="受控 `fileList` 回显已有文件（编辑页场景），`maxCount` 限制数量，`onRemove` 可拦截删除。">受控回显与数量限制</code>
<code src="./demo/custom-request.tsx" description="`customRequest` 接入自有请求层，通过 `onSuccess` / `onError` 回报状态。">自定义上传</code>

## API

### UploadProps

| 属性            | 说明                                                                                                                                           | 类型                                                                | 默认值   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------- |
| accept          | 接受的文件类型                                                                                                                                 | `string`                                                            | -        |
| multiple        | 是否支持多选                                                                                                                                   | `boolean`                                                           | `false`  |
| disabled        | 是否禁用                                                                                                                                       | `boolean`                                                           | `false`  |
| maxSize         | 文件大小上限（bytes）                                                                                                                          | `number`                                                            | -        |
| maxCount        | 最多可上传的文件数量；为 `1` 时新选择的文件直接替换                                                                                            | `number`                                                            | -        |
| listType        | 文件列表展示风格                                                                                                                               | `'text' \| 'picture' \| 'picture-card'`                             | `'text'` |
| fileList        | 受控文件列表（编辑页回显）；传入后组件不自改状态，更新以 `onChange` 返回的列表为准                                                             | `UploadFile[]`                                                      | -        |
| defaultFileList | 默认文件列表（非受控）                                                                                                                         | `UploadFile[]`                                                      | -        |
| action          | 上传接口地址。配置后选择文件即发起真实 POST（multipart/form-data，字段名 `file`），成功置为 `done`、失败置为 `error`；不配置则保持本地模拟流程 | `string`                                                            | -        |
| headers         | 随上传请求附加的请求头（仅在配置了 `action` 时生效）                                                                                           | `Record<string, string>`                                            | -        |
| customRequest   | 自定义上传实现；配置后忽略 `action` 的内置请求，通过 `onSuccess` / `onError` 回报状态                                                          | `(options: CustomRequestOptions) => void`                           | -        |
| onChange        | 文件列表变化回调                                                                                                                               | `(fileList: UploadFile[]) => void`                                  | -        |
| beforeUpload    | 上传前钩子                                                                                                                                     | `(file: File) => boolean \| Promise<File>`                          | -        |
| onRemove        | 点击移除前的钩子，返回 `false` 阻止移除                                                                                                        | `(file: UploadFile) => boolean \| void \| Promise<boolean \| void>` | -        |
| onPreview       | 点击文件名（预览）回调                                                                                                                         | `(file: UploadFile) => void`                                        | -        |
| className       | 自定义类名                                                                                                                                     | `string`                                                            | -        |
| style           | 自定义样式                                                                                                                                     | `CSSProperties`                                                     | -        |

### CustomRequestOptions

| 属性      | 说明                                       | 类型                       |
| --------- | ------------------------------------------ | -------------------------- |
| file      | 待上传的文件                               | `File`                     |
| action    | 透传的接口地址                             | `string`                   |
| headers   | 透传的请求头                               | `Record<string, string>`   |
| onSuccess | 上传成功回调，调用后该文件状态置为 `done`  | `(body?: unknown) => void` |
| onError   | 上传失败回调，调用后该文件状态置为 `error` | `(error: Error) => void`   |

### Upload.Dragger

拖拽上传区域，继承 `UploadProps` 全部属性，额外支持：

| 属性     | 说明                                                | 类型        | 默认值 |
| -------- | --------------------------------------------------- | ----------- | ------ |
| children | 自定义拖拽区内容；不传时使用默认提示（图标 + 文案） | `ReactNode` | -      |

### UploadFile

| 属性   | 说明     | 类型                               |
| ------ | -------- | ---------------------------------- |
| uid    | 唯一标识 | `string`                           |
| name   | 文件名   | `string`                           |
| status | 上传状态 | `'uploading' \| 'done' \| 'error'` |
| url    | 文件地址 | `string`                           |
