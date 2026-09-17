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
| workerSrc | pdf.js worker 脚本地址，见下方「worker 配置」 | `string` | 随包 worker 文件 |
| cMapUrl | CMap 字体映射资源地址（渲染 CJK 文档时需要）；传空串禁用 | `string` | jsdelivr CDN |
| onPageChange | 页码变化回调 | `(page: number) => void` | - |
| className | 自定义类名 | `string` | - |
| style | 自定义样式 | `CSSProperties` | - |

### CSS 变量

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| --aura-pdf-viewer-body-height | 预览区高度 | `70vh` |

## worker 配置

组件默认以 `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` 引入与依赖同版本的 worker，webpack 5 / Vite 均可自动解析，**大多数项目零配置可用**。

以下场景需通过 `workerSrc` 显式传入同源副本地址：

- webpack 4 等不支持 `new URL(..., import.meta.url)` 资源解析的构建器
- 微前端（qiankun 等）子应用资源路径被重写的环境
- 希望与其他模块共用同一份 pdf.js worker 时

```tsx | pure
// 典型做法：把 worker 文件复制到 public 目录，或从 CDN 下载后同源自托管
<PdfViewer url={url} workerSrc="/pdf.worker.min.mjs" />
```

> 跨域 CDN 地址（如 jsdelivr）受同源策略限制，**不能**直接充当 `workerSrc`。

## 注意事项

- 服务端需允许跨域读取（同源部署最佳），否则文档加载失败并展示错误提示
- `cMapUrl` 默认指向 jsdelivr CDN，渲染含 CJK 字体的文档时需要；内网环境可将 `cmaps/` 目录自托管后传入
- 组件以「受控 / 非受控」双模式工作：传 `open` 即受控，交由调用方决定显隐；未传时内部自持状态
- `pdfjs-dist` 为外部依赖，不会被打进组件产物；业务侧引用时按打包器常规按需加载
