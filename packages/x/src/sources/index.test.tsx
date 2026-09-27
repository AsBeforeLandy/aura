import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Sources } from './index';
import type { SourcesItem } from './index';

const items: SourcesItem[] = [
  { key: 'a', title: '文档 A', url: 'https://example.com/a', description: '说明 A' },
  { key: 'b', title: '文档 B' },
];

describe('Sources', () => {
  it('正常：渲染头部摘要与有序列表，序号徽标从 1 开始', () => {
    const { container } = render(<Sources items={items} />);

    expect(
      screen.getByRole('button', { name: '已引用 2 个来源' }),
    ).toBeDefined();
    expect(container.querySelector('.aura-x-sources-list')?.tagName).toBe('OL');
    expect(
      container.querySelectorAll('.aura-x-sources-item-index'),
    ).toHaveLength(2);
    expect(
      container.querySelector('.aura-x-sources-item-index')?.textContent,
    ).toBe('1');
    expect(screen.getByText('文档 A')).toBeDefined();
    expect(screen.getByText('说明 A')).toBeDefined();
  });

  it('正常：有 url 的项渲染为外链并带 noreferrer', () => {
    render(<Sources items={items} />);

    const link = screen.getByRole('link', { name: '文档 A' });
    expect(link.getAttribute('href')).toBe('https://example.com/a');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer');
  });

  it('正常：点击头部折叠、再点击展开，onExpand 收到对应值', () => {
    const onExpand = vi.fn();
    const { container } = render(<Sources items={items} onExpand={onExpand} />);

    fireEvent.click(screen.getByRole('button', { name: '已引用 2 个来源' }));
    expect(onExpand).toHaveBeenLastCalledWith(false);
    expect(container.querySelector('.aura-x-sources-list')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '已引用 2 个来源' }));
    expect(onExpand).toHaveBeenLastCalledWith(true);
    expect(container.querySelector('.aura-x-sources-list')).not.toBeNull();
  });

  it('正常：点击来源回传该项', () => {
    const onClick = vi.fn();
    render(<Sources items={items} onClick={onClick} />);

    fireEvent.click(screen.getByRole('link', { name: '文档 A' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0]).toBe(items[0]);
  });

  it('边界：空列表渲染 null', () => {
    const { container } = render(<Sources items={[]} />);
    expect(container.firstElementChild).toBeNull();
  });

  it('边界：defaultExpanded=false 时不渲染列表', () => {
    const { container } = render(<Sources items={items} defaultExpanded={false} />);
    expect(container.querySelector('.aura-x-sources-list')).toBeNull();
  });

  it('边界：受控 expanded 不随点击变化，但 onExpand 仍回调', () => {
    const onExpand = vi.fn();
    const { container } = render(
      <Sources items={items} expanded={false} onExpand={onExpand} />,
    );

    fireEvent.click(screen.getByRole('button', { name: '已引用 2 个来源' }));
    expect(onExpand).toHaveBeenCalledWith(true);
    expect(container.querySelector('.aura-x-sources-list')).toBeNull();
  });

  it('边界：expandIconPosition=end 添加修饰类，自定义 title 覆盖默认文案', () => {
    const { container } = render(
      <Sources items={items} title="参考资料" expandIconPosition="end" />,
    );

    expect(
      container.querySelector('.aura-x-sources-header--end'),
    ).not.toBeNull();
    expect(screen.getByRole('button', { name: '参考资料' })).toBeDefined();
  });

  it('边界：无 url 但传 onClick 时渲染为按钮', () => {
    const onClick = vi.fn();
    render(<Sources items={items} onClick={onClick} />);

    const btn = screen.getByRole('button', { name: '文档 B' });
    fireEvent.click(btn);
    expect(onClick.mock.calls[0][0]).toBe(items[1]);
  });

  it('异常：无 url 且无 onClick 时渲染为纯文本，不产生可点击元素', () => {
    render(<Sources items={[{ key: 'x', title: '只读来源' }]} />);

    expect(screen.queryByRole('link', { name: '只读来源' })).toBeNull();
    expect(screen.queryByRole('button', { name: '只读来源' })).toBeNull();
    expect(screen.getByText('只读来源')).toBeDefined();
  });

  it('异常：行内模式默认无浮层，悬停后出现、移出后消失', () => {
    const { container } = render(<Sources inline items={items} />);

    expect(screen.queryByRole('tooltip')).toBeNull();

    const wrap = container.querySelector('.aura-x-sources-inline-wrap')!;
    fireEvent.mouseEnter(wrap);
    const tip = screen.getByRole('tooltip');
    expect(tip.textContent).toContain('文档 A');
    expect(tip.textContent).toContain('说明 A');
    expect(tip.textContent).toContain('https://example.com/a');

    fireEvent.mouseLeave(wrap);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('异常：行内模式 activeKey 受控时强制显示对应浮层', () => {
    render(<Sources inline items={items} activeKey="b" />);

    const tip = screen.getByRole('tooltip');
    expect(tip.textContent).toContain('文档 B');
    expect(tip.textContent).not.toContain('说明 A');
  });

  it('异常：行内模式按 Escape 关闭浮层', () => {
    const { container } = render(<Sources inline items={items} />);

    const wrap = container.querySelector('.aura-x-sources-inline-wrap')!;
    fireEvent.mouseEnter(wrap);
    expect(screen.queryByRole('tooltip')).not.toBeNull();

    fireEvent.keyDown(screen.getByRole('button', { name: '1' }), {
      key: 'Escape',
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('a11y：常规用法无 axe 违规', async () => {
    const { container } = render(<Sources items={items} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
