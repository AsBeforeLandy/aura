import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Layout } from './index';

describe('Layout', () => {
  // ===== 基础渲染 =====
  it('should render layout with children', () => {
    const { container } = render(
      <Layout>
        <div>内容</div>
      </Layout>,
    );
    expect(screen.getByText('内容')).toBeDefined();
    expect(container.querySelector('.aura-layout')).not.toBeNull();
  });

  // ===== hasSider 布局 =====
  it('should apply hasSider className', () => {
    const { container } = render(
      <Layout hasSider>
        <Layout.Sider>侧边栏</Layout.Sider>
        <Layout.Body>内容</Layout.Body>
      </Layout>,
    );
    const layout = container.querySelector('.aura-layout');
    expect(layout?.classList.contains('aura-layout-has-sider')).toBe(true);
  });

  // ===== 子组件渲染 =====
  it('should render Header', () => {
    render(
      <Layout>
        <Layout.Header>头部</Layout.Header>
      </Layout>,
    );
    expect(screen.getByText('头部')).toBeDefined();
    expect(screen.getByText('头部').tagName).toBe('HEADER');
  });

  it('should render Body', () => {
    render(
      <Layout>
        <Layout.Body>主体</Layout.Body>
      </Layout>,
    );
    expect(screen.getByText('主体')).toBeDefined();
    expect(screen.getByText('主体').tagName).toBe('MAIN');
  });

  it('should render Footer', () => {
    render(
      <Layout>
        <Layout.Footer>底部</Layout.Footer>
      </Layout>,
    );
    expect(screen.getByText('底部')).toBeDefined();
    expect(screen.getByText('底部').tagName).toBe('FOOTER');
  });

  it('should render Sider', () => {
    render(
      <Layout hasSider>
        <Layout.Sider>侧边栏</Layout.Sider>
      </Layout>,
    );
    expect(screen.getByText('侧边栏')).toBeDefined();
    expect(screen.getByText('侧边栏').closest('aside')).not.toBeNull();
  });

  // ===== className/style =====
  it('should apply className to Layout', () => {
    const { container } = render(
      <Layout className="custom-layout">
        <div>内容</div>
      </Layout>,
    );
    const layout = container.querySelector('.aura-layout');
    expect(layout?.classList.contains('custom-layout')).toBe(true);
  });

  it('should apply style to Layout', () => {
    const { container } = render(
      <Layout style={{ minHeight: '100vh' }}>
        <div>内容</div>
      </Layout>,
    );
    const layout = container.querySelector('.aura-layout') as HTMLElement;
    expect(layout.style.minHeight).toBe('100vh');
  });

  it('should apply className to Header', () => {
    const { container } = render(
      <Layout>
        <Layout.Header className="custom-header">头部</Layout.Header>
      </Layout>,
    );
    const header = container.querySelector('.aura-layout-header');
    expect(header?.classList.contains('custom-header')).toBe(true);
  });

  it('should apply style to Header', () => {
    const { container } = render(
      <Layout>
        <Layout.Header style={{ background: 'red' }}>头部</Layout.Header>
      </Layout>,
    );
    const header = container.querySelector('.aura-layout-header') as HTMLElement;
    expect(header.style.background).toBe('red');
  });

  // ===== Sider 宽度 =====
  it('should apply default width to Sider', () => {
    const { container } = render(
      <Layout hasSider>
        <Layout.Sider>侧边栏</Layout.Sider>
      </Layout>,
    );
    const sider = container.querySelector('.aura-layout-sider') as HTMLElement;
    expect(sider.style.width).toBe('200px');
  });

  it('should apply custom width to Sider', () => {
    const { container } = render(
      <Layout hasSider>
        <Layout.Sider width={300}>侧边栏</Layout.Sider>
      </Layout>,
    );
    const sider = container.querySelector('.aura-layout-sider') as HTMLElement;
    expect(sider.style.width).toBe('300px');
  });

  // ===== Sider 折叠 =====
  it('should render collapsible trigger', () => {
    const { container } = render(
      <Layout hasSider>
        <Layout.Sider collapsible>侧边栏</Layout.Sider>
      </Layout>,
    );
    const trigger = container.querySelector('.aura-layout-sider-trigger');
    expect(trigger).not.toBeNull();
  });

  it('should collapse sider when trigger clicked', () => {
    const { container } = render(
      <Layout hasSider>
        <Layout.Sider collapsible>侧边栏</Layout.Sider>
      </Layout>,
    );
    const trigger = container.querySelector('.aura-layout-sider-trigger')!;
    fireEvent.click(trigger);
    const sider = container.querySelector('.aura-layout-sider') as HTMLElement;
    expect(sider.style.width).toBe('64px');
    expect(sider.classList.contains('aura-layout-sider-collapsed')).toBe(true);
  });

  // ===== 完整布局 =====
  it('should render complete layout', () => {
    const { container } = render(
      <Layout hasSider>
        <Layout.Sider>侧边栏</Layout.Sider>
        <Layout>
          <Layout.Header>头部</Layout.Header>
          <Layout.Body>主体</Layout.Body>
          <Layout.Footer>底部</Layout.Footer>
        </Layout>
      </Layout>,
    );

    expect(screen.getByText('头部')).toBeDefined();
    expect(screen.getByText('主体')).toBeDefined();
    expect(screen.getByText('底部')).toBeDefined();
    expect(screen.getByText('侧边栏')).toBeDefined();
  });

  // ===== forwardRef =====
  it('should forward ref to layout div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Layout ref={ref}>
        <div>内容</div>
      </Layout>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-layout')).toBe(true);
  });

  it('should forward ref to header', () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Layout>
        <Layout.Header ref={ref}>头部</Layout.Header>
      </Layout>,
    );
    expect(ref.current).not.toBeNull();
  });
});
