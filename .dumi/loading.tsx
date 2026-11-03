import React from 'react';

/**
 * 文档站首屏 loading（dumi 会在页面挂载前渲染它）。
 *
 * 三个点：主题色渐变 + 背景流动 + 错峰脉冲；品牌字样用同款渐变裁字。
 * 约束：
 * - 纯 CSS 动画（此时 React/JS 动画库尚未加载完）；
 * - 跟随亮/暗主题（令牌优先，`prefers-color-scheme` 兜底）；
 * - `prefers-reduced-motion` 下静止，只保留可见的静态三点。
 */
const css = `
.aura-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 22px;
  min-height: 100vh;
  background: var(--aura-bg, #ffffff);
}

.aura-loader-dots {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.aura-loader-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 45%, #22d3ee 100%);
  background-size: 220% 220%;
  animation:
    aura-loader-flow 2.6s linear infinite,
    aura-loader-pulse 1.2s ease-in-out infinite;
}

.aura-loader-dot:nth-child(1) {
  animation-delay: 0s, 0s;
}
.aura-loader-dot:nth-child(2) {
  animation-delay: 0.18s, 0.16s;
}
.aura-loader-dot:nth-child(3) {
  animation-delay: 0.36s, 0.32s;
}

@keyframes aura-loader-flow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 220% 50%;
  }
}

@keyframes aura-loader-pulse {
  0%,
  100% {
    transform: scale(0.7);
    opacity: 0.4;
  }
  50% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 14px rgba(124, 58, 237, 0.45);
  }
}

.aura-loader-brand {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  background: linear-gradient(90deg, #7c3aed, #a855f7, #22d3ee, #7c3aed);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: aura-loader-brand 3.2s linear infinite;
}

@keyframes aura-loader-brand {
  to {
    background-position: 300% 0;
  }
}

@media (prefers-color-scheme: dark) {
  .aura-loader {
    background: var(--aura-bg, #0b0d12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .aura-loader-dot,
  .aura-loader-brand {
    animation: none;
  }
  .aura-loader-dot {
    transform: none;
    opacity: 1;
    box-shadow: none;
  }
}
`;

const Loading: React.FC = () => (
  <div className="aura-loader">
    <style>{css}</style>
    <div className="aura-loader-dots" aria-label="加载中" role="status">
      <span className="aura-loader-dot" />
      <span className="aura-loader-dot" />
      <span className="aura-loader-dot" />
    </div>
    <span className="aura-loader-brand">Aura</span>
  </div>
);

export default Loading;
