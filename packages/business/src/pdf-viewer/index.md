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
| width | 弹窗宽度。默认取 **A4 纸宽度**（`210mm` ≈ 794px），使 A4 文档恰好按 100% 呈现；数字按 px，也可传任意 CSS 长度（如 `'96%'`），窄屏下由 antd 按视口自动收敛 | `number \| string` | `'210mm'` |
| autoFitWidth | 文档加载完成后按容器宽度自动适配缩放（「适合宽度」）。pdf.js 的 `scale = 1` 是「1pt = 1px」，A4 只渲染 595px 宽，放进 A4 弹窗会留白；开启后按可用宽度反推缩放并钳制在 `scaleRange` 内，用户手动缩放后不再干预 | `boolean` | `true` |
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

### 环境要求：`Promise.try` 必须转发参数

pdf.js 通过 `Promise.try(action, data)` 把消息参数交给处理器，因此对
**`Promise.try` 的参数转发**有硬依赖。部分运行时 polyfill 的实现会丢弃参数
（实测 dumi / umi 的运行时如此），症状是 pdf.js 的 worker 收到空消息，抛出与真实
原因毫无关系的错误：

```text
Cannot destructure property 'docId' of 'e' as it is undefined
Cannot set properties of undefined (setting 'onPull')
```

定位过程（可在无头 Chrome 中复现）：同一段代码在纯静态页正常、在 umi 页面失败 →
插桩发现消息**带着数据发出、事件也带着数据投递**，但处理器收到 undefined →
再测 `Promise.try` 行为：纯静态页 `(fn,1,2) → [1,2]`，umi 页 `(fn,1,2) → [null,null]`。

**组件已内置处理**：每次加载前做一次特性探测，检测到该缺陷时恢复 `Promise.try` 的
规范实现（仅在此类环境生效，正常环境不做任何改动），因此**调用方无需额外处理**。
若你的启动代码也依赖该特性，可参考 `packages/business/src/pdf-viewer/index.tsx`
中的 `ensurePromiseTry`。

## 浏览器要求

pdfjs-dist 6.x 使用了较新的平台 API（如 `URL.parse`），对浏览器版本要求较高：
**Chrome / Edge 126+、Safari 18+、Firefox 126+**（均为 2024 年中及以后版本）。
需要覆盖更老的浏览器时，请把依赖降到与该浏览器匹配的 pdfjs-dist 版本。

## 注意事项

- 服务端需允许跨域读取（同源部署最佳），否则文档加载失败并展示错误提示
- `assetBaseUrl` 默认按**运行时版本**（`pdfjs.version`）推导 jsdelivr CDN 地址，用于 cmaps（CJK 字体映射）、wasm（部分图像解码）、iccs、standard_fonts；内网环境可自托管这些目录后传入
- 组件以「受控 / 非受控」双模式工作：传 `open` 即受控，交由调用方决定显隐；未传时内部自持状态
- `pdfjs-dist` 为外部依赖，不会被打进组件产物；业务侧引用时按打包器常规按需加载
