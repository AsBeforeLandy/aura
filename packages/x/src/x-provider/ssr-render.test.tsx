// @vitest-environment node
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { XProvider } from './index';
import { ThoughtChain } from '../thought-chain/index';
import type { ThoughtChainItem } from '../thought-chain/index';

/**
 * SSR 渲染回归：在无 DOM 的真实 Node 环境用 renderToString 渲染。
 * XProvider 的运行时颜色读取（useRuntimeThemeColors → readRuntimeAuraColors）
 * 带浏览器 API 守卫与回退，服务端渲染不应抛错。
 */

const items: ThoughtChainItem[] = [
  { key: 'a', title: '检索知识库', status: 'success' },
  { key: 'b', title: '生成结论', status: 'success' },
];

describe('x 包 SSR 渲染', () => {
  it('XProvider 包裹 children 可服务端渲染', () => {
    const html = renderToString(
      <XProvider>
        <div>AI 内容</div>
      </XProvider>,
    );

    expect(html).not.toBe('');
    expect(html).toContain('AI 内容');
  });

  it('XProvider 包裹 ThoughtChain 可服务端渲染', () => {
    const html = renderToString(
      <XProvider>
        <ThoughtChain items={items} />
      </XProvider>,
    );

    expect(html).not.toBe('');
  });
});
