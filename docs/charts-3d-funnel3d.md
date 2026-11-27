---
toc: content
---

# Funnel3D

三维悬浮转化漏斗 / 金字塔图。每层由带顶部发光描边环的 3D 圆台或棱台悬浮组成，支持转化漏斗与层级金字塔双形态以及圆台 / 六棱台 / 四棱台三种截面，自动计算环节转化率与整体转化率，适合增长漏斗、销售商机与用户分层分析。

`Funnel3D` 是 `Scene3D` 的场景子组件。

## 何时使用

- 需要直观展示从曝光、访问、注册到付费的多环节转化流失情况。
- 需要用正置 3D 金字塔表达客户分层、会员体系或组织架构比例。
- 希望在汇报大屏上获得比平面梯形更具空间层次感的分层展示效果。

## 代码演示

<code src="./demo/chart-3d-funnel3d.tsx" description="支持在转化漏斗与层级金字塔之间切换，并可在圆台、六棱台、四棱台三种截面间自由切换。">悬浮漏斗与金字塔</code>

## API

### Funnel3DProps

| 属性         | 说明                                     | 类型                             | 默认值       |
| ------------ | ---------------------------------------- | -------------------------------- | ------------ |
| data         | 阶段数据（按自上而下顺序展示）           | `Funnel3DStage[]`                | `[]`         |
| variant      | 形态：倒置转化漏斗或正置层级金字塔       | `'funnel' \| 'pyramid'`          | `'funnel'`   |
| shape        | 截面形状：圆台 / 六棱台 / 四棱台         | `'round' \| 'hex' \| 'square'`   | `'round'`    |
| height       | 漏斗总高度（世界单位）                   | `number`                         | `210`        |
| maxRadius    | 最大半径（世界单位）                     | `number`                         | `105`        |
| gap          | 层间悬浮缝隙（世界单位）                 | `number`                         | `7`          |
| palette      | 分类色板                                 | `string[]`                       | 场景主题色板 |
| legend       | 是否显示分类图例                         | `boolean`                        | `true`       |
| tooltip      | 是否显示含环节转化与总转化率的提示框     | `boolean`                        | `true`       |
| showLabels   | 是否在右侧展示阶段名称与总转化率引导标注 | `boolean`                        | `true`       |
| animation    | 是否开启错峰展开与悬停微放大动画         | `boolean`                        | `true`       |
| onStageClick | 点击阶段回调                             | `(stage: Funnel3DStage) => void` | -            |

### Funnel3DStage

```ts
interface Funnel3DStage {
  name: string;
  value: number;
  color?: string;
}
```

### 纯函数

`buildFunnel3DModel(data, options)` 返回各层的上下半径、悬浮高度、环节转化率与累计转化率模型，不依赖 React，可在 jsdom/Node 中直接单测。
