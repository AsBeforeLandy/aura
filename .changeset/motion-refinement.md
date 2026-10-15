---
'@aura-react-comp/motion': patch
---

五组件动效精修（全部向后兼容，新增可选 props）：

- **Reveal** 新增 `variant`：`blur`（8px→0 对焦揭示）/ `mask`（overflow 遮罩升起）/
  `scale`（0.96 卡片揭示），错峰改递增步进（0.08+0.04i 累加）；
- **SplitText** 新增 `variant`：`rise`（逐字遮罩升起）/ `flip`（rotateX 翻牌+透视），
  默认 stagger 0.04→0.03；
- **NumberTicker** 重写为逐位独立弹簧：位间错峰 40ms、千分位静态占位、
  容器 tabular-nums 消除数字宽度抖动，新增 `stagger`/`fromZero`；
- **Confetti** 物理精修：纸条形态（1:2.6 + scaleY 正弦翻面）、上抛扇形初速、
  空气阻力 0.985、翻转速度与下落耦合、末段飘摆；
- **Aurora** 质感精修：色块 480px/blur 120/透明度 0.32、椭圆形态 60s 慢自转、
  三色块互质轨道周期（14s/17s/21s）避免同步循环感。
