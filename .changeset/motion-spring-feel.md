---
'@aura-react-comp/motion': patch
---

**手感对齐 Motion 的生产级动画：弹簧优先**

- **`Slide` / `Fade` / `Zoom` 默认改用弹簧物理**（`motionSprings.spring` = stiffness 320 /
  damping 30），位移与缩放不再匀速滑过，而是有质量感的"快进慢停"。新增 `spring`
  开关（默认 `true`），需要严格时序时设 `false` 退回 `duration + ease`。
  `Collapse` 刻意不接弹簧：高度带超调会"先冲过再回落"，观感是抖动。
- **`FlipList` 改用分层过渡（per-value transition）**：位置重排走弹簧（跟手、无拖影），
  进出场的透明度/位移/缩放仍走时长——这是 Motion 官方推荐的做法，之前统一用
  duration 会让重排显得"飘"。
- **`TiltCard` 弹簧 220/24 → 300/30**：更跟手，指针离开后回正更干脆。
- **`Draggable` 显式惯性参数**：`dragElastic={0.5}`（拖出边界的橡皮筋，Motion 默认值）
  与 `dragTransition={{ power: 0.3, timeConstant: 700 }}`（松手滑行），手感可预期。
- `TextShimmer` 一轮流光 2.2s → **1.8s**（更轻快）；`TypingDots` 循环 1.1s → **1.2s**
  （与 0.16s 错峰配合，节奏更接近 AI 思考态）。
- 文档补充「弹簧优先」的设计说明与 `spring` 参数。
