import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Conversations } from './index';

const items = [
  { key: 'c1', label: '周报助手', timestamp: '09-17' },
  { key: 'c2', label: '代码审查', timestamp: '09-16' },
];

describe('Conversations', () => {
  it('正常：渲染会话列表，点击回调 onActiveChange', () => {
    const onActiveChange = vi.fn();
    const { container } = render(
      <Conversations items={items} activeKey="c1" onActiveChange={onActiveChange} />,
    );

    expect(screen.getByText('周报助手')).toBeDefined();
    expect(container.querySelector('.aura-x-conversations-item--active')).not.toBeNull();

    fireEvent.click(screen.getByText('代码审查'));
    expect(onActiveChange).toHaveBeenCalledWith('c2');
  });

  it('正常：menu 配置渲染 … 触发按钮与操作项，点击回调并关闭', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Conversations
        items={items}
        menu={(item) => ({
          items: [
            { key: 'rename', label: '重命名' },
            { key: 'delete', label: '删除', danger: true },
          ],
          onClick: (_item, menuKey) => onClick(item, menuKey),
        })}
      />,
    );

    // 默认不展开
    expect(container.querySelector('.aura-x-conversations-menu')).toBeNull();

    // hover 才显示触发按钮：直接点第一个 …
    const trigger = container.querySelector(
      '.aura-x-conversations-menu-btn',
    ) as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(container.querySelector('.aura-x-conversations-menu')).not.toBeNull();

    fireEvent.click(screen.getByText('重命名'));
    expect(onClick).toHaveBeenCalledWith(items[0], 'rename');
    expect(container.querySelector('.aura-x-conversations-menu')).toBeNull();
  });

  it('边界：点击菜单外部关闭已展开菜单', () => {
    const { container } = render(
      <Conversations
        items={items}
        menu={() => ({ items: [{ key: 'delete', label: '删除' }], onClick: () => {} })}
      />,
    );

    fireEvent.click(container.querySelector('.aura-x-conversations-menu-btn')!);
    expect(container.querySelector('.aura-x-conversations-menu')).not.toBeNull();

    // 点击根容器（外部区域）关闭
    fireEvent.click(container.querySelector('.aura-x-conversations')!);
    expect(container.querySelector('.aura-x-conversations-menu')).toBeNull();
  });

  it('a11y：无 axe 违规', async () => {
    const { container } = render(
      <Conversations
        items={items}
        activeKey="c1"
        menu={() => ({ items: [{ key: 'delete', label: '删除' }], onClick: () => {} })}
      />,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
