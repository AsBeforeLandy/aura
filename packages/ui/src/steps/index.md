---
title: Steps
subtitle: 步骤条
group: 导航
category: Components
description: 引导用户按照流程完成任务的分步导航条。
order: 3
demo:
  cols: 2
toc: content
---

# Steps 步骤条

引导用户按照流程完成任务的分步导航条。

```tsx | pure
import { Steps } from '@aura-react-comp/ui';
```

## 何时使用

- 需要引导用户按步骤完成操作
- 展示任务进度

## 代码演示

<code src="./demo/default-variant.tsx" description="基础用法 — default 变体。">基础用法 — default 变体</code>
<code src="./demo/dot.tsx" description="Dot 变体。">Dot 变体</code>
<code src="./demo/navigation.tsx" description="Navigation 变体。">Navigation 变体</code>
<code src="./demo/vertical.tsx" description="垂直方向。">垂直方向</code>
<code src="./demo/small.tsx" description="小尺寸。">小尺寸</code>
<code src="./demo/disabled-step.tsx" description="禁用步骤。">禁用步骤</code>
<code src="./demo/custom-icon.tsx" description="自定义图标。">自定义图标</code>
<code src="./demo/variant.tsx" description="支持 `default`、`dot`、`navigation` 三种变体和垂直方向。">变体与方向</code>
<code src="./demo/error.tsx" description="`status=\"error\"` 出错态与 `subTitle` 副标题。">出错步骤</code>

## API

### StepsProps

| 属性           | 说明                                                     | 类型                                 | 默认值         |
| -------------- | -------------------------------------------------------- | ------------------------------------ | -------------- |
| current        | 当前步骤索引（受控，点击步骤仅触发 onChange 不自行更新） | `number`                             | `0`            |
| defaultCurrent | 默认当前步骤索引（非受控）                               | `number`                             | `0`            |
| variant        | 变体                                                     | `'default' \| 'dot' \| 'navigation'` | `'default'`    |
| size           | 尺寸                                                     | `'sm' \| 'md'`                       | `'md'`         |
| direction      | 方向                                                     | `'horizontal' \| 'vertical'`         | `'horizontal'` |
| className      | 自定义类名                                               | `string`                             | -              |
| style          | 自定义样式                                               | `CSSProperties`                      | -              |
| onChange       | 步骤切换回调                                             | `(current: number) => void`          | -              |

### StepProps

| 属性        | 说明                                       | 类型            | 默认值  |
| ----------- | ------------------------------------------ | --------------- | ------- |
| title       | 步骤标题                                   | `ReactNode`     | -       |
| subTitle    | 步骤副标题（显示在标题旁）                 | `ReactNode`     | -       |
| status      | 覆盖步骤状态；目前支持 `'error'`（出错态） | `'error'`       | -       |
| description | 步骤描述                                   | `ReactNode`     | -       |
| icon        | 自定义图标                                 | `ReactNode`     | -       |
| disabled    | 是否禁用                                   | `boolean`       | `false` |
| className   | 自定义类名                                 | `string`        | -       |
| style       | 自定义样式                                 | `CSSProperties` | -       |
