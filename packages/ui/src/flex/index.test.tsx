import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Flex } from './index';

describe('Flex', () => {
  // ===== 基础渲染 =====
  it('should render with children', () => {
    const { container } = render(
      <Flex>
        <span>A</span>
        <span>B</span>
      </Flex>,
    );
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
    expect(container.querySelector('.aura-flex')).not.toBeNull();
  });

  // ===== direction =====
  it('should apply flexDirection style', () => {
    const { container } = render(
      <Flex direction="column">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.flexDirection).toBe('column');
  });

  it('should apply row-reverse direction', () => {
    const { container } = render(
      <Flex direction="row-reverse">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.flexDirection).toBe('row-reverse');
  });

  // ===== justify =====
  it('should apply justifyContent style', () => {
    const { container } = render(
      <Flex justify="center">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.justifyContent).toBe('center');
  });

  it('should map justify between to space-between', () => {
    const { container } = render(
      <Flex justify="between">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.justifyContent).toBe('space-between');
  });

  it('should map justify around to space-around', () => {
    const { container } = render(
      <Flex justify="around">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.justifyContent).toBe('space-around');
  });

  it('should map justify evenly to space-evenly', () => {
    const { container } = render(
      <Flex justify="evenly">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.justifyContent).toBe('space-evenly');
  });

  // ===== align =====
  it('should apply alignItems style', () => {
    const { container } = render(
      <Flex align="center">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.alignItems).toBe('center');
  });

  it('should map align start to flex-start', () => {
    const { container } = render(
      <Flex align="start">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.alignItems).toBe('flex-start');
  });

  it('should map align end to flex-end', () => {
    const { container } = render(
      <Flex align="end">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.alignItems).toBe('flex-end');
  });

  // ===== gap =====
  it('should apply gap with preset sm', () => {
    const { container } = render(
      <Flex gap="sm">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.gap).toBe('8px');
  });

  it('should apply gap with preset md', () => {
    const { container } = render(
      <Flex gap="md">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.gap).toBe('16px');
  });

  it('should apply gap with preset lg', () => {
    const { container } = render(
      <Flex gap="lg">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.gap).toBe('24px');
  });

  it('should apply gap with number', () => {
    const { container } = render(
      <Flex gap={32}>
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.gap).toBe('32px');
  });

  // ===== wrap =====
  it('should apply flexWrap style', () => {
    const { container } = render(
      <Flex wrap="wrap">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.flexWrap).toBe('wrap');
  });

  // ===== className/style =====
  it('should apply className', () => {
    const { container } = render(
      <Flex className="custom-flex">
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex');
    expect(flex?.classList.contains('custom-flex')).toBe(true);
  });

  it('should apply custom style', () => {
    const { container } = render(
      <Flex style={{ padding: 20 }}>
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.padding).toBe('20px');
  });

  // ===== 默认值 =====
  it('should use default direction row', () => {
    const { container } = render(
      <Flex>
        <span>A</span>
      </Flex>,
    );
    const flex = container.querySelector('.aura-flex') as HTMLElement;
    expect(flex.style.flexDirection).toBe('row');
  });

  // ===== forwardRef =====
  it('should forward ref to div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Flex ref={ref}>
        <span>A</span>
      </Flex>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-flex')).toBe(true);
  });
});
