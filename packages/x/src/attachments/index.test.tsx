import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Attachments } from './index';
import type { AttachmentItem } from './index';

const items: AttachmentItem[] = [
  { id: 1, name: 'a.pdf', size: 2048 },
  { id: 2, name: 'b.png', size: 4096, status: 'uploading', percent: 50 },
];

describe('Attachments', () => {
  it('正常：渲染 role=list 容器与 listitem，卡片透传属性', () => {
    render(<Attachments items={items} />);

    const list = screen.getByRole('list', { name: '附件列表' });
    expect(list).toBeDefined();
    expect(list.querySelectorAll('[role="listitem"]')).toHaveLength(2);
    expect(screen.getByText('a.pdf')).toBeDefined();
    expect(screen.getByText('2.0 KB')).toBeDefined();
    expect(
      screen.getByRole('progressbar', { name: 'b.png 上传进度' }),
    ).toBeDefined();
  });

  it('正常：onRemove 回传被移除项与其索引', () => {
    const onRemove = vi.fn();
    render(<Attachments items={items} onRemove={onRemove} />);

    fireEvent.click(screen.getByRole('button', { name: '移除 b.png' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove.mock.calls[0][0]).toBe(items[1]);
    expect(onRemove.mock.calls[0][1]).toBe(1);
  });

  it('边界：空列表且无 empty 时渲染 null', () => {
    const { container } = render(<Attachments items={[]} />);
    expect(container.firstElementChild).toBeNull();
  });

  it('边界：空列表有 empty 时渲染占位', () => {
    render(<Attachments items={[]} empty="拖拽文件到这里" />);
    expect(screen.getByText('拖拽文件到这里')).toBeDefined();
  });

  it('边界：overflow=scrollX 添加横滑类名', () => {
    const { container } = render(<Attachments items={items} overflow="scrollX" />);
    expect(container.firstElementChild?.className).toContain(
      'aura-x-attachments--scroll-x',
    );
  });

  it('边界：不传 onRemove 时不渲染移除按钮', () => {
    render(<Attachments items={items} />);
    expect(screen.queryByRole('button', { name: /移除/ })).toBeNull();
  });

  it('a11y：常规用法无 axe 违规', async () => {
    const { container } = render(<Attachments items={items} onRemove={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
