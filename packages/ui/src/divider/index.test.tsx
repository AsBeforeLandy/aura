import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Divider } from './index';

describe('Divider', () => {
  it('should render horizontal divider by default', () => {
    const { container } = render(<Divider />);
    const div = container.querySelector('div')!;
    expect(div.classList.contains('aura-divider')).toBe(true);
    expect(div.classList.contains('aura-divider-horizontal')).toBe(true);
  });

  it('should render with separator role', () => {
    const { container } = render(<Divider />);
    expect(container.querySelector('div')!.getAttribute('role')).toBe('separator');
  });

  it('should render vertical divider', () => {
    const { container } = render(<Divider direction="vertical" />);
    const div = container.querySelector('div')!;
    expect(div.classList.contains('aura-divider-vertical')).toBe(true);
    expect(div.classList.contains('aura-divider-horizontal')).toBe(false);
  });

  it('should apply dashed variant for horizontal', () => {
    const { container } = render(<Divider variant="dashed" />);
    expect(container.querySelector('div')!.classList.contains('aura-divider-dashed')).toBe(true);
  });

  it('should apply dashed variant for vertical', () => {
    const { container } = render(<Divider direction="vertical" variant="dashed" />);
    expect(container.querySelector('div')!.classList.contains('aura-divider-dashed')).toBe(true);
  });

  it('should not add with-text class when no children', () => {
    const { container } = render(<Divider />);
    expect(container.querySelector('div')!.classList.contains('aura-divider-with-text')).toBe(false);
  });

  it('should show text with default center orientation', () => {
    const { getByText, container } = render(<Divider>中间</Divider>);
    const div = container.querySelector('div')!;
    expect(getByText('中间')).toBeDefined();
    expect(div.classList.contains('aura-divider-with-text')).toBe(true);
    expect(div.classList.contains('aura-divider-with-text-center')).toBe(true);
  });

  it('should show text with left orientation', () => {
    const { container } = render(<Divider orientation="left">左边</Divider>);
    const div = container.querySelector('div')!;
    expect(div.classList.contains('aura-divider-with-text-left')).toBe(true);
  });

  it('should show text with right orientation', () => {
    const { container } = render(<Divider orientation="right">右边</Divider>);
    const div = container.querySelector('div')!;
    expect(div.classList.contains('aura-divider-with-text-right')).toBe(true);
  });

  it('should not show text for vertical divider even with children', () => {
    const { container } = render(<Divider direction="vertical">忽略</Divider>);
    expect(container.querySelector('.aura-divider-with-text')).toBeNull();
    expect(container.querySelector('.aura-divider-inner-text')).toBeNull();
  });

  it('should merge className', () => {
    const { container } = render(<Divider className="custom" />);
    expect(container.querySelector('div')!.classList.contains('custom')).toBe(true);
  });

  it('should merge style', () => {
    const { container } = render(<Divider style={{ color: 'red' }} />);
    expect(container.querySelector('div')!.style.color).toBe('red');
  });

  it('should combine dashed and with-text classes', () => {
    const { container } = render(
      <Divider variant="dashed" orientation="left">
        带文字虚线
      </Divider>,
    );
    const div = container.querySelector('div')!;
    expect(div.classList.contains('aura-divider-dashed')).toBe(true);
    expect(div.classList.contains('aura-divider-with-text')).toBe(true);
    expect(div.classList.contains('aura-divider-with-text-left')).toBe(true);
  });
});
