import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Space } from './index';

describe('Space', () => {
  it('should render children', () => {
    const { getByText } = render(
      <Space>
        <span>A</span>
        <span>B</span>
      </Space>,
    );
    expect(getByText('A')).toBeDefined();
    expect(getByText('B')).toBeDefined();
  });

  it('should render with base class', () => {
    const { container } = render(<Space>Content</Space>);
    expect(container.querySelector('div')!.classList.contains('aura-space')).toBe(true);
  });

  it('should render horizontal by default', () => {
    const { container } = render(<Space>X</Space>);
    const div = container.querySelector('div')!;
    expect(div.classList.contains('aura-space-vertical')).toBe(false);
    expect(getComputedStyle(div).flexDirection || 'row').toBe('row');
  });

  it('should render vertical direction', () => {
    const { container } = render(<Space direction="vertical">X</Space>);
    const div = container.querySelector('div')!;
    expect(div.classList.contains('aura-space-vertical')).toBe(true);
  });

  it('should apply wrap class', () => {
    const { container } = render(<Space wrap>X</Space>);
    expect(container.querySelector('div')!.classList.contains('aura-space-wrap')).toBe(true);
  });

  it('should apply align class', () => {
    const { container } = render(<Space align="baseline">X</Space>);
    expect(container.querySelector('div')!.classList.contains('aura-space-align-baseline')).toBe(true);
  });

  it('should set gap from preset size sm', () => {
    const { container } = render(<Space size="sm">X</Space>);
    expect(container.querySelector('div')!.style.gap).toBe('8px');
  });

  it('should set gap from preset size md', () => {
    const { container } = render(<Space size="md">X</Space>);
    expect(container.querySelector('div')!.style.gap).toBe('16px');
  });

  it('should set gap from preset size lg', () => {
    const { container } = render(<Space size="lg">X</Space>);
    expect(container.querySelector('div')!.style.gap).toBe('24px');
  });

  it('should set gap from custom number', () => {
    const { container } = render(<Space size={32}>X</Space>);
    expect(container.querySelector('div')!.style.gap).toBe('32px');
  });

  it('should merge className', () => {
    const { container } = render(<Space className="custom">X</Space>);
    expect(container.querySelector('div')!.classList.contains('custom')).toBe(true);
  });

  it('should merge style', () => {
    const { container } = render(<Space style={{ color: 'red' }}>X</Space>);
    const div = container.querySelector('div')!;
    expect(div.style.color).toBe('red');
  });
});
