---
toc: content
---

# Scene3D

画布容器，收敛了所有 3D 渲染的基础设施：容器自适应（ResizeObserver）、DPR 上限（≤2 防止高分屏过载）、相机与三点光照预设、视角控制、WebGL 降级。

## 代码演示

<code src="./demo/chart-3d-inspection.tsx" description="巡检模式：低角度自动环绕（inspection 预设），无需操作即可持续展示三维结构；柱体错峰生长入场。">视角预设</code>

## API

| 属性            | 说明                     | 类型                                            | 默认值      |
| --------------- | ------------------------ | ----------------------------------------------- | ----------- |
| height          | 画布高度                 | `number`                                        | `360`       |
| preset          | 视角预设（场景模板）     | `'default' \| 'inspection' \| 'top' \| 'front'` | `'default'` |
| cameraPosition  | 相机位置（覆盖预设）     | `[number, number, number]`                      | 取预设      |
| autoRotate      | 自动旋转（覆盖预设）     | `boolean`                                       | 取预设      |
| autoRotateSpeed | 自动旋转速度（覆盖预设） | `number`                                        | 取预设      |
| enableRotate    | 允许拖转 / 缩放视角      | `boolean`                                       | `true`      |

SSR 安全：未测量到容器尺寸前不会创建 WebGL 上下文，服务端渲染只输出占位容器。

## 视角预设（巡检模式）

大屏与汇报场景里，3D 图表最常见的用法是「不需要用户操作，自己转给人看」。`preset` 提供 4 种视角模板：

| 预设         | 相机       | 行为                               |
| ------------ | ---------- | ---------------------------------- |
| `default`    | 斜视角     | 静态，适合交互分析                 |
| `inspection` | 低角度环绕 | **自动旋转**，转速更快，巡检展示态 |
| `top`        | 正俯视     | 看平面分布，避免透视遮挡           |
| `front`      | 正视图     | 当「图表」用，接近 2D 阅读习惯     |

所有预设统一把 maxPolarAngle 限制在 π/2.05——不允许钻到地面以下，那会让柱底朝上、文字镜像。显式传 `cameraPosition` / `autoRotate` / `autoRotateSpeed` 可覆盖预设的单项配置。

## WebGL 降级

WebGL 上下文创建失败是运行时常态而非异常态：浏览器对同时存在的上下文有数量上限（超出后新的创建会抛错）、驱动禁用、headless 环境无软渲染兜底等都会命中。

Scene3D 内置错误边界：场景创建失败时**降级为占位说明**，异常不会冒泡——嵌入页面的 3D 卡崩了不能拖垮整块大屏。
