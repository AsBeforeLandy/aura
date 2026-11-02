---
'@aura-react-comp/motion': patch
---

**配色全面升级：新增颜色令牌层，组件不再硬编码色值**

- **新增 `--aura-motion-*` 颜色令牌**（`tokens.css`，亮/暗各一套）：`accent` /
  `accent-strong` / `accent-soft` / `accent-glow` / `cyan` / `blue` / `fuchsia` /
  `card-bg` / `skeleton` / `skeleton-highlight` / `shimmer` / `sheen` / `focus-color`。
  业务方覆盖变量即可整体换肤，暗色模式自动切换。
- **统一主色**：`GradientBorder` / `Cursor` / `FocusRing` / `ScrollDriven` 此前用的是
  旧灰紫 `#534ab7`，统一为品牌紫 `#7c3aed`（暗色 `#a855f7`）。
- **`Confetti` 默认色板换成霓虹系**（原为赭橙 `#ba7517` / 砖红 `#d85a30` 等旧 AntD 色板）；
  色板移到 JS 侧 `motionConfettiColors`（canvas 无法解析 CSS 变量）。
- **`Aurora` / `GradientBorder` 默认渐变**改为紫 → 青 → 品红霓虹序列。
- `SkeletonShimmer` / `TextShimmer` / `TiltCard` 的表面、高光、光泽改为令牌，
  亮暗主题下对比度都成立。
- 全部 30 个组件的文档 demo 同步换成新色板（旧色已全仓清零）。
- 文档新增「颜色令牌」表，说明覆盖方式与 `Confetti` 的例外。
