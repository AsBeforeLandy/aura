---
title: Slider
subtitle: 滑动输入条
group: 表单高级
category: Components
description: 滑动型输入器，支持单值和范围选择。
order: 0
demo:
  cols: 2
toc: content
---

# Slider 滑动输入条

滑动型输入器，支持单值和范围选择。

```tsx | pure
import { Slider } from '@aura-react-comp/ui';
```

## 何时使用

- 需要在给定范围内选择一个值或范围时
- 滑块支持键盘调节（方向键 ±`step`、PageUp/Down ±10`step`、Home/End 到两端）与触屏拖拽（Pointer Events）

## 代码演示

<code src="./demo/basic-2.tsx" description="基础用法。">基础用法</code>
<code src="./demo/marks.tsx" description="带标记。">带标记</code>
<code src="./demo/range.tsx" description="范围选择。">范围选择</code>
<code src="./demo/disabled.tsx" description="禁用状态。">禁用状态</code>
<code src="./demo/step.tsx" description="自定义步长。">自定义步长</code>
<code src="./demo/complete-callback.tsx" description="`onChangeComplete` 在一次调节结束（松开拖拽 / 轨道点击 / 单次键盘调节）后触发，适合替代 onChange 发起请求。">调节完成回调</code>

## API

### SliderProps

| 属性             | 说明                                                     | 类型                                          | 默认值  |
| ---------------- | -------------------------------------------------------- | --------------------------------------------- | ------- |
| min              | 最小值                                                   | `number`                                      | `0`     |
| max              | 最大值                                                   | `number`                                      | `100`   |
| step             | 步长                                                     | `number`                                      | `1`     |
| value            | 当前值（受控）                                           | `number \| [number, number]`                  | -       |
| defaultValue     | 默认值                                                   | `number \| [number, number]`                  | `0`     |
| disabled         | 是否禁用                                                 | `boolean`                                     | `false` |
| range            | 是否为双滑块区间模式                                     | `boolean`                                     | `false` |
| marks            | 刻度标记，key 为刻度值、value 为展示内容                 | `Record<number, ReactNode>`                   | -       |
| className        | 自定义类名                                               | `string`                                      | -       |
| style            | 自定义样式                                               | `CSSProperties`                               | -       |
| onChange         | 值变化回调（拖拽 / 点击 / 键盘调节过程中持续触发）       | `(value: number \| [number, number]) => void` | -       |
| onChangeComplete | 一次调节结束后的回调（松开拖拽、轨道点击、单次键盘调节） | `(value: number \| [number, number]) => void` | -       |

继承 `React.AriaAttributes`（`aria-*` 属性）。
