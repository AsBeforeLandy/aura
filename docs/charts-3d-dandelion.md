---
toc: content
---

# DandelionField

三维蒲公英被风吹散的动态 3D 背景组件。由底端稳固扎根、中上段随风压悬臂柔弯的变径花茎、微点蜂窝花托、反卷绿总苞片、数百颗随风微颤蓄势起飞的 3D 冠毛小伞及电影感散景微尘组成，随主风场与三维湍流轻盈飘散并无缝循环，适合产品官网 Hero 首屏、登录页、AI 引导页与大屏氛围背景。

与 `ParticleField` 一致，`DandelionField` **自带画布**，无需外包 `Scene3D`，支持直接传入 `children` 作为叠加在背景之上的前景内容。

## 何时使用

- 需要比普通几何粒子更具自然诗意与记忆点的 3D 动态背景。
- 希望在 Hero 首屏或登录页上通过鼠标轻拂 / 点击阵风带来轻盈治愈的微交互体验。
- 需要 SSR 安全、支持 `prefers-reduced-motion` 且在 WebGL 不可用时静默降级的开箱即用背景层。

## 代码演示

<code src="./demo/chart-3d-dandelion.tsx" description="移动鼠标轻拂微风，点击画布或「吹起一阵风」掀起阵风吹散绒毛，支持多套背景氛围与风力实时切换。">蒲公英风散背景</code>

## API

### DandelionFieldProps

| 属性           | 说明                                         | 类型                       | 默认值                |
| -------------- | -------------------------------------------- | -------------------------- | --------------------- |
| count          | 蒲公英小伞数量（建议 `120~260`）             | `number`                   | `180`                 |
| windStrength   | 主风力强度（`0` 为静风停驻，`2+` 为强风）    | `number`                   | `1`                   |
| windDirection  | 风向三维向量                                 | `[number, number, number]` | `[0.88, 0.28, -0.38]` |
| turbulence     | 气流湍流强度（控制飘散路径波浪感）           | `number`                   | `1`                   |
| loop           | 绒毛飘出画布后是否在花托无缝循环再生         | `boolean`                  | `true`                |
| seedColor      | 冠毛羽丝与光尘主色                           | `string`                   | `'#f8fafc'`           |
| accentColor    | 瘦果与柔光点缀色                             | `string`                   | 主题主色              |
| stemColor      | 花茎与花托颜色                               | `string`                   | `'#4b6b5c'`           |
| interactive    | 是否开启鼠标轻拂微风与点击阵风交互           | `boolean`                  | `true`                |
| gustSignal     | 声明式阵风触发信号，每次递增掀起一阵强风     | `number`                   | `0`                   |
| regatherSignal | 声明式重聚信号，每次递增使全部绒毛重聚成绒球 | `number`                   | `0`                   |
| height         | 容器高度（px）                               | `number`                   | `420`                 |
| className      | 自定义类名                                   | `string`                   | -                     |
| style          | 自定义样式（推荐配合深空/暮色/晨雾渐变背景） | `React.CSSProperties`      | -                     |
| children       | 叠加于 3D 背景之上的前景内容                 | `React.ReactNode`          | -                     |

### 纯函数

| 函数                       | 用途                                               |
| -------------------------- | -------------------------------------------------- |
| `initDandelion`            | 确定性初始化蒲公英绒球与首屏飘散状态               |
| `advanceDandelion`         | 推进风场、悬臂柔弯、湍流、自转、边缘渐隐与循环再生 |
| `computeStemFlex`          | 计算根部固定、中上段顺风微倾的悬臂梁弹性偏移与倾角 |
| `triggerWindGust`          | 掀起一阵强风脉冲，按迎风度批量吹散附着绒毛         |
| `regatherDandelion`        | 将全部飘散绒毛重新凝聚回花托                       |
| `buildStemCurvePoints`     | 生成柔韧弧形花茎的 3D 二次贝塞尔采样点             |
| `buildPappusLinePositions` | 构造单颗小伞的细柄与放射状冠毛羽丝线段坐标         |

## 性能与无障碍

- 全部 200 颗 3D 冠毛小伞与背景微光尘合并在 4 次 draw call 内完成渲染，核心物理状态全部使用 `Float32Array` 原地更新，零每帧对象分配。
- 系统开启 `prefers-reduced-motion: reduce` 时，自动停在首屏唯美的「半吹散瞬间」静态画面。
- 3D 装饰画布自带 `aria-hidden`，不干扰屏幕阅读器读取前景 `children` 内容；WebGL 不可用时静默降级为 CSS 柔光微尘氛围。
