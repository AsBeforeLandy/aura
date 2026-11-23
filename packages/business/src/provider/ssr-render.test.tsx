// @vitest-environment node
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Button } from 'antd';
import { BusinessProvider } from './index';

/**
 * SSR 渲染回归：在无 DOM 的真实 Node 环境用 renderToString 渲染。
 * BusinessProvider 的主题派生（readRuntimeAuraColors / antd token 映射）
 * 带浏览器 API 守卫与回退，渲染期不应访问 document / window。
 */

describe('BusinessProvider SSR 渲染', () => {
  it('包裹 antd Button 可服务端渲染', () => {
    const html = renderToString(
      <BusinessProvider>
        <Button>业务按钮</Button>
      </BusinessProvider>,
    );

    expect(html).not.toBe('');
    expect(html).toContain('业务按钮');
  });
});
