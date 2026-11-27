import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CategoryLegend, ColorBandLegend } from './SceneLegend';

describe('SceneLegend', () => {
  it('ColorBandLegend 渲染标题、紧凑数值与多段渐变条', () => {
    const { container } = render(
      <ColorBandLegend
        min={-120}
        max={1500}
        colorRange={['#16a34a', '#94a3b8', '#db2777']}
        label="预算差值"
      />,
    );

    expect(screen.getByText('预算差值')).toBeDefined();
    expect(screen.getByText('-120')).toBeDefined();
    expect(screen.getByText('1.5k')).toBeDefined();
    const panel = container.firstElementChild as HTMLElement;
    expect(panel.style.background).toBe('var(--aura-bg)');
    expect(panel.style.border).toContain('var(--aura-border)');
    const bar = panel.children[1] as HTMLElement;
    expect(bar.style.background).toContain('linear-gradient');
    expect(bar.style.background).toContain('#16a34a');
    expect(bar.style.background).toContain('#db2777');
  });

  it('ColorBandLegend 在省略 label 或仅传单色时仍安全渲染', () => {
    const { container } = render(
      <ColorBandLegend min={0} max={10} colorRange={['#7c3aed']} />,
    );
    const panel = container.firstElementChild as HTMLElement;
    // 无标题时仅包含色带条 + 数值行两个子元素
    expect(panel.children).toHaveLength(2);
    const bar = panel.children[0] as HTMLElement;
    expect(bar.style.background).toBe('rgb(124, 58, 237)');
  });

  it('CategoryLegend 渲染全部分类名称与对应色点', () => {
    const { container } = render(
      <CategoryLegend
        items={[
          { label: '接入层', color: '#7c3aed' },
          { label: '数据层', color: '#0ea5e9' },
        ]}
      />,
    );

    expect(screen.getByText('接入层')).toBeDefined();
    expect(screen.getByText('数据层')).toBeDefined();
    const dots = container.querySelectorAll('span');
    expect(dots).toHaveLength(2);
    expect((dots[0] as HTMLElement).style.background).toBe('rgb(124, 58, 237)');
    expect((dots[1] as HTMLElement).style.background).toBe('rgb(14, 165, 233)');
  });

  it('CategoryLegend 空数组不崩溃', () => {
    const { container } = render(<CategoryLegend items={[]} />);
    expect(container.firstElementChild?.children).toHaveLength(0);
  });
});
