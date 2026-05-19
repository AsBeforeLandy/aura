import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Tabs, TabItem } from './index';

const TabsDemo = Tabs as unknown as React.FC<any> & { Tab: typeof TabItem };

describe('Tabs', () => {
  it('应该正确渲染 Tabs 和 TabItem', () => {
    const { getByText } = render(
      <TabsDemo defaultActiveKey="a">
        <TabsDemo.Tab tabKey="a" title="Tab A">
          内容 A
        </TabsDemo.Tab>
        <TabsDemo.Tab tabKey="b" title="Tab B">
          内容 B
        </TabsDemo.Tab>
      </TabsDemo>,
    );
    expect(getByText('Tab A')).toBeDefined();
    expect(getByText('Tab B')).toBeDefined();
    // 默认激活第一个
    expect(getByText('内容 A')).toBeDefined();
  });

  it('点击 tab 应该切换内容', () => {
    const { getByText, queryByText } = render(
      <TabsDemo defaultActiveKey="a">
        <TabsDemo.Tab tabKey="a" title="Tab A">
          内容 A
        </TabsDemo.Tab>
        <TabsDemo.Tab tabKey="b" title="Tab B">
          内容 B
        </TabsDemo.Tab>
      </TabsDemo>,
    );

    // 点击 Tab B
    fireEvent.click(getByText('Tab B'));
    expect(getByText('内容 B')).toBeDefined();
    expect(queryByText('内容 A')).toBeNull();
  });

  it('应该触发 onChange 回调', () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <TabsDemo defaultActiveKey="a" onChange={onChange}>
        <TabsDemo.Tab tabKey="a" title="Tab A">
          A
        </TabsDemo.Tab>
        <TabsDemo.Tab tabKey="b" title="Tab B">
          B
        </TabsDemo.Tab>
      </TabsDemo>,
    );

    fireEvent.click(getByText('Tab B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('支持受控模式', () => {
    const { getByText, queryByText } = render(
      <TabsDemo activeKey="b">
        <TabsDemo.Tab tabKey="a" title="Tab A">
          内容 A
        </TabsDemo.Tab>
        <TabsDemo.Tab tabKey="b" title="Tab B">
          内容 B
        </TabsDemo.Tab>
      </TabsDemo>,
    );

    // 受控模式下直接渲染 b 的内容
    expect(getByText('内容 B')).toBeDefined();
    expect(queryByText('内容 A')).toBeNull();
  });

  it('禁用的 tab 不可点击', () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <TabsDemo defaultActiveKey="a" onChange={onChange}>
        <TabsDemo.Tab tabKey="a" title="Tab A">
          A
        </TabsDemo.Tab>
        <TabsDemo.Tab tabKey="b" title="Tab B" disabled>
          B
        </TabsDemo.Tab>
      </TabsDemo>,
    );

    fireEvent.click(getByText('Tab B'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('应该渲染不同变体的 className', () => {
    const { container } = render(
      <TabsDemo defaultActiveKey="a" variant="card">
        <TabsDemo.Tab tabKey="a" title="Tab A">
          A
        </TabsDemo.Tab>
      </TabsDemo>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-tabs-card')).toBe(true);
  });

  it('应该渲染不同尺寸的 className', () => {
    const { container } = render(
      <TabsDemo defaultActiveKey="a" size="lg">
        <TabsDemo.Tab tabKey="a" title="Tab A">
          A
        </TabsDemo.Tab>
      </TabsDemo>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-tabs-lg')).toBe(true);
  });

  it('未设置 activeKey 时默认选中第一个 tab', () => {
    const { getByText } = render(
      <TabsDemo>
        <TabsDemo.Tab tabKey="x" title="Tab X">
          内容 X
        </TabsDemo.Tab>
        <TabsDemo.Tab tabKey="y" title="Tab Y">
          内容 Y
        </TabsDemo.Tab>
      </TabsDemo>,
    );
    expect(getByText('内容 X')).toBeDefined();
  });

  it('pill 变体应该正确渲染', () => {
    const { container, getByText } = render(
      <TabsDemo defaultActiveKey="a" variant="pill">
        <TabsDemo.Tab tabKey="a" title="Pill A">
          PA
        </TabsDemo.Tab>
        <TabsDemo.Tab tabKey="b" title="Pill B">
          PB
        </TabsDemo.Tab>
      </TabsDemo>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-tabs-pill')).toBe(true);

    fireEvent.click(getByText('Pill B'));
    expect(getByText('PB')).toBeDefined();
  });
});
