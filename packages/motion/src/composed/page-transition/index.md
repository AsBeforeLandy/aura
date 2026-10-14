---
title: PageTransition 路由转场
group:
  title: 动效
  order: 11
order: 11
category: Components
demo:
  cols: 1
toc: content
---

路由切换时的页面级转场——Next.js App Router 的 `template.tsx` 模式（`transitionKey`
传 `usePathname()`）。demo 用状态模拟路由切换。

<code src="./demo/basic.tsx">模拟路由切换</code>

## API

| 属性          | 说明                                     | 类型               | 默认值     |
| ------------- | ---------------------------------------- | ------------------ | ---------- |
| transitionKey | 路由标识（如 pathname）；变化即触发转场  | `string`           | -          |
| mode          | `wait` 旧页退完新页再进；`sync` 交叉过渡 | `'wait' \| 'sync'` | `'wait'`   |
| duration      | 时长令牌档位                             | `DurationToken`    | `'normal'` |
