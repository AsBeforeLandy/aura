---
title: Switch
subtitle: 开关
group: 表单
category: Components
description: 开关选择器，切换两种状态。
order: 5
demo:
  cols: 2
toc: content
---

# Switch 开关

开关选择器，切换两种状态。


```tsx | pure
import { Switch } from "@aura/ui";
```

## 何时使用

- 需要表示开关状态或两种状态之间的切换时
- 和 `checkbox` 的区别是，Switch 会立即触发状态改变，而 Checkbox 一般用于标记状态需要配合表单使用

## 代码演示
<code src="./demo/basic.tsx" description="最基本的开关用法，支持受控和非受控模式。">基本用法</code>
<code src="./demo/size.tsx" description="提供 `sm`、`md`、`lg` 三种尺寸。">尺寸</code>
<code src="./demo/loading.tsx" description="设置 `loading` 属性可显示加载状态。">加载中</code>
## API

### SwitchProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| size | 开关尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| checked | 是否选中（受控） | `boolean` | - |
| defaultChecked | 默认是否选中 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| checkedChildren | 选中时显示的内容 | `ReactNode` | - |
| unCheckedChildren | 未选中时显示的内容 | `ReactNode` | - |
| onChange | 切换回调 | `(checked: boolean) => void` | - |
