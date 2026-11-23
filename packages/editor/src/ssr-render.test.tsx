// @vitest-environment node
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Editor } from './editor/index';

/**
 * SSR 渲染回归：在无 DOM 的真实 Node 环境用 renderToString 渲染。
 * Editor 内部已设置 immediatelyRender: false（见 docs/editor.md），
 * Tiptap 实例在服务端不创建，应输出占位 DOM 且不抛错。
 * 所有 props 均有默认值，这里只需给 defaultValue 即可稳定渲染。
 */

describe('Editor SSR 渲染', () => {
  it('最小 props 服务端渲染不抛错', () => {
    const html = renderToString(<Editor defaultValue="<p>初始内容</p>" />);

    expect(typeof html).toBe('string');
    expect(html).not.toBe('');
  });
});
