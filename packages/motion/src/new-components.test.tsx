import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  GradientBorder,
  Marquee,
  ScrollScaleCard,
  TextShimmer,
  TiltCard,
  TypingDots,
} from './index';

describe('TiltCard', () => {
  it('渲染 children（jsdom 无指针事件，呈静态卡片）', () => {
    const { container } = render(
      <TiltCard>
        <div>倾斜卡片内容</div>
      </TiltCard>,
    );
    expect(screen.getByText('倾斜卡片内容')).toBeTruthy();
    expect(container.firstElementChild).toBeTruthy();
  });
});

describe('TextShimmer', () => {
  it('以渐变绘制字形并渲染文本', () => {
    const { container } = render(<TextShimmer>正在生成回答</TextShimmer>);
    expect(screen.getByText('正在生成回答')).toBeTruthy();
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundImage).toContain('linear-gradient');
  });
});

describe('TypingDots', () => {
  it('role=status + 意图状态机 + 指定点数', () => {
    const { container } = render(<TypingDots count={4} />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('正在输入');
    expect(screen.getByRole('status').getAttribute('data-motion-state')).toBe('playing');
    expect(container.querySelectorAll('[role="status"] > span').length).toBe(4);
  });
});

describe('GradientBorder', () => {
  it('渲染 children 且存在旋转光带层', () => {
    const { container } = render(
      <GradientBorder colors={['#534ab7', '#1d9e75']}>
        <div>边框内容</div>
      </GradientBorder>,
    );
    expect(screen.getByText('边框内容')).toBeTruthy();
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(3);
  });
});

describe('Marquee', () => {
  it('内容渲染两份以实现无缝回绕', () => {
    render(
      <Marquee>
        <span>AURA</span>
      </Marquee>,
    );
    expect(screen.getAllByText('AURA').length).toBe(2);
  });
});

describe('ScrollScaleCard', () => {
  it('渲染 children 并挂载滚动进度样式（scale/opacity）', () => {
    const { container } = render(
      <ScrollScaleCard>
        <div>滚动缩放卡片</div>
      </ScrollScaleCard>,
    );
    expect(screen.getByText('滚动缩放卡片')).toBeTruthy();
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.opacity || el.style.transform).toBeTruthy();
  });
});
