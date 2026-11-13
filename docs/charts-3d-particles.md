---
toc: content
---

# ParticleField

粒子背景装饰层：星野漂移 + 可选的近距离连线网络。用于大屏背景、登录页、空状态的「氛围层」——纯装饰，不承载数据。

## 代码演示

<code src="./demo/chart-3d-particles.tsx" description="连线网络模式：近距离粒子自动连线；星野模式：关闭连线、降低速度与透明度，作为内容层的背景。鼠标移动有视差。">两种形态</code>

## API

| 属性         | 说明                   | 类型      | 默认值    |
| ------------ | ---------------------- | --------- | --------- |
| count        | 粒子数量               | `number`  | `120`     |
| color        | 粒子颜色               | `string`  | `#38bdf8` |
| particleSize | 粒子尺寸（世界单位）   | `number`  | `2.2`     |
| opacity      | 粒子透明度             | `number`  | `0.85`    |
| showLinks    | 绘制近距离连线网络     | `boolean` | `true`    |
| linkDistance | 连线的距离阈值         | `number`  | `26`      |
| linkColor    | 连线颜色               | `string`  | `#0ea5e9` |
| speed        | 漂移速度系数，0 = 静止 | `number`  | `1`       |
| interactive  | 鼠标视差               | `boolean` | `true`    |

## 使用方式

```tsx | pure
// 作为绝对定位的背景层铺满容器，内容层叠在其上
<div style={{ position: 'relative' }}>
  <div style={{ position: 'absolute', inset: 0 }}>
    <ParticleField count={160} showLinks={false} />
  </div>
  <div style={{ position: 'relative' }}>{/* 内容 */}</div>
</div>
```

## 设计说明

**纯装饰，默认对读屏隐身**

`aria-hidden` 默认开启、`pointer-events` 关闭——背景粒子不该出现在读屏器的朗读序列里，也不该挡住内容层的交互。

**确定性初始化**

粒子位置由 seed 决定（不用 Math.random）：同一份 seed 每次渲染完全一致——录屏、截图对比、SSR 水合都需要这个可预期性。

**缓慢漂移，快速乱窜会抢焦点**

背景装饰的粒子应该「几乎静止地活着」：速度限制在每轴 ±0.4，越界后从对侧环绕（无缝循环）。

**连线的透明度用亮度模拟**

LineBasicMaterial 不支持逐顶点透明度，深底上用「颜色变暗 = 视觉变淡」模拟距离衰减——这是黑底渲染的惯用技巧。

**每帧成本有上界**

连线配对是 O(n²)：默认 120 粒子约 7000 次配对，单帧可控；`maxSegments` 截断保证粒子数误配大时也不会失控。DPR 上限 1.5——背景装饰不需要高分屏精度。
