---
toc: content
---

# Voxel3D

三维体素热力图：x / z 平面网格 + y 层向堆叠的立方体阵列，值 → 色带颜色。与 Bar3D 互补——Bar 用**高度**编码一个分类维度，Voxel 用**颜色**编码三个分类维度的交叉值。

## 代码演示

<code src="../demo/chart-3d-voxel.tsx" description="区域 × 机柜层 × 时间的温度采样：三层堆叠的体素阵列，值映射深青 → 亮青 → 金色带。拖动旋转可逐层检视。">温度采样</code>

## API

| 属性         | 说明                 | 类型                          | 默认值      |
| ------------ | -------------------- | ----------------------------- | ----------- |
| data         | 体素数据             | `VoxelDatum[]`                | `[]`        |
| voxelSize    | 体素边长（世界单位） | `number`                      | `16`        |
| colorRange   | 色带两端             | `[string, string]`            | 深青 → 亮青 |
| legend       | 显示色带图例         | `boolean`                     | `true`      |
| animation    | 入场缩放动画         | `boolean`                     | `true`      |
| tooltip      | 命中提示框           | `boolean`                     | `true`      |
| onVoxelClick | 点击体素回调         | `(datum: VoxelDatum) => void` | -           |

### VoxelDatum

```ts
interface VoxelDatum {
  /** 列分类（X 轴） */
  x: string;
  /** 层分类（Y 轴，向上堆叠） */
  y: string;
  /** 行分类（Z 轴） */
  z: string;
  value: number;
}
```

## 设计说明

**渲染沿用 InstancedMesh 模式**

体素规模天然是三维乘积（4×3×4=48 起，10×10×10=1000），全部沿用 InstancedBars 的模式：共用 BoxGeometry、一次 draw call、instanceId 反查 tooltip、hover 提亮只写两个实例。

**负值与缺失的色带语义**

比值统一 clamp 进 0~1：差值类数据（正负混合）不会外插出色带；NaN 按 0 参与而不是抛错——体素阵列里一个 NaN 顶点不应该让整片消失。

**与 Bar3D 的选型**

三个分类维度都用「位置」表达、值用「颜色」表达时选 Voxel3D；两个分类维度 + 值用「高度」表达时选 Bar3D。同一个问题两种编码都成立时，优先 Bar3D——高度对比比色相对比更直观。
