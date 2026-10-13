---
title: SplitText 文字拆分
group:
  title: 动效
  order: 4
category: Components
demo:
  cols: 1
toc: content
---

文字按字 / 词 / 行三种粒度依次入场——标题、Hero 文案、引用的强调进场。
reduced-motion 下直接渲染完整文本。

<code src="./demo/basic.tsx">三种粒度与 inView 模式</code>

## API

| 属性              | 说明                                    | 类型                           | 默认值     |
| ----------------- | --------------------------------------- | ------------------------------ | ---------- |
| text              | 文本内容                                | `string`                       | -          |
| granularity       | 拆分粒度                                | `'char' \| 'word' \| 'line'`   | `'char'`   |
| stagger           | 相邻片段步进延迟（秒）                  | `number`                       | `0.04`     |
| duration          | 时长令牌档位                            | `'fast' \| 'normal' \| 'slow'` | `'normal'` |
| mode              | `mount` 挂载即播；`inView` 进入视口时播 | `'mount' \| 'inView'`          | `'mount'`  |
| className / style | 应用到容器 span                         | -                              | -          |
