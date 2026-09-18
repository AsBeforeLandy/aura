import { render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { MarkdownContent } from './index';

describe('MarkdownContent', () => {
  it('正常：渲染标题、列表、粗体与行内代码', () => {
    const { container } = render(
      <MarkdownContent>{'# 标题\n\n- 列表项 **粗体** 与 `code`'}</MarkdownContent>,
    );

    expect(container.querySelector('h1')?.textContent).toBe('标题');
    expect(container.querySelector('li')).not.toBeNull();
    expect(container.querySelector('strong')?.textContent).toBe('粗体');
    expect(container.querySelector('code')?.textContent).toBe('code');
  });

  it('安全：原始 HTML 不被渲染（按纯文本展示）', () => {
    render(
      <MarkdownContent>{'<img src=x onerror=alert(1)>'}</MarkdownContent>,
    );

    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText(/<img/)).toBeDefined();
  });

  it('安全：javascript: 协议的链接被清洗', () => {
    const { container } = render(
      <MarkdownContent>{'[点我](javascript:alert(1))'}</MarkdownContent>,
    );

    const anchor = container.querySelector('a') as HTMLAnchorElement;
    expect(anchor).not.toBeNull();
    expect(anchor.getAttribute('href') ?? '').not.toContain('javascript:');
  });

  it('正常：外链带 target=_blank 与 noreferrer', () => {
    const { container } = render(
      <MarkdownContent>{'[官网](https://aura.dev)'}</MarkdownContent>,
    );

    const anchor = container.querySelector('a') as HTMLAnchorElement;
    expect(anchor.getAttribute('href')).toBe('https://aura.dev');
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toContain('noreferrer');
  });

  it('正常：代码块渲染为 pre > code，纯展示', () => {
    const { container } = render(
      <MarkdownContent>{'```js\nconsole.log(1);\n```'}</MarkdownContent>,
    );

    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.querySelector('code')?.textContent).toContain('console.log');
  });

  it('a11y：常规内容无 axe 违规', async () => {
    const { container } = render(
      <MarkdownContent>{'## 标题\n\n- 项目一\n- 项目二'}</MarkdownContent>,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
