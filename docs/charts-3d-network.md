---
toc: content
---

# Network3D

三维关系网络图。用节点表示实体、连线表示关系，支持确定性力导 / 球面 / 网格布局、分类着色、邻居高亮、提示框和节点点击，适合服务依赖、知识图谱、风控关系与组织网络。

`Network3D` 是 `Scene3D` 的场景子组件。

## 何时使用

- 需要查看实体之间的连接结构，而不只是比较单个数值。
- 需要从关系中识别核心节点、孤立节点与异常连接。
- 需要并排比较力导、球面和网格布局下的网络形态。

## 代码演示

<code src="./demo/chart-3d-network.tsx" description="服务依赖拓扑：悬停高亮邻居，点击节点查看详情。">服务依赖拓扑</code>

<code src="./demo/chart-3d-network-layouts.tsx" description="在同一份数据上切换力导、球面和网格布局。">布局对比</code>

## API

### Network3DProps

| 属性         | 说明                                   | 类型                            | 默认值         |
| ------------ | -------------------------------------- | ------------------------------- | -------------- |
| nodes        | 节点数据                               | `Network3DNode[]`               | `[]`           |
| links        | 连线数据                               | `Network3DLink[]`               | `[]`           |
| nodeSize     | 节点基础半径（世界单位）               | `number`                        | `5`            |
| linkOpacity  | 连线不透明度                           | `number`                        | `0.35`         |
| linkColor    | 连线颜色                               | `string`                        | 主题次级文本色 |
| layout       | 布局算法                               | `'force' \| 'sphere' \| 'grid'` | `'force'`      |
| layoutRadius | 布局半径（世界单位）                   | `number`                        | `140`          |
| iterations   | 力导布局迭代次数                       | `number`                        | `120`          |
| seed         | 力导布局随机种子                       | `number`                        | `7`            |
| palette      | 分类色板                               | `string[]`                      | 场景主题色板   |
| legend       | 是否显示分类图例                       | `boolean`                       | `true`         |
| tooltip      | 是否显示命中提示框                     | `boolean`                       | `true`         |
| showLabels   | 是否显示节点标签；仅 50 个节点以内生效 | `boolean`                       | `false`        |
| onNodeClick  | 节点点击回调                           | `(node: Network3DNode) => void` | -              |

### Network3DNode

```ts
interface Network3DNode {
  id: string;
  label?: string;
  category?: string;
  value?: number;
  position?: [number, number, number];
}
```

`id` 是连线引用的唯一键。重复 id 保留首个节点；传入 `position` 的节点固定在指定坐标，不参与力导位移。

### Network3DLink

```ts
interface Network3DLink {
  source: string;
  target: string;
  value?: number;
}
```

不存在端点的连线与自环会被忽略。`value` 可用于调用方自定义分析，不改变默认连线粗细。

### buildNetworkModel

`buildNetworkModel(nodes, links, options)` 返回可直接交给渲染层的布局模型，包括节点坐标、半径、分类、度数与有效连线。该函数不依赖 React，可在 Node 或 jsdom 中单测。

## 设计说明

**确定性布局**

相同数据与 `seed` 得到相同布局，避免监控大屏每次刷新都“换一张图”。固定坐标节点适合叠加已知坐标或人工排版。

**性能边界**

节点使用一个 `InstancedMesh`，连线使用一个 `lineSegments`。力导布局涉及两两斥力，超过 600 个节点时自动退化为球面布局，避免阻塞主线程；更大规模建议预计算坐标或分页查看。

**关系优先于装饰**

悬停时同时突出节点、邻居和相关连线，其余元素退后。颜色表达分类，位置表达关系，节点大小只做有限的数值辅助，不把所有信息都塞进一个通道。连线默认使用主题次级文本色，避免与节点分类色争夺注意力。

## 数据处理

- 空 `id`、重复 `id` 会被过滤。
- 含 `NaN` / `Infinity` `value` 的节点或连线会被过滤，避免无效指标进入布局与度数计算。
- 无分类节点使用默认分类。
- 空数据不创建节点与连线，也不会留下图例。
