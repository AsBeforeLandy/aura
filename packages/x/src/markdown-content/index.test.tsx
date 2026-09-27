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

  it('正常：围栏代码块默认交给 CodeHighlighter 渲染（不再输出裸 pre）', () => {
    const { container } = render(
      <MarkdownContent>{'```js\nconsole.log(1);\n```'}</MarkdownContent>,
    );

    // 直接挂在 markdown 根下，说明中间那层 <pre> 已被替换，不存在 pre > div 的非法嵌套
    const highlighter = container.querySelector(
      '.aura-x-markdown > .aura-x-code-highlighter',
    );
    expect(highlighter).not.toBeNull();
    expect(highlighter?.textContent).toContain('console.log');
    // 语言标识进入 Prism 的类名与头部
    expect(container.querySelector('.language-js')).not.toBeNull();
    expect(screen.getByText('js')).toBeDefined();
  });

  it('正常：行内代码不受影响，仍是朴素 code', () => {
    const { container } = render(
      <MarkdownContent>{'段落中的 `inline()` 代码'}</MarkdownContent>,
    );

    const code = container.querySelector('p > code');
    expect(code?.textContent).toBe('inline()');
    expect(container.querySelector('.aura-x-code-highlighter')).toBeNull();
  });

  it('边界：highlightCode=false 回到朴素的 pre > code', () => {
    const { container } = render(
      <MarkdownContent highlightCode={false}>
        {'```js\nconsole.log(1);\n```'}
      </MarkdownContent>,
    );

    expect(container.querySelector('.aura-x-code-highlighter')).toBeNull();
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.querySelector('code')?.textContent).toContain('console.log');
  });

  it('边界：无语言标识的围栏块按 text 语言渲染', () => {
    const { container } = render(
      <MarkdownContent>{'```\nplain text\n```'}</MarkdownContent>,
    );

    expect(container.querySelector('.aura-x-code-highlighter')).not.toBeNull();
    expect(container.querySelector('.language-text')).not.toBeNull();
  });

  it('边界：renderCode 优先级高于 highlightCode', () => {
    const { container } = render(
      <MarkdownContent
        renderCode={({ lang, code }) => (
          <figure data-lang={lang} data-code={code} />
        )}
      >
        {'```tsx\nconst a = 1;\n```'}
      </MarkdownContent>,
    );

    const figure = container.querySelector('figure');
    expect(figure?.getAttribute('data-lang')).toBe('tsx');
    expect(figure?.getAttribute('data-code')).toBe('const a = 1;');
    expect(container.querySelector('.aura-x-code-highlighter')).toBeNull();
  });

  it('边界：尾随换行被去掉，单行代码不会多出空白行', () => {
    const { container } = render(
      <MarkdownContent>{'```js\nconst a = 1;\n```'}</MarkdownContent>,
    );

    const lines = container.querySelectorAll('.aura-x-code-highlighter-line');
    expect(lines).toHaveLength(1);
    expect(lines[0].textContent).toBe('const a = 1;');
  });

  it('安全：高亮后的代码块内 HTML 仍按文本渲染，不产生元素', () => {
    const { container } = render(
      <MarkdownContent>{'```html\n<img src=x onerror=alert(1)>\n```'}</MarkdownContent>,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img');
  });

  it('a11y：常规内容无 axe 违规', async () => {
    const { container } = render(
      <MarkdownContent>{'## 标题\n\n- 项目一\n- 项目二'}</MarkdownContent>,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
