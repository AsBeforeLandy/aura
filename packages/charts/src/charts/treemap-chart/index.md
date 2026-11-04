---
title: TreemapChart
subtitle: 矩形树图
group: 图表 · 层级
category: Charts
description: 用矩形面积同时表达占比与层级。
order: 0
demo:
  cols: 1
toc: content
---

# TreemapChart 矩形树图

矩形树图把一块画布切成若干个矩形，**面积 = 数值**，嵌套关系表达层级。它能在有限空间里塞下几十上百个数据点，比饼图更能容纳层级。

## 何时使用

- 磁盘占用、代码体积构成
- 预算/销售额按「大区 → 城市」拆分
- 分类很多（> 8 个）但又要看占比

不适合：需要精确读数（配合 tooltip）、层级超过 3 层（再往下就切得太碎，标签放不下）。

## 代码演示

<code src="./demo/basic.tsx" description="两层结构：父块里包着子块，面积比例一眼可比。">基础用法</code>

<code src="./demo/depth.tsx" description="控制展开层数与是否显示数值，格子太小会自动省略标签。">层数与标签</code>

## API

### TreemapChartProps

| 属性                                  | 说明                             | 类型                          | 默认值   |
| ------------------------------------- | -------------------------------- | ----------------------------- | -------- |
| data                                  | 根节点                           | `HierarchyNode`               | —        |
| maxDepth                              | 展开层数，1 为只画根的直接子节点 | `number`                      | `1`      |
| label                                 | 标签策略                         | `'auto' \| 'always' \| false` | `'auto'` |
| showValue                             | 是否显示数值                     | `boolean`                     | `true`   |
| gap                                   | 格子间隙（像素）                 | `number`                      | `2`      |
| tooltip / theme / palette / animation | 同基础图表                       | —                             | —        |

### HierarchyNode

```ts
interface HierarchyNode {
  name: string;
  /** 叶子节点用 value；分支节点可省略，由子节点求和 */
  value?: number;
  children?: HierarchyNode[];
  color?: string;
}
```

## 设计说明

**为什么用 squarified 而不是「交替横竖切」**

最简单的做法是 slice-and-dice：一层横切、一层竖切交替。它实现只要十行，但会产出极端细长的矩形——面积虽然对得上，细条既放不下文字，人眼也难以比较面积。

squarified（Bruls, Huizing & van Wijk, 2000）逐行控制**最差宽高比**，让每块尽量接近正方形。代价是算法复杂一些，收益是这张图真的能读。

**父子同色系**

子层颜色由父色向白混合 32% 得来，而不是从色板里另取一色。否则「华东 → 上海」和「华南 → 深圳」会分到两种不相干的颜色，层级关系就丢了。

**标签按尺寸降级**

宽 < 56px 或高 < 22px 时不画标签，高 < 40px 时不画数值。硬塞进去的文字会溢出格子，比没有更糟。

**为什么不做下钻交互**

下钻（点击进入子层）会引入状态与面包屑导航，属于一套独立的交互体系。组件保持「一次渲染一个层级视图」，需要下钻时由使用方切换 `data` 即可——把状态留给业务，组件只负责画。
