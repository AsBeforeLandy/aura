---
title: Typewriter 打字机
group:
  title: 动效
  order: 5
order: 5
category: Components
demo:
  cols: 1
toc: content
---

逐字输出 + 闪烁光标——AI 回复无流式接口时的补位方案。
reduced-motion 下直接呈现全文；`text` 变化时自动重放。

<code src="./demo/basic.tsx">基础用法</code>

## API

| 属性       | 说明                       | 类型         | 默认值 |
| ---------- | -------------------------- | ------------ | ------ |
| text       | 输出的完整文本；变化时重放 | `string`     | -      |
| speed      | 每字符间隔（毫秒）         | `number`     | `32`   |
| delay      | 起始延时（毫秒）           | `number`     | `0`    |
| caret      | 是否显示闪烁光标           | `boolean`    | `true` |
| onComplete | 全部输出完成时回调         | `() => void` | -      |
| className  | 应用到容器 span            | `string`     | -      |

屏幕阅读器通过 `aria-live="polite"` 在完成后播报全文。
