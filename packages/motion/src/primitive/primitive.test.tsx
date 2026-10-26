import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  FocusRing,
  InViewport,
  LayoutGroup,
  Magnetic,
  Reveal,
  SkeletonShimmer,
} from '../index';

/** primitive 剩余组件的意图断言（第三批） */

describe('Reveal', () => {
  it.each(['fade', 'blur', 'mask', 'scale'] as const)('variant=%s 渲染 children', (variant) => {
    render(
      <Reveal variant={variant}>
        <div>揭示内容</div>
      </Reveal>,
    );
    expect(screen.getByText('揭示内容')).toBeTruthy();
  });

  it('index 错峰不改变渲染结果', () => {
    render(
      <div>
        <Reveal index={0}>
          <span>第一项</span>
        </Reveal>
        <Reveal index={3}>
          <span>第四项</span>
        </Reveal>
      </div>,
    );
    expect(screen.getByText('第一项')).toBeTruthy();
    expect(screen.getByText('第四项')).toBeTruthy();
  });
});

describe('InViewport', () => {
  it('渲染 children（whileInView 由引擎接管）', () => {
    render(
      <InViewport>
        <div>视口触发内容</div>
      </InViewport>,
    );
    expect(screen.getByText('视口触发内容')).toBeTruthy();
  });

  it('offset=0 只淡入不位移', () => {
    const { container } = render(
      <InViewport offset={0}>
        <div>纯淡入</div>
      </InViewport>,
    );
    expect(container.firstElementChild).toBeTruthy();
  });
});

describe('Magnetic', () => {
  it('渲染 children 且鼠标移动不报错', () => {
    const { container } = render(
      <Magnetic strength={0.5}>
        <button type="button">磁吸按钮</button>
      </Magnetic>,
    );
    const btn = screen.getByRole('button', { name: /磁吸按钮/ });
    expect(() => {
      fireEvent.mouseMove(container.firstElementChild as Element, {
        clientX: 20,
        clientY: 10,
      });
    }).not.toThrow();
    expect(btn).toBeTruthy();
  });
});

describe('SkeletonShimmer', () => {
  it('渲染容器与扫光层', () => {
    const { container } = render(<SkeletonShimmer width={200} height={16} />);
    // 容器 + aria-hidden 扫光层
    expect(container.firstElementChild).toBeTruthy();
    expect(container.querySelector('[aria-hidden]')).toBeTruthy();
  });

  it('index 与自定义半径不报错', () => {
    const { container } = render(<SkeletonShimmer index={3} radius={12} width="60%" />);
    expect(container.firstElementChild).toBeTruthy();
  });
});

describe('FocusRing', () => {
  it('初始不渲染环，子元素聚焦后出现装饰环', () => {
    const { container } = render(
      <FocusRing>
        <button type="button">聚焦我</button>
      </FocusRing>,
    );
    const host = container.firstElementChild as HTMLElement;
    expect(host.querySelector('[aria-hidden]')).toBeNull();

    const btn = screen.getByRole('button', { name: '聚焦我' });
    fireEvent.focusIn(btn);
    expect(host.querySelector('[aria-hidden]')).toBeTruthy();

    fireEvent.focusOut(btn);
    expect(host.querySelector('[aria-hidden]')).toBeNull();
  });
});

describe('LayoutGroup', () => {
  it('渲染 children 并透传布局上下文', () => {
    render(
      <LayoutGroup>
        <div>共享元素内容</div>
      </LayoutGroup>,
    );
    expect(screen.getByText('共享元素内容')).toBeTruthy();
  });
});
