---
title: PdfViewer
subtitle: PDF 预览
group: 业务
category: Components
description: 基于 pdf.js 的弹窗式 PDF 预览：翻页、缩放、旋转、拖拽平移，关闭即释放资源。
order: 8
demo:
  cols: 1
toc: content
---

# PdfViewer PDF 预览

基于 pdf.js 的弹窗式 PDF 预览。支持翻页、缩放、旋转与拖拽平移；打开时按需加载，关闭即销毁文档与渲染资源。触发方式（按钮、链接、表格行点击）由调用方组合，组件只负责预览本身。

```tsx | pure
import { PdfViewer } from "@aura/business";
```

## 何时使用

- 需要**受控预览**合同、报告、制度文件等 PDF 附件，不希望用户直接下载原文件
- 需要**跨浏览器一致的阅读体验**（iframe 依赖浏览器内置阅读器，观感与能力不可控）
- 文档较大，需要**用完即释放**，避免长时间驻留内存

## 与 iframe 方案的对比

| | PdfViewer（pdf.js canvas 渲染） | iframe（浏览器内置阅读器） |
| --- | --- | --- |
| 观感一致性 | 各浏览器一致 | 随浏览器不同（移动端常直接触发下载） |
| 交互能力 | 翻页 / 缩放 / 旋转 / 平移可控 | 依赖浏览器实现 |
| 资源释放 | 关闭即 `destroy()` | 由浏览器接管，不可控 |
| 依赖体积 | pdfjs-dist（外部依赖，宿主打包） | 无 |

## 交互说明

| 操作 | 行为 |
| --- | --- |
| 拖拽画布 | 平移（鼠标与触摸统一，Pointer 事件实现，按帧合并更新） |
| 缩小 / 放大 | 以 20% 步进缩放，到达边界自动禁用 |
| 旋转 | 每次 +90°，归一化到 0 / 90 / 180 / 270 |
| 上一页 / 下一页 | 页码钳制在 `[1, 总页数]`，翻页后平移复位 |
| 关闭 | 触发 `onOpenChange(false)` 并销毁文档资源 |

## 代码演示

<code src="./demo/basic.tsx" description="点击按钮打开预览；onOpenChange 与 onPageChange 上报状态。">基本用法</code>

<code src="./demo/list.tsx" description="多文档共用一个预览实例：url 切换自动重新加载，加载失败出现错误提示与重试。">列表场景（受控）</code>

## API

### PdfViewerProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| url | PDF 文件地址（需同源，或服务端允许跨域） | `string` | - |
| open | 是否显示预览弹窗（受控） | `boolean` | - |
| defaultOpen | 默认是否显示（非受控） | `boolean` | `false` |
| onOpenChange | 弹窗显隐变化回调 | `(open: boolean) => void` | - |
| title | 弹窗标题 | `ReactNode` | `'文档预览'` |
| initialScale | 初始缩放比例（1 = 100%） | `number` | `1` |
| scaleRange | 缩放范围 `[最小, 最大]` | `[number, number]` | `[0.5, 3]` |
| workerSrc | pdf.js worker 脚本地址；传入后用独立线程渲染 | `string` | -（主线程渲染） |
| assetBaseUrl | pdf.js 资源基地址（cmaps / wasm / iccs / standard_fonts） | `string` | 按运行时版本推导的 CDN |
| pdfjsSrc | 运行时加载 pdf.js 主模块的地址（绕开打包器），见「已知问题」 | `string` | -（用打包进产物的实例） |
| onPageChange | 页码变化回调 | `(page: number) => void` | - |
| className | 自定义类名 | `string` | - |
| style | 自定义样式 | `CSSProperties` | - |

### CSS 变量

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| --aura-pdf-viewer-body-height | 预览区高度 | `70vh` |

## worker 与渲染模式

pdf.js 需要在独立线程或主线程中解析文档，因此必须能拿到 worker。组件按以下顺序决策：

