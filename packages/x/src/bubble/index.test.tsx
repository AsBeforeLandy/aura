import { render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Bubble } from './index';

describe('Bubble', () => {
  it('正常：渲染纯文本内容与角色方向', () => {
    const { container } = render(<Bubble role="user" content="你好" />);

    expect(screen.getByText('你好')).toBeDefined();
    expect(container.querySelector('.aura-x-bubble--end')).not.toBeNull();
  });

  it('正常：assistant 角色渲染在左侧，变体类名生效', () => {
    const { container } = render(<Bubble role="assistant" content="hi" variant="outlined" />);

    expect(container.querySelector('.aura-x-bubble--start')).not.toBeNull();
    expect(container.querySelector('.aura-x-bubble--outlined')).not.toBeNull();
  });

  it('正常：contentRender 自定义渲染接管内容', () => {
    render(
      <Bubble role="assistant" content="**加粗**" contentRender={(c) => <b>{c}</b>} />,
    );

    expect(screen.getByText('**加粗**').tagName).toBe('B');
  });

  it('边界：loading 时渲染三点动画且 aria-busy 生效', () => {
    const { container } = render(<Bubble content="" loading />);

    expect(container.querySelector('.aura-x-bubble-dots')).not.toBeNull();
    expect(container.querySelector('.aura-x-bubble')?.getAttribute('aria-busy')).toBe(
      'true',
    );
  });

  it('边界：avatar / header / footer 三个插槽按序渲染', () => {
    render(
      <Bubble
        content="hi"
        avatar={<span data-testid="avatar" />}
        header={<span data-testid="header" />}
        footer={<span data-testid="footer" />}
      />,
    );

    expect(screen.getByTestId('avatar')).toBeDefined();
    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('footer')).toBeDefined();
  });

  it('正常：Bubble.List 渲染多条并可 autoScroll（滚动到底）', async () => {
    const { container, rerender } = render(
      <Bubble.List
        items={[
          { key: 'a', role: 'user', content: '第一问' },
          { key: 'b', role: 'assistant', content: '第一答' },
        ]}
        style={{ height: 80 }}
      />,
    );

    expect(container.querySelectorAll('.aura-x-bubble')).toHaveLength(2);

    // 追加一条消息后容器应自动滚动到底部
    rerender(
      <Bubble.List
        items={[
          { key: 'a', role: 'user', content: '第一问' },
          { key: 'b', role: 'assistant', content: '第一答' },
          { key: 'c', role: 'user', content: '第二问' },
        ]}
        style={{ height: 80 }}
      />,
    );

    const list = container.querySelector('.aura-x-bubble-list') as HTMLElement;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(list.scrollTop).toBe(list.scrollHeight);
  });

  it('边界：autoScroll=false 时不滚动', async () => {
    const { container, rerender } = render(
      <Bubble.List
        items={[{ key: 'a', role: 'user', content: '第一问' }]}
        autoScroll={false}
        style={{ height: 40 }}
      />,
    );

    rerender(
      <Bubble.List
        items={[
          { key: 'a', role: 'user', content: '第一问' },
          { key: 'b', role: 'assistant', content: '第一答' },
          { key: 'c', role: 'user', content: '第二问' },
          { key: 'd', role: 'assistant', content: '第二答' },
        ]}
        autoScroll={false}
        style={{ height: 40 }}
      />,
    );

    const list = container.querySelector('.aura-x-bubble-list') as HTMLElement;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(list.scrollTop).toBe(0);
  });

  it('a11y：常规用法无 axe 违规', async () => {
    const { container } = render(
      <Bubble
        role="assistant"
        content="你好"
        avatar={<span data-testid="a" />}
      />,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
