import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { Dropdown } from './index';

const menuItems = [
  { key: 'edit', label: '编辑' },
  { key: 'copy', label: '复制' },
  { key: 'delete', label: '删除', danger: true },
  { key: 'disabled', label: '禁用项', disabled: true },
];

describe('Dropdown', () => {
  afterEach(() => cleanup());

  // 基础渲染
  it('should render children', () => {
    const { getByText } = render(
      <Dropdown menu={menuItems}>
        <button>更多</button>
      </Dropdown>,
    );
    expect(getByText('更多')).toBeDefined();
  });

  // 初始状态不显示菜单
  it('should not show menu initially', () => {
    const { queryByText } = render(
      <Dropdown menu={menuItems}>
        <button>更多</button>
      </Dropdown>,
    );
    expect(queryByText('编辑')).toBeNull();
  });

  // 点击触发弹出菜单
  it('should show menu on click trigger', () => {
    const { getByText, container } = render(
      <Dropdown menu={menuItems} trigger="click">
        <button>更多</button>
      </Dropdown>,
    );
    fireEvent.click(getByText('更多'));
    expect(container.querySelector('.aura-dropdown-menu')).not.toBeNull();
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
  });

  // 菜单项点击回调
  it('should call onMenuClick when menu item is clicked', () => {
    const onMenuClick = vi.fn();
    const { getByText, container } = render(
      <Dropdown menu={menuItems} trigger="click" onMenuClick={onMenuClick}>
        <button>更多</button>
      </Dropdown>,
    );
    fireEvent.click(getByText('更多'));
    fireEvent.click(getByText('编辑'));
    expect(onMenuClick).toHaveBeenCalledWith('edit');
  });

  // 禁用菜单项不可点击
  it('should not call onMenuClick for disabled item', () => {
    const onMenuClick = vi.fn();
    const { getByText } = render(
      <Dropdown menu={menuItems} trigger="click" onMenuClick={onMenuClick}>
        <button>更多</button>
      </Dropdown>,
    );
    fireEvent.click(getByText('更多'));
    fireEvent.click(getByText('禁用项'));
    expect(onMenuClick).not.toHaveBeenCalled();
  });

  // 危险项 className
  it('should apply danger class for danger items', () => {
    const { getByText, container } = render(
      <Dropdown menu={menuItems} trigger="click">
        <button>更多</button>
      </Dropdown>,
    );
    fireEvent.click(getByText('更多'));
    const deleteItem = getByText('删除');
    expect(
      deleteItem.classList.contains('aura-dropdown-menu-item-danger'),
    ).toBe(true);
  });

  // 禁用项 className
  it('should apply disabled class for disabled items', () => {
    const { getByText, container } = render(
      <Dropdown menu={menuItems} trigger="click">
        <button>更多</button>
      </Dropdown>,
    );
    fireEvent.click(getByText('更多'));
    const disabledItem = getByText('禁用项');
    expect(
      disabledItem.classList.contains('aura-dropdown-menu-item-disabled'),
    ).toBe(true);
    expect(disabledItem.getAttribute('aria-disabled')).toBe('true');
  });

  // dropdown disabled 时不弹出菜单
  it('should not show menu when dropdown is disabled', () => {
    const { getByText, container } = render(
      <Dropdown menu={menuItems} trigger="click" disabled>
        <button>更多</button>
      </Dropdown>,
    );
    fireEvent.click(getByText('更多'));
    expect(container.querySelector('.aura-dropdown-menu')).toBeNull();
  });

  // className 和 style
  it('should apply custom className and style', () => {
    const { container } = render(
      <Dropdown
        menu={menuItems}
        className="custom-class"
        style={{ width: 200 }}
      >
        <button>更多</button>
      </Dropdown>,
    );
    const wrapper = container.querySelector('.aura-dropdown') as HTMLElement;
    expect(wrapper.classList.contains('custom-class')).toBe(true);
    expect(wrapper.style.width).toBe('200px');
  });

  // forwardRef 支持
  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Dropdown menu={menuItems} ref={ref}>
        <button>更多</button>
      </Dropdown>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-dropdown')).toBe(true);
  });

  // displayName
  it('should have displayName', () => {
    expect(Dropdown.displayName).toBe('Dropdown');
  });

  // aria 属性
  it('should have correct aria attributes', () => {
    const { getByText, container } = render(
      <Dropdown menu={menuItems} trigger="click">
        <button>更多</button>
      </Dropdown>,
    );
    fireEvent.click(getByText('更多'));
    const menu = container.querySelector('[role="menu"]');
    expect(menu).not.toBeNull();
    expect(menu?.getAttribute('aria-label')).toBe('下拉菜单');

    const items = container.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(menuItems.length);
  });
});
