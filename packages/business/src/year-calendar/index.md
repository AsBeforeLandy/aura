---
title: YearCalendar
subtitle: 年历选择器
group: 业务
category: Components
description: 全年日期矩阵，一眼看全年的密集勾选组件，支持点击与拖拽框选。
order: 6
demo:
  cols: 1
toc: content
---

# YearCalendar 年历选择器

把一整年铺成一张**连续的「周 × 星期」网格**，高信息密度、无空白位，适用于投票日、活动排期、值班表等需要「一眼看全年」的勾选场景。

```tsx | pure
import { YearCalendar } from "@aura/business";
```

## 何时使用

- 需要在一屏内查看并勾选跨月、跨季度的多个日期
- 典型的选举 / 投票日选择：候选人各自的可用日期分布需要横向对比
- 值班表、排期表等需要快速圈定若干日期

## 布局说明

与「按月分块」的日历不同，本组件**不按月切块**，而是把整年铺成一条不间断的网格：

- 每一列 = 一个星期，固定 7 格，且都落在真实的星期行上
- 因此**不会出现任何空白位**，也不存在「属于相邻月份」的无效单元格
- 月份之间天然无缝衔接（不会因为月初 / 月末不满一周而断开）
- 每月标签横跨该月所占的列区间，浮在网格上方

## 交互说明

| 操作 | 行为 |
| --- | --- |
| 单击日期格 | 切换该日期的选中状态 |
| 按住拖拽 | 框选一片区域，整体选中或取消 |
| `children` 函数 | 接收当前已选日期数组，可自行渲染统计 / 操作区 |

选中结果以 `YYYY-MM-DD` 升序数组输出，保证结果稳定可预期。

## 代码演示

<code src="./demo/basic.tsx" description="传入 year 与 monthLabels；children 为函数时接收已选日期。">基本用法</code>

<code src="./demo/custom-size.tsx" description="通过 cellSize 自定义单元格尺寸。">自定义尺寸</code>

## API

### YearCalendarProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| year | 年份 | `number` | 当前年份 |
| value | 受控值（`YYYY-MM-DD` 数组） | `string[]` | - |
| defaultValue | 非受控默认值 | `string[]` | - |
| onChange | 值变化回调 | `(dates: string[]) => void` | - |
| weekStartsOn | 一周起始日，`1` 为周一 | `0 \| 1` | `1` |
| monthLabels | 月份标签 | `string[]` | 1月~12月 |
| hideYearTitle | 是否隐藏年份标题 | `boolean` | `false` |
| color | 未选中单元格颜色 | `string` | `var(--aura-border)` |
| selectedColor | 选中单元格颜色 | `string` | `var(--aura-primary-700)` |
| outsideColor | 非本年日期（首尾凑整周）颜色 | `string` | `var(--aura-bg-tertiary)` |
| cellSize | 自定义单元格尺寸（数字按 px，也可传任意 CSS 长度） | `number \| string` | `13` |
| weekLabels | 星期标签（7 个） | `string[]` | 一~日 / 日~六 |
| selectionStyle | 拖拽选区遮罩样式 | `CSSProperties` | - |
| children | 底部内容，函数形式接收已选日期 | `ReactNode \| ((dates: string[]) => ReactNode)` | - |

### 密度调节

单元格尺寸与间距通过 CSS 变量暴露，可在外部覆盖：

```less
.my-calendar {
  --aura-yc-cell: 14px;      /* 单元格边长 */
  --aura-yc-gap: 2px;        /* 格间距 */
  --aura-yc-month-gap: 8px;  /* 月份块间距 */
}
```
