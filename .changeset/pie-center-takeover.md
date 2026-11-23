---
'@aura-react-comp/charts': patch
---

fix: PieChart 传 centerContent 时不再叠加内置中心文本——环图内置「总计」文本由调用方完全接管中心区域，与 RingProgress 的 children 接管语义对齐。
