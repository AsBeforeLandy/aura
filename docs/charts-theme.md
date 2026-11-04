---
toc: content
---

# 主题定制

图表主题**不是**一份写死的色值表，而是运行时从 Aura 的 CSS 变量读取的结果。这意味着：

1. 只要引入了 `@aura-react-comp/ui/style.css`，图表天然与组件库同色；
2. 宿主修改 `--aura-primary-700`，图表随之变化；
3. 切换 `data-theme="dark"` 时图表自动切换暗色配色（内部用 `MutationObserver` 监听）。

## 主题从哪里来

| 图表元素           | 读取的令牌              |
| ------------------ | ----------------------- |
| 主色板首色、强调色 | `--aura-primary-700`    |
| 刻度标签           | `--aura-text-secondary` |
| 轴线 / 网格线      | `--aura-border`         |
| tooltip 背景       | `--aura-bg-secondary`   |
| 字体               | `--aura-font-family`    |

未引入令牌时，内置一份与 Aura 浅色主题一致的兜底值，保证 SSR 与孤立使用场景仍能出图。

## 三种定制方式

### 1. 只换色板

```tsx | pure
<LineChart palette={['#0ea5e9', '#10b981', '#f59e0b']} />
```

`palette` 会循环取用，系列数量超过色板长度时自动回到第一个。

### 2. 局部覆盖（推荐）

`createChartTheme` 做深合并，只需写想改的字段：

```tsx | pure
import { createChartTheme } from '@aura-react-comp/charts';

const myTheme = createChartTheme({
  overrides: {
    font: { size: 13 },
    grid: { dash: [] }, // 网格线改实线
    series: { barRadius: 0 }, // 柱子改直角
  },
});

<BarChart theme={myTheme} />;
```

### 3. 使用暗色主题

```tsx | pure
<LineChart theme="dark" />
```

注意：`theme="dark"` 是**强制**暗色，不跟随页面 `data-theme`；不传 `theme` 时才会跟随。

## 完整主题结构

```ts
interface ChartTheme {
  palette: string[]; // 分类色板
  font: { family; size; sizeSmall; weightNormal; weightMedium };
  text: { primary; secondary; accent };
  axis: { line; tick; label; lineWidth; tickSize };
  grid: { line; lineWidth; dash };
  legend: { text; textInactive };
  tooltip: { background; border; text; shadow; radius };
  series: { lineWidth; areaOpacity; symbolSize; barRadius; emphasisWidth };
  emphasis: string;
}
```

## 默认色板的取舍

默认 12 色是手工挑选而非算法生成。原因：HSL 均匀旋转生成的色板在黄绿区间会出现亮度骤变，多系列折线图里总有一条「看不见」。

色板首色锚定 Aura 品牌紫 `#7c3aed`，因此单系列图表天然就是品牌色，不需要额外配置。
