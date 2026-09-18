import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Think } from './index';

describe('Think', () => {
  it('正常：完成后默认折叠，点击标题展开内容', async () => {
    const { container } = render(
      <Think content="正在分析问题结构…" duration={3} />,
    );

    // 默认折叠：内容不显示
    expect(container.querySelector('.aura-x-think-content')).toBeNull();

    // 点击展开（fireEvent 自带 act，状态同步刷新）
    fireEvent.click(container.querySelector('button')!);
    expect(screen.getByText('正在分析问题结构…')).toBeDefined();
    expect(screen.getByText(/已深度思考 · 3 秒/)).toBeDefined();
  });

  it('边界：thinking 中强制展开且标题不可点击收起', () => {
    render(<Think thinking content="推理步骤一" />);

    expect(screen.getByText('思考中…')).toBeDefined();
    expect(screen.getByText('推理步骤一')).toBeDefined();

    const trigger = screen.getByText('思考中…').closest(
      'button',
    ) as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });

  it('a11y：aria-expanded 正确且无 axe 违规', async () => {
    const { container } = render(<Think content="内容" defaultExpanded />);
    const trigger = container.querySelector('button') as HTMLButtonElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
