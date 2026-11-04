---
title: GraphChart
subtitle: 关系图
group: 图表 · 关系
category: Charts
description: 力导向布局的网络图，用聚簇揭示结构。
order: 1
demo:
  cols: 1
toc: content
---

# GraphChart 关系图

力导向布局把图当成物理系统：节点两两相斥、有连边的相互吸引。收敛后，**连得紧的聚成一簇，孤立的被推到边缘**。

这是一种**探索型**图表——它的价值是让你看到结构，而不是读出精确数值。

## 何时使用

- 微服务/模块依赖关系
- 社交网络、协作关系
- 知识图谱、实体关联

不适合：需要精确比较数值、节点超过 300 个（力导向会挤成一团，此时应改用[桑基图](/charts/sankey-chart)或矩阵视图）。

## 代码演示

<code src="./demo/basic.tsx" description="微服务依赖关系，按接入/业务/基础三层分组配色；连接数多的节点半径更大。">基础用法</code>

<code src="./demo/simple.tsx" description="少量节点时标签全显示；关闭标签与按度缩放后只保留结构轮廓。">小图与极简模式</code>

## API

### GraphChartProps

| 属性                                  | 说明             | 类型          | 默认值 |
| ------------------------------------- | ---------------- | ------------- | ------ |
| nodes                                 | 节点             | `ForceNode[]` | `[]`   |
| links                                 | 关系             | `ForceLink[]` | `[]`   |
| iterations                            | 力导向迭代次数   | `number`      | `220`  |
| nodeSize                              | 基础半径         | `number`      | `7`    |
| showLabel                             | 是否显示节点名   | `boolean`     | `true` |
| scaleByDegree                         | 按连接数放大半径 | `boolean`     | `true` |
| tooltip / theme / palette / animation | 同基础图表       | —             | —      |

### ForceNode / ForceLink

```ts
interface ForceNode {
  id: string;
  name?: string;
  /** 分组名，用于配色 */
  group?: string;
  size?: number;
}

interface ForceLink {
  source: string;
  target: string;
  value?: number;
}
```

## 设计说明

**初始位置不用随机数**

随机散布能让每次布局略有不同（有时更容易跳局部最优），但代价是同一份数据刷新两次长得不一样，截图也没法比对。这里用「圆环 + 确定性扰动」，收敛速度足够，且结果可复现。

**温度冷却**

每轮迭代按当前温度限制单点最大位移，温度线性衰减。没有这一步，节点会在平衡点附近反复弹跳，永远收敛不了。

**半径上限 2.2 倍**

按连接数放大能突出枢纽节点，但不设上限时，连接数 50 的中心节点会吞掉整张图，其余节点全被挤到边缘看不见。

**悬停高亮邻居**

鼠标移到节点上时，只有它和它的邻居保持不透明，其余压到 0.28。网络图最容易「糊成一团」，这一步是让它可读的关键。

**性能边界**

斥力计算是 O(n²) × 迭代次数。100 个节点约 2 亿次浮点运算，在 useMemo 里跑一次约 100ms，可接受；超过 300 个节点请降低 `iterations` 或换图表类型——力导向本身也不适合看那么大的图。
