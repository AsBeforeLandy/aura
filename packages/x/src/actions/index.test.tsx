import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Actions } from './index';

const items = [
  { key: 'copy', label: '复制', onClick: () => {} },
  { key: 'like', label: '点赞', active: true, onClick: () => {} },
  { key: 'del', label: '删除', danger: true, onClick: () => {} },
  { key: 'off', label: '禁用', disabled: true },
];

describe('Actions', () => {
  it('正常：渲染按钮组并透传 onClick / active / danger', () => {
    const { container } = render(<Actions items={items} ariaLabel="消息操作" />);

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(4);
    expect(buttons[1].className).toContain('aura-x-actions-item--active');
    expect(buttons[2].className).toContain('aura-x-actions-item--danger');
    expect(buttons[3].disabled).toBe(true);
    expect(screen.getByText('复制')).toBeDefined();
  });

  it('正常：点击回调触发', () => {
    const onClick = vi.fn();
    render(<Actions items={[{ key: 'a', label: '重新生成', onClick }]} />);

    fireEvent.click(screen.getByText('重新生成'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('边界：disabled 项不触发 onClick', () => {
    const onClick = vi.fn();
    render(<Actions items={[{ key: 'a', label: '禁用', disabled: true, onClick }]} />);

    fireEvent.click(screen.getByText('禁用'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('a11y：role=toolbar 且带可访问名称时无 axe 违规', async () => {
    const { container } = render(<Actions items={items} ariaLabel="消息操作" />);
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
