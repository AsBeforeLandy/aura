import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Empty } from './index';

describe('Empty', () => {
  it('应该渲染默认空状态', () => {
    const { getByText } = render(<Empty />);
    expect(getByText('暂无数据')).toBeDefined();
  });

  it('应该渲染自定义描述文字', () => {
    const { getByText } = render(
      <Empty description="列表为空" />,
    );
    expect(getByText('列表为空')).toBeDefined();
  });

  it('应该渲染自定义图片', () => {
    const { getByAltText } = render(
      <Empty image={<img alt="空" src="/empty.png" />} />,
    );
    expect(getByAltText('空')).toBeDefined();
  });

  it('应该渲染附加内容（children）', () => {
    const { getByText } = render(
      <Empty>
        <button>重新加载</button>
      </Empty>,
    );
    expect(getByText('重新加载')).toBeDefined();
  });

  it('应该应用自定义 className 和 style', () => {
    const { container } = render(
      <Empty className="custom-empty" style={{ marginTop: 20 }} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('custom-empty')).toBe(true);
    expect((wrapper as HTMLElement).style.marginTop).toBe('20px');
  });

  it('应该渲染 Empty.Preset noData 类型', () => {
    const { getByText } = render(<Empty.Preset type="noData" />);
    expect(getByText('暂无数据')).toBeDefined();
  });

  it('应该渲染 Empty.Preset noResult 类型', () => {
    const { getByText } = render(<Empty.Preset type="noResult" />);
    expect(getByText('未找到匹配结果')).toBeDefined();
  });

  it('应该渲染 Empty.Preset 404 类型', () => {
    const { getByText } = render(<Empty.Preset type="404" />);
    expect(getByText('抱歉，您访问的页面不存在')).toBeDefined();
  });

  it('description 为 null 时不渲染描述区域', () => {
    const { queryByText } = render(<Empty description={null} />);
    // 不应出现默认 "暂无数据"
    expect(queryByText('暂无数据')).toBeNull();
  });

  it('应该渲染默认 SVG 图片', () => {
    const { container } = render(<Empty />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });
});
