import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Avatar, AvatarGroup } from './index';

describe('Avatar', () => {
  it('should render with text children', () => {
    const { getByText } = render(<Avatar>A</Avatar>);
    expect(getByText('A')).toBeDefined();
  });

  it('should render default className', () => {
    const { container } = render(<Avatar>A</Avatar>);
    const avatar = container.firstChild as HTMLSpanElement;
    expect(avatar.classList.contains('aura-avatar')).toBe(true);
  });

  it('should render circle shape by default', () => {
    const { container } = render(<Avatar>A</Avatar>);
    const avatar = container.firstChild as HTMLSpanElement;
    expect(avatar.classList.contains('aura-avatar-circle')).toBe(true);
  });

  it('should render square shape', () => {
    const { container } = render(<Avatar shape="square">A</Avatar>);
    const avatar = container.firstChild as HTMLSpanElement;
    expect(avatar.classList.contains('aura-avatar-square')).toBe(true);
  });

  it('should render primary variant', () => {
    const { container } = render(<Avatar variant="primary">A</Avatar>);
    const avatar = container.firstChild as HTMLSpanElement;
    expect(avatar.classList.contains('aura-avatar-primary')).toBe(true);
  });

  it('should render image when src provided', () => {
    const { container } = render(
      <Avatar src="https://example.com/avatar.jpg" alt="头像" />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/avatar.jpg');
  });

  it('should show fallback when image fails to load', () => {
    const { container } = render(
      <Avatar src="https://example.com/broken.jpg">U</Avatar>,
    );
    const img = container.querySelector('img') as HTMLImageElement;

    // 模拟加载失败
    fireEvent.error(img);

    // 图片应消失，文字回退应显示
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.aura-avatar-img-failed')).not.toBeNull();
  });

  it('should apply size via inline style', () => {
    const { container } = render(<Avatar size={64}>A</Avatar>);
    const avatar = container.firstChild as HTMLSpanElement;
    expect(avatar.style.width).toBe('64px');
    expect(avatar.style.height).toBe('64px');
  });

  it('should apply preset size', () => {
    const { container } = render(<Avatar size="lg">A</Avatar>);
    const avatar = container.firstChild as HTMLSpanElement;
    expect(avatar.style.width).toBe('40px');
    expect(avatar.style.height).toBe('40px');
  });

  it('should merge custom className', () => {
    const { container } = render(<Avatar className="custom">A</Avatar>);
    const avatar = container.firstChild as HTMLSpanElement;
    expect(avatar.classList.contains('custom')).toBe(true);
  });

  it('should support all preset sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    const expectedPixels = { sm: 24, md: 32, lg: 40 };
    sizes.forEach((size) => {
      const { unmount, container } = render(<Avatar size={size}>A</Avatar>);
      const avatar = container.firstChild as HTMLSpanElement;
      expect(avatar.style.width).toBe(`${expectedPixels[size]}px`);
      unmount();
    });
  });
});

describe('AvatarGroup', () => {
  it('should render children avatars', () => {
    const { getByText } = render(
      <AvatarGroup>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
      </AvatarGroup>,
    );
    expect(getByText('A')).toBeDefined();
    expect(getByText('B')).toBeDefined();
    expect(getByText('C')).toBeDefined();
  });

  it('should render group container with className', () => {
    const { container } = render(
      <AvatarGroup className="custom-group">
        <Avatar>A</Avatar>
      </AvatarGroup>,
    );
    const group = container.firstChild as HTMLDivElement;
    expect(group.classList.contains('aura-avatar-group')).toBe(true);
    expect(group.classList.contains('custom-group')).toBe(true);
  });

  it('should show overflow indicator when maxCount exceeded', () => {
    const { getByText } = render(
      <AvatarGroup maxCount={2}>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
        <Avatar>D</Avatar>
      </AvatarGroup>,
    );
    // 只显示前 2 个 + 溢出指示器
    expect(getByText('A')).toBeDefined();
    expect(getByText('B')).toBeDefined();
    expect(getByText('+2')).toBeDefined();
  });

  it('should pass size and shape to children', () => {
    const { container } = render(
      <AvatarGroup size="sm" shape="square">
        <Avatar>A</Avatar>
      </AvatarGroup>,
    );
    const avatar = container.querySelector('.aura-avatar') as HTMLSpanElement;
    expect(avatar.classList.contains('aura-avatar-square')).toBe(true);
    expect(avatar.style.width).toBe('24px');
  });
});
