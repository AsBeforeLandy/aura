import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { PageContainer } from './index';

describe('PageContainer', () => {
  // ---- 正常 ----
  it('正常：渲染标题、描述与内容', () => {
    const { getByText, container } = render(
      <PageContainer title="用户管理" description="管理用户账号">
        <div>内容区</div>
      </PageContainer>,
    );
    expect(getByText('用户管理')).toBeDefined();
    expect(getByText('管理用户账号')).toBeDefined();
    expect(getByText('内容区')).toBeDefined();
    const root = container.firstChild as HTMLDivElement;
    expect(root.classList.contains('aura-page-container')).toBe(true);
  });

  it('正常：渲染面包屑与操作区', () => {
    const { getByText } = render(
      <PageContainer
        title="详情"
        breadcrumb={[{ title: '首页', href: '#' }, { title: '列表' }]}
        extra={<button type="button">新建</button>}
      />,
    );
    expect(getByText('首页')).toBeDefined();
    expect(getByText('列表')).toBeDefined();
    expect(getByText('新建')).toBeDefined();
  });

  // ---- 边界 ----
  it('边界：无任何头部内容时不渲染头部', () => {
    const { container } = render(
      <PageContainer>
        <div>只有内容</div>
      </PageContainer>,
    );
    expect(container.querySelector('.aura-page-container-header')).toBeNull();
  });

  it('边界：contentPadding=false 时不加内边距类', () => {
    const { container } = render(
      <PageContainer contentPadding={false}>
        <div>内容</div>
      </PageContainer>,
    );
    expect(
      container.querySelector('.aura-page-container-content-padded'),
    ).toBeNull();
  });

  it('边界：loading 为 true 时渲染骨架屏', () => {
    const { container } = render(
      <PageContainer loading title="加载中页面">
        <div>内容</div>
      </PageContainer>,
    );
    expect(container.querySelector('.ant-skeleton')).not.toBeNull();
  });

  it('边界：footer 传入时渲染底部工具栏', () => {
    const { getByText, container } = render(
      <PageContainer title="标题" footer={<button type="button">保存</button>} />,
    );
    expect(container.querySelector('.aura-page-container-footer')).not.toBeNull();
    expect(getByText('保存')).toBeDefined();
  });

  // ---- 异常 ----
  it('异常：breadcrumb 为空数组时不渲染面包屑', () => {
    const { container } = render(
      <PageContainer title="标题" breadcrumb={[]} />,
    );
    expect(
      container.querySelector('.aura-page-container-breadcrumb'),
    ).toBeNull();
  });

  it('异常：不传 children 时不崩溃', () => {
    expect(() => render(<PageContainer title="空页面" />)).not.toThrow();
  });
});
