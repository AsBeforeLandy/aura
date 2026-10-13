---
title: FocusRing 焦点环
group:
  title: 动效
  order: 9
category: Components
demo:
  cols: 1
toc: content
---

键盘焦点环的圆角跟随：环以弹簧动画移动到焦点元素的位置与尺寸（对齐 Material
focus ring 体验）。环为 `aria-hidden` 装饰层，不拦截指针与焦点。

<code src="./demo/basic.tsx">用 Tab 键体验</code>

## API

| 属性              | 说明                                            | 类型        | 默认值       |
| ----------------- | ----------------------------------------------- | ----------- | ------------ |
| children          | 容器内的可聚焦元素（button / input / a…）       | `ReactNode` | -            |
| radius            | 环的圆角（px）                                  | `number`    | `10`         |
| color             | 环颜色；默认读 `--aura-motion-focus-color` 令牌 | `string`    | 令牌回退紫色 |
| className / style | 应用到容器                                      | -           | -            |

环颜色可通过覆盖 `--aura-motion-focus-color` 令牌统一主题化。
