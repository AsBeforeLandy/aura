import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Scrollbar } from './index';

describe('Scrollbar', () => {
  // ===== 基础渲染 =====
  it('should render with children', () => {
    const { container } = render(
      <Scrollbar>
        <div>内容</div>
      </Scrollbar>,
    );
    expect(screen.getByText('内容')).toBeDefined();
    expect(container.querySelector('.aura-scrollbar')).not.toBeNull();
  });

  // ===== maxHeight =====
  it('should apply maxHeight with number', () => {
    const { container } = render(
      <Scrollbar maxHeight={200}>
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar') as HTMLElement;
    expect(scrollbar.style.maxHeight).toBe('200px');
  });

  it('should apply maxHeight with string', () => {
    const { container } = render(
      <Scrollbar maxHeight="50vh">
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar') as HTMLElement;
    expect(scrollbar.style.maxHeight).toBe('50vh');
  });

  // ===== maxWidth =====
  it('should apply maxWidth with number', () => {
    const { container } = render(
      <Scrollbar maxWidth={400}>
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar') as HTMLElement;
    expect(scrollbar.style.maxWidth).toBe('400px');
  });

  it('should apply maxWidth with string', () => {
    const { container } = render(
      <Scrollbar maxWidth="80%">
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar') as HTMLElement;
    expect(scrollbar.style.maxWidth).toBe('80%');
  });

  // ===== alwaysShow =====
  it('should not have always className by default', () => {
    const { container } = render(
      <Scrollbar>
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar');
    expect(scrollbar?.classList.contains('aura-scrollbar-always')).toBe(false);
  });

  it('should apply always className when alwaysShow is true', () => {
    const { container } = render(
      <Scrollbar alwaysShow>
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar');
    expect(scrollbar?.classList.contains('aura-scrollbar-always')).toBe(true);
  });

  // ===== className =====
  it('should apply className', () => {
    const { container } = render(
      <Scrollbar className="custom-scrollbar">
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar');
    expect(scrollbar?.classList.contains('custom-scrollbar')).toBe(true);
  });

  // ===== style =====
  it('should apply custom style', () => {
    const { container } = render(
      <Scrollbar style={{ background: '#f5f5f5' }}>
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar') as HTMLElement;
    expect(scrollbar.style.background).toBe('rgb(245, 245, 245)');
  });

  // ===== aria 属性 =====
  it('should have aria-label', () => {
    const { container } = render(
      <Scrollbar>
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar');
    expect(scrollbar?.getAttribute('aria-label')).toBe('可滚动区域');
  });

  it('should have role="region"', () => {
    const { container } = render(
      <Scrollbar>
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar');
    expect(scrollbar?.getAttribute('role')).toBe('region');
  });

  // ===== forwardRef =====
  it('should forward ref to div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Scrollbar ref={ref}>
        <div>内容</div>
      </Scrollbar>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-scrollbar')).toBe(true);
  });

  // ===== 无 maxHeight/maxWidth 时不设置尺寸 =====
  it('should not set maxHeight when not provided', () => {
    const { container } = render(
      <Scrollbar>
        <div>内容</div>
      </Scrollbar>,
    );
    const scrollbar = container.querySelector('.aura-scrollbar') as HTMLElement;
    expect(scrollbar.style.maxHeight).toBe('');
  });
});
