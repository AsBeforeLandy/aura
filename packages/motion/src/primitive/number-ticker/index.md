---
title: NumberTicker 数字滚动
group:
  title: 动效
  order: 3
category: Components
demo:
  cols: 1
toc: content
---

数字以弹簧从当前值滚动到新值——计数器、金额、指标看板。
value 变化时**从当前展示值**过渡（流式场景不会从 0 重播）；reduced-motion 下直接呈现终值。

<code src="./demo/basic.tsx">基础用法</code>

## API

| 属性              | 说明                                       | 类型                    | 默认值           |
| ----------------- | ------------------------------------------ | ----------------------- | ---------------- |
| value             | 目标数值；变化时从当前展示值过渡           | `number`                | -                |
| format            | 数字格式化                                 | `(n: number) => string` | zh-CN 千分位取整 |
| spring            | 弹簧档位：`spring` 稳定、`bouncy` 轻微回弹 | `SpringToken`           | `'spring'`       |
| className / style | 应用到承载 span                            | -                       | -                |
