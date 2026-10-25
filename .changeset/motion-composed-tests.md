---
'@aura-react-comp/motion': patch
---

- **修复**：`Timeline` 在无 `IntersectionObserver` 的环境（jsdom、老旧浏览器、
  SSR 水合前）直接抛 ReferenceError（并导致内容停在 opacity 0）——现降级为
  立即播放；
- 补齐 composed 组件的意图断言测试（新增 19 条）：Draggable / ReorderGroup /
  Cursor / FlipList / Timeline / PageTransition / ViewTransition / ScrollDriven /
  Parallax / PathDraw / Confetti / Aurora；
- composed 覆盖率：语句 46.46% → **79.61%**，函数 8.33% → **55.17%**。
