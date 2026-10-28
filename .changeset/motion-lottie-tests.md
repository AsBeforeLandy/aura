---
'@aura-react-comp/motion': patch
---

- 补齐 `LottiePlayer` 测试（5 条）：role=img 容器与尺寸、loadAnimation 参数透传、
  reduced-motion 下 loop/autoplay 强制关闭（单独文件规避引擎的模块级缓存）、
  卸载销毁实例、lottie-web 未安装时渲染占位不抛错；
- motion 测试总数 62 → **67**，30 个组件全部具备意图断言覆盖。
