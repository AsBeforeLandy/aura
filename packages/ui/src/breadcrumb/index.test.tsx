import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Breadcrumb } from './index';

const BreadcrumbDemo = Breadcrumb as unknown as React.FC<any> & {
  Item: typeof Breadcrumb.Item;
};

describe('Breadcrumb', () => {
  // ===== 基础渲染 =====
  it('应该正确渲染 Breadcrumb 和 Breadcrumb.Item', () => {
    const { getByText } = render(
      <BreadcrumbDemo>
        <BreadcrumbDemo.Item>首页</BreadcrumbDemo.Item>
        <BreadcrumbDemo.Item>列表页</BreadcrumbDemo.Item>
        <BreadcrumbDemo.Item>详情</BreadcrumbDemo.Item>
      </BreadcrumbDemo>,
    );
    expect(getByText('首页')).toBeDefined();
    expect(getByText('列表页')).toBeDefined();
    expect(getByText('详情')).toBeDefined();
  });

  it('应该使用默认分隔符 /', () => {
    const { container } = render(
      <BreadcrumbDemo>
        <BreadcrumbDemo.Item>A</BreadcrumbDemo.Item>
        <BreadcrumbDemo.Item>B</BreadcrumbDemo.Item>
      </BreadcrumbDemo>,
    );
    const separators = container.querySelectorAll('.aura-breadcrumb-separator');
    expect(separators.length).toBe(1);
    expect(separators[0].textContent).toBe('/');
  });

  it('应该支持自定义分隔符', () => {
    const { container } = render(
      <BreadcrumbDemo separator=">">
        <BreadcrumbDemo.Item>A</BreadcrumbDemo.Item>
        <BreadcrumbDemo.Item>B</BreadcrumbDemo.Item>
      </BreadcrumbDemo>,
    );
    const separators = container.querySelectorAll('.aura-breadcrumb-separator');
    expect(separators[0].textContent).toBe('>');
  });

  it('最后一项应该加粗显示', () => {
    const { container } = render(
      <BreadcrumbDemo>
        <BreadcrumbDemo.Item>首页</BreadcrumbDemo.Item>
        <BreadcrumbDemo.Item>详情</BreadcrumbDemo.Item>
      </BreadcrumbDemo>,
    );
    const items = container.querySelectorAll('.aura-breadcrumb-item');
    expect(items[0].classList.contains('aura-breadcrumb-item-last')).toBe(false);
    expect(items[1].classList.contains('aura-breadcrumb-item-last')).toBe(true);
  });

  it('应该应用自定义 className 和 style', () => {
    const { container } = render(
      <BreadcrumbDemo className="custom-breadcrumb" style={{ fontSize: 14 }}>
        <BreadcrumbDemo.Item>A</BreadcrumbDemo.Item>
      </BreadcrumbDemo>,
    );
    const nav = container.firstChild as HTMLElement;
    expect(nav.classList.contains('custom-breadcrumb')).toBe(true);
    expect((nav as HTMLElement).style.fontSize).toBe('14px');
  });

  it('应该支持 href 属性', () => {
    const { container } = render(
      <BreadcrumbDemo>
        <BreadcrumbDemo.Item href="/home">首页</BreadcrumbDemo.Item>
        <BreadcrumbDemo.Item>详情</BreadcrumbDemo.Item>
      </BreadcrumbDemo>,
    );
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('/home');
  });

  it('应该支持 onClick 回调', () => {
    const onClick = vi.fn();
    render(
      <BreadcrumbDemo>
        <BreadcrumbDemo.Item onClick={onClick}>首页</BreadcrumbDemo.Item>
      </BreadcrumbDemo>,
    );
    fireEvent.click(screen.getByText('首页'));
    expect(onClick).toHaveBeenCalled();
  });

  it('只有一个项时不显示分隔符', () => {
    const { container } = render(
      <BreadcrumbDemo>
        <BreadcrumbDemo.Item>首页</BreadcrumbDemo.Item>
      </BreadcrumbDemo>,
    );
    const separators = container.querySelectorAll('.aura-breadcrumb-separator');
    expect(separators.length).toBe(0);
  });

  // ===== forwardRef =====
  it('应该支持 forwardRef', () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <BreadcrumbDemo ref={ref}>
        <BreadcrumbDemo.Item>A</BreadcrumbDemo.Item>
      </BreadcrumbDemo>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-breadcrumb')).toBe(true);
  });

  // ===== displayName =====
  it('应该有正确的 displayName', () => {
    expect(Breadcrumb.displayName).toBe('Breadcrumb');
    expect(Breadcrumb.Item.displayName).toBe('Breadcrumb.Item');
  });

  // ===== aria 属性 =====
  it('应该有正确的 aria 属性', () => {
    const { container } = render(
      <BreadcrumbDemo>
        <BreadcrumbDemo.Item>A</BreadcrumbDemo.Item>
        <BreadcrumbDemo.Item>B</BreadcrumbDemo.Item>
      </BreadcrumbDemo>,
    );
    const nav = container.firstChild as HTMLElement;
    expect(nav.getAttribute('role')).toBe('navigation');
    expect(nav.getAttribute('aria-label')).toBe('面包屑导航');

    const separators = container.querySelectorAll('.aura-breadcrumb-separator');
    expect(separators[0].getAttribute('aria-hidden')).toBe('true');
  });
});
