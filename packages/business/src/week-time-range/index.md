---
title: WeekTimeRange
subtitle: 周时间段选择器
group: 业务
category: Components
description: 一周 × 时间粒度的矩阵选择器，支持点击切换与拖拽框选。
order: 5
demo:
  cols: 1
toc: content
---

# WeekTimeRange 周时间段选择器

以「一周 × 时间粒度」的矩阵呈现可选时段，适用于排班、可预约时间、营业时间等场景。

```tsx | pure
import { WeekTimeRange } from "@aura/business";
```

## 何时使用

- 需要按「星期 + 时段」维度配置可用时间（客服排班、会议室可预约时段、营业时间）
- 希望用户能一次拖拽出一片连续区域，而不是逐格点击

## 交互说明

| 操作 | 行为 |
| --- | --- |
| 单击单元格 | 切换该时段的选中状态 |
| 按住拖拽 | 框选一片区域，整体选中或取消 |
| 底部「清空」 | 重置全部选择 |

**相邻时段会自动合并**：勾选 `09:00-09:30` 与 `09:30-10:00` 会合并为 `09:00-10:00`；
若从已选区间中间挖掉一段，则会拆分为前后两段。

## 代码演示

<code src="./demo/basic.tsx" description="默认 30 分钟粒度、周一起始；值以结构化 TimeRange 数组输出。">基本用法</code>

<code src="./demo/custom-size.tsx" description="通过 cellWidth / cellHeight 自定义单元格尺寸。">自定义尺寸</code>

## API

### WeekTimeRangeProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控值 | `WeekTimeRangeValue` | - |
| defaultValue | 非受控默认值 | `WeekTimeRangeValue` | - |
| onChange | 值变化回调 | `(value) => void` | - |
| stepMinutes | 时间粒度（分钟） | `15 \| 30 \| 60` | `30` |
| weekStartsOn | 一周起始日，`1` 为周一 | `0 \| 1` | `1` |
| weekLabels | 自定义星期标签 | `string[]` | 周一~周日 |
| color | 选中单元格颜色 | `string` | `var(--aura-primary-700)` |
| selectionStyle | 拖拽选区遮罩样式 | `CSSProperties` | - |
| cellWidth | 自定义单元格宽度（数字按 px，也可传任意 CSS 长度） | `number \| string` | `11` |
| cellHeight | 自定义单元格高度 | `number \| string` | `26` |
| disabled | 是否只读 | `boolean` | `false` |
| showSummary | 是否显示底部已选摘要 | `boolean` | `true` |

### TimeRange

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| start | 开始时间，格式 `HH:mm` | `string` |
| end | 结束时间，格式 `HH:mm` | `string` |

### WeekTimeRangeValue

7 个元素的数组（对应一周七天），每个元素是该天的时间段数组：

```ts
[[{ start: '09:00', end: '12:00' }], [], [], [], [], [], []]
```

> 天数顺序与 `weekStartsOn` 一致。

### 密度调节

优先使用组件参数（见上方 API）：

```tsx | pure
<WeekTimeRange cellWidth={16} cellHeight={30} />
```

或通过 CSS 变量在外部覆盖（适合全局主题定制）：

```less
.my-schedule {
  --aura-wtr-cell-width: 11px;   /* 单元格宽度（默认 11px） */
  --aura-wtr-cell-height: 26px;  /* 单元格高度 */
  --aura-wtr-label-width: 82px;  /* 左侧星期标签列宽 */
}
```
