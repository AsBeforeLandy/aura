---
title: TiltCard
subtitle: 3D 倾斜卡片
group:
  title: 动效
  order: 29
order: 29
category: Components
demo:
  cols: 1
toc: content
---

指针驱动的 3D 倾斜：rotateX / rotateY 弹簧跟随指针位置，可选跟随指针的
光泽层。只动画 transform 与 opacity。触屏（无指针事件）与 reduced-motion
下退化为静态卡片。

<code src="./demo/basic.tsx">悬停体验</code>

## API

| 属性         | 说明                   | 类型        | 默认值 |
| ------------ | ---------------------- | ----------- | ------ |
| children     | 卡片内容               | `ReactNode` | -      |
| maxTilt      | 最大倾斜角度（度）     | `number`    | `8`    |
| scale        | 悬停放大比例           | `number`    | `1.02` |
| glare        | 是否显示跟随指针的光泽 | `boolean`   | `true` |
| glareOpacity | 光泽强度 0~1           | `number`    | `0.22` |
