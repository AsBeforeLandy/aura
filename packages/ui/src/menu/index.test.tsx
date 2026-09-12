import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Menu } from './index';

const MenuDemo = Menu as unknown as React.FC<any> & {
  Item: typeof Menu.Item;
  SubMenu: typeof Menu.SubMenu;
  Group: typeof Menu.Group;
};

describe('Menu', () => {
  // ===== 基础渲染 =====
  it('应该正确渲染 Menu 和 MenuItem', () => {
    const { getByText } = render(
      <MenuDemo>
        <MenuDemo.Item itemKey="a">项目 A</MenuDemo.Item>
        <MenuDemo.Item itemKey="b">项目 B</MenuDemo.Item>
      </MenuDemo>,
    );
    expect(getByText('项目 A')).toBeDefined();
    expect(getByText('项目 B')).toBeDefined();
  });

  it('应该应用自定义 className 和 style', () => {
    const { container } = render(
      <MenuDemo className="custom-menu" style={{ width: 300 }}>
        <MenuDemo.Item itemKey="a">A</MenuDemo.Item>
      </MenuDemo>,
    );
    const menu = container.firstChild as HTMLElement;
    expect(menu.classList.contains('custom-menu')).toBe(true);
    expect((menu as HTMLElement).style.width).toBe('300px');
  });

  it('应该渲染为 vertical 模式（默认）', () => {
    const { container } = render(
      <MenuDemo>
        <MenuDemo.Item itemKey="a">A</MenuDemo.Item>
      </MenuDemo>,
    );
    const menu = container.firstChild as HTMLElement;
    expect(menu.classList.contains('aura-menu-vertical')).toBe(true);
  });

  it('应该渲染为 horizontal 模式', () => {
    const { container } = render(
      <MenuDemo mode="horizontal">
        <MenuDemo.Item itemKey="a">A</MenuDemo.Item>
      </MenuDemo>,
    );
    const menu = container.firstChild as HTMLElement;
    expect(menu.classList.contains('aura-menu-horizontal')).toBe(true);
  });

  // ===== 选中行为 =====
  it('默认选中 defaultSelectedKey', () => {
    const { container } = render(
      <MenuDemo defaultSelectedKey="a">
        <MenuDemo.Item itemKey="a">项目 A</MenuDemo.Item>
        <MenuDemo.Item itemKey="b">项目 B</MenuDemo.Item>
      </MenuDemo>,
    );
    const items = container.querySelectorAll('.aura-menu-item');
    expect(items[0].classList.contains('aura-menu-item-selected')).toBe(true);
    expect(items[1].classList.contains('aura-menu-item-selected')).toBe(false);
  });

  it('点击应该触发 onSelect 回调', () => {
    const onSelect = vi.fn();
    render(
      <MenuDemo onSelect={onSelect}>
        <MenuDemo.Item itemKey="a">项目 A</MenuDemo.Item>
      </MenuDemo>,
    );
    fireEvent.click(screen.getByText('项目 A'));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('点击应该切换选中状态', () => {
    const { container, getByText } = render(
      <MenuDemo>
        <MenuDemo.Item itemKey="a">项目 A</MenuDemo.Item>
        <MenuDemo.Item itemKey="b">项目 B</MenuDemo.Item>
      </MenuDemo>,
    );
    fireEvent.click(getByText('项目 B'));
    const items = container.querySelectorAll('.aura-menu-item');
    expect(items[0].classList.contains('aura-menu-item-selected')).toBe(false);
    expect(items[1].classList.contains('aura-menu-item-selected')).toBe(true);
  });

  // ===== 受控模式 =====
  it('支持受控模式', () => {
    const { container, rerender } = render(
      <MenuDemo selectedKey="a">
        <MenuDemo.Item itemKey="a">项目 A</MenuDemo.Item>
        <MenuDemo.Item itemKey="b">项目 B</MenuDemo.Item>
      </MenuDemo>,
    );
    let items = container.querySelectorAll('.aura-menu-item');
    expect(items[0].classList.contains('aura-menu-item-selected')).toBe(true);

    rerender(
      <MenuDemo selectedKey="b">
        <MenuDemo.Item itemKey="a">项目 A</MenuDemo.Item>
        <MenuDemo.Item itemKey="b">项目 B</MenuDemo.Item>
      </MenuDemo>,
    );
    items = container.querySelectorAll('.aura-menu-item');
    expect(items[0].classList.contains('aura-menu-item-selected')).toBe(false);
    expect(items[1].classList.contains('aura-menu-item-selected')).toBe(true);
  });

  // ===== 禁用状态 =====
  it('禁用项不可点击', () => {
    const onSelect = vi.fn();
    render(
      <MenuDemo onSelect={onSelect}>
        <MenuDemo.Item itemKey="a" disabled>
          禁用项
        </MenuDemo.Item>
      </MenuDemo>,
    );
    fireEvent.click(screen.getByText('禁用项'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  // ===== SubMenu =====
  it('点击 SubMenu 标题应该展开/收起', () => {
    const { container, getByText } = render(
      <MenuDemo>
        <MenuDemo.SubMenu subKey="sub" title="子菜单">
          <MenuDemo.Item itemKey="a">子项 A</MenuDemo.Item>
        </MenuDemo.SubMenu>
      </MenuDemo>,
    );

    const submenu = container.querySelector('.aura-menu-submenu')!;
    expect(submenu.classList.contains('aura-menu-submenu-open')).toBe(false);

    fireEvent.click(getByText('子菜单'));
    expect(submenu.classList.contains('aura-menu-submenu-open')).toBe(true);
  });

  // ===== Group =====
  it('应该渲染 Group 标题', () => {
    const { getByText } = render(
      <MenuDemo>
        <MenuDemo.Group title="分组一">
          <MenuDemo.Item itemKey="a">项目 A</MenuDemo.Item>
        </MenuDemo.Group>
      </MenuDemo>,
    );
    expect(getByText('分组一')).toBeDefined();
    expect(getByText('项目 A')).toBeDefined();
  });

  // ===== forwardRef =====
  it('应该支持 forwardRef', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <MenuDemo ref={ref}>
        <MenuDemo.Item itemKey="a">A</MenuDemo.Item>
      </MenuDemo>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-menu')).toBe(true);
  });

  // ===== displayName =====
  it('应该有正确的 displayName', () => {
    expect(Menu.displayName).toBe('Menu');
    expect(Menu.Item.displayName).toBe('Menu.Item');
    expect(Menu.SubMenu.displayName).toBe('Menu.SubMenu');
    expect(Menu.Group.displayName).toBe('Menu.Group');
  });

  // ===== aria 属性 =====
  it('应该有正确的 aria 属性', () => {
    const { container } = render(
      <MenuDemo>
        <MenuDemo.Item itemKey="a">项目 A</MenuDemo.Item>
      </MenuDemo>,
    );
    const menu = container.firstChild as HTMLElement;
    expect(menu.getAttribute('role')).toBe('menu');

    const item = container.querySelector('.aura-menu-item')!;
    expect(item.getAttribute('role')).toBe('menuitem');
  });

  it('禁用项应该有 aria-disabled', () => {
    const { container } = render(
      <MenuDemo>
        <MenuDemo.Item itemKey="a" disabled>
          禁用项
        </MenuDemo.Item>
      </MenuDemo>,
    );
    const item = container.querySelector('.aura-menu-item')!;
    expect(item.getAttribute('aria-disabled')).toBe('true');
  });

  // ===== SubMenu.subKey =====
  it('SubMenu 的 subKey 应生成确定性面板 id，并在展开时通过 aria-controls 关联', () => {
    const { container } = render(
      <MenuDemo>
        <MenuDemo.SubMenu subKey="org" title="组织架构">
          <MenuDemo.Item itemKey="a">研发部</MenuDemo.Item>
        </MenuDemo.SubMenu>
      </MenuDemo>,
    );

    const submenu = container.querySelector('.aura-menu-submenu')!;
    expect(submenu.getAttribute('data-sub-key')).toBe('org');

    const title = container.querySelector('.aura-menu-submenu-title')!;
    // 未展开时不应暴露 aria-controls
    expect(title.getAttribute('aria-controls')).toBe(null);

    fireEvent.click(title);
    expect(title.getAttribute('aria-controls')).toBe(
      'aura-menu-submenu-panel-org',
    );
    expect(
      container.querySelector('#aura-menu-submenu-panel-org'),
    ).not.toBeNull();
  });

  // ===== collapsible =====
  it('collapsible 时渲染折叠开关，点击后进入折叠态', () => {
    const { container } = render(
      <MenuDemo collapsible>
        <MenuDemo.Item itemKey="a">首页</MenuDemo.Item>
      </MenuDemo>,
    );

    const trigger = container.querySelector('.aura-menu-collapse-trigger')!;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('aria-label')).toBe('折叠菜单');

    fireEvent.click(trigger);

    const menu = container.querySelector('.aura-menu')!;
    expect(menu.classList.contains('aura-menu-collapsed')).toBe(true);
    expect(trigger.getAttribute('aria-label')).toBe('展开菜单');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('再次点击折叠开关应恢复展开态', () => {
    const { container } = render(
      <MenuDemo collapsible>
        <MenuDemo.Item itemKey="a">首页</MenuDemo.Item>
      </MenuDemo>,
    );
    const trigger = container.querySelector('.aura-menu-collapse-trigger')!;
    const menu = container.querySelector('.aura-menu')!;

    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(menu.classList.contains('aura-menu-collapsed')).toBe(false);
  });

  it('horizontal 模式下不渲染折叠开关', () => {
    const { container } = render(
      <MenuDemo mode="horizontal" collapsible>
        <MenuDemo.Item itemKey="a">首页</MenuDemo.Item>
      </MenuDemo>,
    );
    expect(container.querySelector('.aura-menu-collapse-trigger')).toBeNull();
  });
});
