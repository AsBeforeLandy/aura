---
'@aura-react-comp/motion': patch
---

- 补齐 primitive 剩余组件测试（新增 12 条）：Reveal（四 variant）、InViewport、
  Magnetic、SkeletonShimmer、FocusRing（焦点环出现/消失）、LayoutGroup；
- `tests/setup.ts` 新增 IntersectionObserver polyfill（observe 即进入视口），
  使 whileInView 类组件（Reveal / InViewport / motion 引擎）在 jsdom 中可测；
- motion 测试总数 50 → **62**，全仓回归 1023 条通过。
