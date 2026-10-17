---
'@aura-react-comp/motion': patch
---

继续精修两组件：

- **SkeletonShimmer**：光带改 55% 宽度的柔和渐变（原全宽扫掠生硬），
  新增 `index` 支持相邻骨架块错峰出光（0.12s/位）；
- **PageTransition**：改为「快退慢进」节奏——退场 0.6 倍时长 + accelerate，
  进场交给内层 decelerate 慢进，外层不再重复进场动画。
