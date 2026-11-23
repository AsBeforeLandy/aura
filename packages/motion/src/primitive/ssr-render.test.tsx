// @vitest-environment node
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Reveal } from '../index';

/**
 * SSR 渲染回归：在无 DOM 的真实 Node 环境用 renderToString 渲染。
 * Reveal 的可见性触发依赖 IntersectionObserver / 浏览器 API，均在
 * effect 中执行（服务端不跑 effect），渲染期不应访问 document / window。
 * 服务端输出可以是占位内容，只要 renderToString 正常返回即可。
 */

describe('Reveal SSR 渲染', () => {
  it('最小 props 服务端渲染不抛错', () => {
    const html = renderToString(
      <Reveal>
        <div>揭示内容</div>
      </Reveal>,
    );

    expect(typeof html).toBe('string');
  });
});
