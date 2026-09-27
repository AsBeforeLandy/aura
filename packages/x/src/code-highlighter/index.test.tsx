import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeHighlighter } from './index';

const CODE = "const answer = 42;\nconsole.log(answer);";

const writeText = vi.fn<[string], Promise<void>>();

beforeEach(() => {
  writeText.mockReset();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: undefined,
    configurable: true,
    writable: true,
  });
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('CodeHighlighter', () => {
  it('正常：按语言着色并输出 language 类名', () => {
    const { container } = render(
      <CodeHighlighter lang="ts">{CODE}</CodeHighlighter>,
    );

    const pre = container.querySelector('pre');
    expect(pre?.className).toContain('language-ts');
    // 行容器为 block 的 span（<pre> 里不能塞 div）
    const lines = container.querySelectorAll('.aura-x-code-highlighter-line');
    expect(lines).toHaveLength(2);
    expect(lines[0].tagName).toBe('SPAN');
    expect(pre?.textContent).toContain('const answer = 42;');
  });

  it('正常：默认头部展示语言名与复制按钮', () => {
    render(<CodeHighlighter lang="tsx">{CODE}</CodeHighlighter>);

    expect(screen.getByText('tsx')).toBeDefined();
    expect(screen.getByRole('button', { name: '复制代码' })).toBeDefined();
  });

  it('正常：点击复制写入剪贴板并进入成功态，延时后复原', async () => {
    vi.useFakeTimers();
    const onCopy = vi.fn();
    render(
      <CodeHighlighter lang="ts" onCopy={onCopy}>
        {CODE}
      </CodeHighlighter>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '复制代码' }));
    });

    expect(writeText).toHaveBeenCalledWith(CODE);
    expect(onCopy).toHaveBeenCalledWith(CODE);
    expect(screen.getByText('已复制')).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByText('已复制')).toBeNull();
    expect(screen.getByText('复制')).toBeDefined();
  });

  it('边界：lang 缺省为 text', () => {
    render(<CodeHighlighter>{CODE}</CodeHighlighter>);
    expect(screen.getByText('text')).toBeDefined();
  });

  it('边界：header=false 不渲染头部', () => {
    const { container } = render(
      <CodeHighlighter lang="ts" header={false}>
        {CODE}
      </CodeHighlighter>,
    );

    expect(container.querySelector('.aura-x-code-highlighter-header')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText('ts')).toBeNull();
  });

  it('边界：header 函数返回 false 时不渲染，返回节点时渲染该节点', () => {
    const { container: none } = render(
      <CodeHighlighter lang="ts" header={() => false}>
        {CODE}
      </CodeHighlighter>,
    );
    expect(none.querySelector('.aura-x-code-highlighter-header')).toBeNull();

    render(
      <CodeHighlighter lang="ts" header={({ lang, code }) => (
        <span>{`${lang}/${code.length}`}</span>
      )}>
        {CODE}
      </CodeHighlighter>,
    );
    expect(screen.getByText(`ts/${CODE.length}`)).toBeDefined();
  });

  it('异常：未内置的语言不报错，回退为纯文本渲染', () => {
    const { container } = render(
      <CodeHighlighter lang="not-a-real-lang">{CODE}</CodeHighlighter>,
    );

    expect(container.querySelector('pre')?.className).toContain(
      'language-not-a-real-lang',
    );
    expect(container.querySelector('pre')?.textContent).toContain(
      'const answer = 42;',
    );
  });

  it('异常：Clipboard API 不可用时回退到 execCommand', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const execCommand = vi.fn(() => true);
    (document as Document & { execCommand: typeof execCommand }).execCommand =
      execCommand;

    const onCopy = vi.fn();
    render(
      <CodeHighlighter lang="ts" onCopy={onCopy}>
        {CODE}
      </CodeHighlighter>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '复制代码' }));
    });

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(onCopy).toHaveBeenCalledWith(CODE);
    // 临时 textarea 必须被清理
    expect(document.querySelectorAll('textarea')).toHaveLength(0);
  });

  it('异常：复制失败时不崩溃，也不进入成功态', async () => {
    writeText.mockRejectedValue(new Error('denied by permissions policy'));
    const onCopy = vi.fn();
    render(
      <CodeHighlighter lang="ts" onCopy={onCopy}>
        {CODE}
      </CodeHighlighter>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '复制代码' }));
    });

    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.queryByText('已复制')).toBeNull();
    expect(screen.getByRole('button', { name: '复制代码' })).toBeDefined();
  });

  it('异常：ref 暴露根节点', () => {
    const ref = React.createRef<import('./index').CodeHighlighterRef>();
    const { container } = render(
      <CodeHighlighter ref={ref} lang="ts">
        {CODE}
      </CodeHighlighter>,
    );

    expect(ref.current?.nativeElement).toBe(container.firstElementChild);
  });

  it('a11y：常规用法无 axe 违规', async () => {
    const { container } = render(
      <CodeHighlighter lang="ts">{CODE}</CodeHighlighter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
