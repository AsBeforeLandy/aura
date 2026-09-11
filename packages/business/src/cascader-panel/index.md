---
title: CascaderPanel
subtitle: 级联多选面板
group: 业务
category: Components
description: 横向多列的级联多选面板，支持逐级展开、全选 / 半选与级联勾选。
order: 7
demo:
  cols: 1
toc: content
---

# CascaderPanel 级联多选面板

以横向多列的形式呈现多级选项：点击选项展开下一级，勾选后级联作用于整棵子树，每列提供「全选」，父级自动呈现全选 / 半选状态。

```tsx | pure
import { CascaderPanel } from "@aura/business";
```

## 何时使用

- 需要按层级（组织架构、类目树、区域划分）**批量圈选**某一分支下的全部子项
- 层级较深、希望在面板内逐级下钻而非弹层选择
- 需要同时掌握「当前展开到哪一级」（`onCurrentClick`）与「已勾选集合」（`onChange`）

## 与 antd Cascader 的区别

| | CascaderPanel | antd Cascader |
| --- | --- | --- |
| 形态 | 平铺面板、常驻展示 | 输入框触发下拉 |
| 选择模式 | 多选，勾选级联子孙 | 默认单选路径 |
| 适用场景 | 筛选面板内嵌、批量圈选 | 表单字段、单路径选择 |

## 交互说明

| 操作 | 行为 |
| --- | --- |
| 点击选项行 | 展开下一级，并向右滚动一列 |
| 勾选复选框 | 级联选中 / 取消整棵子树，父级自动进入全选或半选 |
| 列首「全选」 | 一键选中 / 取消当前列全部选项（含子孙） |

## 代码演示

<code src="./demo/basic.tsx" description="大区 → 省市三级结构；onChange 输出选中的值与选项集合。">基本用法</code>

## API

### CascaderPanelProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options | 级联选项数据 | `CascaderOption[]` | - |
| title | 首列标题 | `string` | `''` |
| value | 受控选中值（勾选父级时自动包含全部子孙） | `string[]` | - |
| onChange | 选中值变化回调 | `(selectedValues: string[], selectedOptions: CascaderOption[]) => void` | - |
| onCurrentClick | 点击选项（展开下级）回调 | `(value: CascaderOption) => void` | - |
| className | 自定义类名 | `string` | - |
| style | 自定义样式 | `CSSProperties` | - |

### CascaderOption

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| label | 选项文本 | `string` |
| value | 选项值（唯一） | `string` |
| tooltips | 悬停提示文案 | `string` |
| children | 子级选项 | `CascaderOption[]` |

> 选项支持任意扩展字段，`onCurrentClick` 回传的即原始选项对象。
