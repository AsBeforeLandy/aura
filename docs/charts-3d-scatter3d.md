---
toc: content
---

# Scatter3D

三个数值维度的位置编码（X / Y / Z），点大小与颜色可作为第四、第五个编码通道——但编码通道越多读者越难还原数值，按类别着色是默认。

## 代码演示

<code src="./demo/chart-3d-scatter.tsx" description="三类用户聚簇 + 两个离群点：散点图的价值之一就是把离群点暴露出来。拖动旋转查看聚簇结构。">用户分层</code>

<code src="./demo/chart-3d-scatter-value.tsx" description="colorByValue：颜色沿色带按 Y 值（海拔）映射，自动旋转适合展示态。">按值渐变</code>

## API

| 属性         | 说明                                      | 类型               | 默认值       |
| ------------ | ----------------------------------------- | ------------------ | ------------ |
| data         | 散点数据                                  | `Scatter3DPoint[]` | `[]`         |
| pointSize    | 点半径（世界单位）                        | `number`           | `5`          |
| colorByValue | 按 Y 值渐变着色（关闭时按 category 着色） | `boolean`          | `true`       |
| colorRange   | 色带两端                                  | `[string, string]` | 蓝 → 青 → 金 |
| ranges       | 坐标轴范围覆盖                            | `{ x?; y?; z? }`   | 自动         |
| axisLength   | 三条轴的长度                              | `number`           | `240`        |
| tooltip      | 命中提示框                                | `boolean`          | `true`       |

### Scatter3DPoint

```ts
interface Scatter3DPoint {
  x: number;
  y: number;
  z: number;
  /** 类别名：同名的点共用一种颜色 */
  category?: string;
}
```

## 设计说明

**编码通道要克制**

位置（3）+ 大小（1）+ 颜色（1）已经是五个通道。通道越多，读者还原单个数值越难——默认只开位置 + 类别颜色，需要表达第四维度时再显式打开。

**离群点是散点图的价值**

聚簇说明「大多数在哪」，离群点说明「还有谁不在」。示例数据里刻意放了两个离群点——它们往往是故事的主角（异常用户、异常交易）。

**量程可以覆盖**

`ranges` 允许锁定坐标轴范围（例如固定 0~1000），多个散点图并排时可比对——自动缩放的图各说各话，锁定量程的图才在对话。
