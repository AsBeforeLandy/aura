---
title: ModalForm
subtitle: 弹窗表单
group: 业务
category: Components
description: Modal + Form 封装，内置提交 loading 与校验流程。
order: 4
demo:
  cols: 1
toc: content
---

# ModalForm 弹窗表单

将 antd 的 `Modal` 与 `Form` 组合，内置「校验 → 提交 → 关闭」的完整流程。

```tsx | pure
import { ModalForm } from "@aura/business";
```

## 何时使用

- 新增 / 编辑数据的弹窗表单
- 希望「校验失败保持打开、提交中显示 loading、成功后自动关闭」这套流程开箱即用

## 代码演示

<code src="./demo/basic.tsx" description="onFinish 返回 Promise 时自动接管确定按钮 loading。">基本用法</code>

## 交互流程

1. 点击「确定」→ 触发 antd Form 校验
2. 校验失败 → 保持弹窗打开并显示错误提示
3. 校验通过 → 进入 loading 状态并执行 `onFinish`
4. `onFinish` 完成 → 自动关闭弹窗

## API

### ModalFormProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| open | 是否打开弹窗 | `boolean` | - |
| title | 弹窗标题 | `ReactNode` | - |
| onOpenChange | 打开状态变化回调 | `(open: boolean) => void` | - |
| onFinish | 提交回调（经校验后触发） | `(values) => void \| Promise<void>` | - |
| initialValues | 表单初始值 | `Record<string, unknown>` | - |
| okText | 确定按钮文案 | `ReactNode` | `'确定'` |
| cancelText | 取消按钮文案 | `ReactNode` | `'取消'` |
| width | 弹窗宽度 | `number \| string` | `520` |
| resetOnClose | 关闭后是否重置表单 | `boolean` | `true` |
| maskClosable | 点击蒙层是否可关闭 | `boolean` | `false` |
| form | 外部受控的表单实例 | `FormInstance` | - |
| destroyOnHidden | 关闭后是否销毁内容 | `boolean` | `true` |