1. 传入 `workerSrc`（或宿主已设置 `GlobalWorkerOptions.workerSrc`）→ **独立线程**渲染；
2. 否则 → **主线程**渲染（挂载 `globalThis.pdfjsWorker`，由 pdf.js 直接使用其 handler）。

### 默认：主线程渲染（零配置）

不创建独立 worker、不请求任何外部文件，因此不受打包器对 worker 文件的处理方式影响，
也没有 CDN / 同源 / MIME 的额外约束。代价是解析占用主线程，超大文档可能影响交互流畅度。

### 需要独立线程时：自托管 worker

```bash
# 从依赖里复制（务必保持文件原样，不要经过任何构建处理）
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

```tsx | pure
<PdfViewer url={url} workerSrc="/pdf.worker.min.mjs" />
```

> ⚠️ worker 是 **ES Module**，不要用 `import` 或
> `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` 引用它：
> 一旦进入打包器的 JS 处理管线就可能被改写（实测 dumi/webpack 会把它包进 IIFE、
> 却把顶层 `export` 留在函数体内），产物不再是合法模块，运行时报
> `SyntaxError: Unexpected token 'export'`。放进 `public/` 目录可保证原样发布。

### 已知问题：文档站的实时示例无法加载 PDF

**结论先说：这不是组件的问题。** 在纯静态 HTML 页中，用**完全相同**的代码与参数加载
同一份 pdf.js（原样文件、主线程模式），可以正常加载并渲染；而在本仓库文档站
（dumi / umi 运行时）的任何页面中——组件页、业务页、以及 dumi 的 demo iframe 页——
都会失败，报错形如 `Cannot destructure property 'docId' of 'e' as it is undefined`。

对照实验（均可在无头 Chrome 中复现）：

| 场景 | 结果 |
| --- | --- |
| 纯静态页 + 原样 pdf.js（主库 + worker，主线程模式） | ✅ 正常加载并渲染 |
| **相同代码、相同参数**，改在 dumi/umi 页面中执行 | ❌ 上述错误 |
| 打包后的 pdf.js（4.x 与 6.x、关掉压缩、保留 class 私有字段） | ❌ 同类协议错误 |
| 改用独立线程渲染（传 `workerSrc`） | ❌ `Cannot set properties of undefined (setting 'onPull')` |
| 全局 API 是否被替换 / 是否已有 `pdfjsWorker` 全局 / URL 尾斜杠 / 参数组合 / 并发 | 均无差异，均非触发条件 |

现象是**worker 侧收不到消息数据**，即 pdf.js 的同页消息通道在 umi 运行时下受到干扰。
因此**业务项目一般不受影响**（普通 React 应用已验证可用）。若宿主构建确实无法正确打包
pdf.js（例如打包器把 `import.meta.url` 改写成了构建机路径），可用 `pdfjsSrc` 指定
运行时加载原样 pdf.js、`assetBaseUrl` 指定自托管资源目录来规避。

## 浏览器要求

pdfjs-dist 6.x 使用了较新的平台 API（如 `URL.parse`），对浏览器版本要求较高：
**Chrome / Edge 126+、Safari 18+、Firefox 126+**（均为 2024 年中及以后版本）。
需要覆盖更老的浏览器时，请把依赖降到与该浏览器匹配的 pdfjs-dist 版本。

## 注意事项

- 服务端需允许跨域读取（同源部署最佳），否则文档加载失败并展示错误提示
- `assetBaseUrl` 默认按**运行时版本**（`pdfjs.version`）推导 jsdelivr CDN 地址，用于 cmaps（CJK 字体映射）、wasm（部分图像解码）、iccs、standard_fonts；内网环境可自托管这些目录后传入
- 组件以「受控 / 非受控」双模式工作：传 `open` 即受控，交由调用方决定显隐；未传时内部自持状态
- `pdfjs-dist` 为外部依赖，不会被打进组件产物；业务侧引用时按打包器常规按需加载
