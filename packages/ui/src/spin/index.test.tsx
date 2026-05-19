import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Spin } from './index';

describe('Spin', () => {
  it('should render default spinner', () => {
    const { container } = render(<Spin />);
    expect(container.firstChild).toBeDefined();
    const spin = container.firstChild as HTMLDivElement;
    expect(spin.classList.contains('aura-spin')).toBe(true);
    expect(spin.classList.contains('aura-spin-md')).toBe(true);
  });

  it('should render with size className', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { unmount, container } = render(<Spin size={size} />);
      const spin = container.firstChild as HTMLDivElement;
      expect(spin.classList.contains(`aura-spin-${size}`)).toBe(true);
      unmount();
    });
  });

  it('should render tip text', () => {
    const { getByText } = render(<Spin tip="加载中..." />);
    expect(getByText('加载中...')).toBeDefined();
  });

  it('should render custom indicator', () => {
    const customIndicator = <span data-testid="custom-icon">Loading</span>;
    const { getByTestId } = render(<Spin indicator={customIndicator} />);
    expect(getByTestId('custom-icon')).toBeDefined();
  });

  it('should render children when spinning is false', () => {
    const { getByText, container } = render(
      <Spin spinning={false}>
        <div>内容区域</div>
      </Spin>,
    );
    expect(getByText('内容区域')).toBeDefined();
    const spinContainer = container.firstChild as HTMLDivElement;
    expect(spinContainer.classList.contains('aura-spin-container')).toBe(true);
    // spinning=false 时不应有 overlay
    const overlay = spinContainer.querySelector('.aura-spin-overlay');
    expect(overlay).toBeNull();
  });

  it('should render overlay and blur children when spinning', () => {
    const { container } = render(
      <Spin spinning>
        <div>内容区域</div>
      </Spin>,
    );
    const spinContainer = container.firstChild as HTMLDivElement;
    expect(spinContainer.classList.contains('aura-spin-spinning')).toBe(true);
    const overlay = spinContainer.querySelector('.aura-spin-overlay');
    expect(overlay).toBeDefined();
    const content = spinContainer.querySelector('.aura-spin-content-blur');
    expect(content).toBeDefined();
  });

  it('should not show overlay when spinning is false with children', () => {
    const { container } = render(
      <Spin spinning={false}>
        <div>内容</div>
      </Spin>,
    );
    const overlay = container.querySelector('.aura-spin-overlay');
    expect(overlay).toBeNull();
    const blurContent = container.querySelector('.aura-spin-content-blur');
    expect(blurContent).toBeNull();
  });

  it('should render SVG indicator by default', () => {
    const { container } = render(<Spin />);
    const svg = container.querySelector('.aura-spin-svg');
    expect(svg).toBeDefined();
  });

  it('should merge custom className', () => {
    const { container } = render(<Spin className="custom-class" />);
    const spin = container.firstChild as HTMLDivElement;
    expect(spin.classList.contains('custom-class')).toBe(true);
  });

  it('should not render spinning container class when spinning is false with children', () => {
    const { container } = render(
      <Spin spinning={false}>
        <div>内容</div>
      </Spin>,
    );
    const wrapper = container.firstChild as HTMLDivElement;
    expect(wrapper.classList.contains('aura-spin-spinning')).toBe(false);
  });
});
