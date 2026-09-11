import { vi, afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';

/**
 * 注册 jest-axe 的 `toHaveNoViolations` 断言。
 * jest-axe 基于 jest 的 expect.extend 接口实现，vitest 兼容该接口。
 *
 * 注意：jsdom 不进行真实布局与样式计算，因此 axe 的 color-contrast
 * 规则在此环境下不生效，能覆盖的是语义层面（label / role / aria / 标题层级等）。
 */
expect.extend(toHaveNoViolations);

/**
 * 每个用例结束后卸载 render 挂载的 DOM。
 * RTL 的自动 cleanup 在本项目的 vitest 版本组合下未生效，
 * 不显式注册会导致「Found multiple elements」式泄漏（文本冲突误伤）。
 */
afterEach(() => {
  cleanup();
});

/**
 * antd 在 jsdom 环境下依赖若干浏览器 API，集中在此处补齐。
 * 仅影响测试环境，不改变运行时行为。
 */

// matchMedia —— 响应式断点相关组件依赖
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

// ResizeObserver —— Table / Select 等组件依赖
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  class ResizeObserverMock {
    observe() {
      /* noop */
    }
    unobserve() {
      /* noop */
    }
    disconnect() {
      /* noop */
    }
  }
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  });
}

// getComputedStyle 对伪元素（如 ::-webkit-scrollbar）在 jsdom 中未实现，
// antd Table 测量滚动条宽度时会触发噪音报错。忽略伪元素参数即可。
if (typeof window !== 'undefined') {
  const originalGetComputedStyle = window.getComputedStyle.bind(window);
  window.getComputedStyle = ((elt: Element) =>
    originalGetComputedStyle(elt)) as typeof window.getComputedStyle;
}
