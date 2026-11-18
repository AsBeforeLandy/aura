---
toc: content
---

# Bar3D

数据是「行 × 列」矩阵：`x` 与 `z` 是两个分类维度，`value` 决定柱高；颜色沿色带按值映射——与 2D 热力图同一套编码语言，读者不需要学第二遍。

## 代码演示

<code src="./demo/chart-3d.tsx" description="汇报周期 × 区域的交付量矩阵：X / Z 两个分类维度，高度编码数值，颜色沿色带映射。拖动可旋转视角，柱体入场时错峰生长。">柱状矩阵</code>

<code src="./demo/chart-3d-bar-diff.tsx" description="差值类数据：负值（节省）落在色带左端、正值（超支）落在右端——colorRange 换一组颜色即可反转语义。">差值数据与自定义色带</code>

## API

| 属性       | 说明                     | 类型               | 默认值    |
| ---------- | ------------------------ | ------------------ | --------- |
| data       | 数据矩阵                 | `Bar3DDataItem[]`  | `[]`      |
| maxHeight  | 柱体最大高度（世界单位） | `number`           | `160`     |
| cellSize   | 柱底面边长               | `number`           | `26`      |
| colorRange | 色带两端                 | `[string, string]` | 紫 → 浅紫 |
| tooltip    | 命中提示框               | `boolean`          | `true`    |

### Bar3DDataItem

```ts
interface Bar3DDataItem {
  /** 行分类（X 轴） */
  x: string;
  /** 列分类（Z 轴） */
  z: string;
  value: number;
}
```

## 动画

柱体入场时从基线**错峰生长**（easeOutQuint，后一根柱子比前一根晚出发）——与 2D 图表的错峰语义一致：整排同时弹起是噪音，扫过才有方向感。数据更新不重播：3D 大屏多为展示态，更新直接落位。

## 性能：InstancedMesh

柱体规模超过 300 时自动切换 **InstancedMesh**：全部柱体共用一个 BoxGeometry，整屏一次 draw call，3000 柱无压力。

- 拾取用 raycaster 的 `instanceId` 反查数据，tooltip 与高亮行为不变；
- hover 高亮只更新两个实例的颜色（上一个恢复、新命中的提亮），不整批重刷；
- 生长动画每帧重建实例矩阵——3000 柱每帧 3000 次矩阵写，可接受。

阈值以下的柱体仍走逐柱 mesh（hover 高亮实现更直接）。

## 设计说明

**图例与参考刻度**

右上角的色带图例（min → max 渐变条）与场景内的四档数值参考线由 `legend` 控制，通过 Scene3D 的 DOM 覆盖层通道（`useScene().setOverlay`）渲染——图例属于图表的一部分，由图表自己声明落点，而不是让页面在外面拼装。

**色带必须 clamp**

差值类数据（正负混合）会让归一化比值超出 0~1，直接交给色带插值会**外插出界色**。颜色计算处统一 clamp——「最节省落在色带左端、最超支落在右端」的语义才成立。
