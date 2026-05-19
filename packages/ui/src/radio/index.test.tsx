import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Radio, RadioGroup } from './index';

describe('Radio', () => {
  // 基础渲染
  it('should render with children', () => {
    render(<Radio>选项 A</Radio>);
    expect(screen.getByText('选项 A')).toBeDefined();
  });

  // className 包含 aura-radio
  it('should have aura-radio base class', () => {
    const { container } = render(<Radio>选项</Radio>);
    const label = container.querySelector('label');
    expect(label?.classList.contains('aura-radio')).toBe(true);
  });

  // size 属性生成正确的 className
  it('should apply size class', () => {
    const { container } = render(<Radio size="lg">大号</Radio>);
    const label = container.querySelector('label');
    expect(label?.classList.contains('aura-radio-lg')).toBe(true);
  });

  // 选中状态
  it('should apply checked class', () => {
    const { container } = render(<Radio checked>已选</Radio>);
    const label = container.querySelector('label');
    expect(label?.classList.contains('aura-radio-checked')).toBe(true);
  });

  // 禁用状态
  it('should apply disabled class', () => {
    const { container } = render(<Radio disabled>禁用</Radio>);
    const label = container.querySelector('label');
    expect(label?.classList.contains('aura-radio-disabled')).toBe(true);

    const input = container.querySelector('input');
    expect(input?.disabled).toBe(true);
  });

  // 点击触发 onChange
  it('should handle onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Radio onChange={onChange}>可点击</Radio>,
    );
    fireEvent.click(screen.getByText('可点击'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  // forwardRef 支持
  it('should forward ref to input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Radio ref={ref}>Ref</Radio>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.type).toBe('radio');
  });
});

describe('RadioGroup', () => {
  const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '橘子', value: 'orange', disabled: true },
  ];

  // 渲染选项
  it('should render all options', () => {
    render(<RadioGroup options={options} />);
    expect(screen.getByText('苹果')).toBeDefined();
    expect(screen.getByText('香蕉')).toBeDefined();
    expect(screen.getByText('橘子')).toBeDefined();
  });

  // 受控值正确标记选中
  it('should mark the selected option as checked', () => {
    const { container } = render(
      <RadioGroup options={options} value="apple" />,
    );
    const labels = container.querySelectorAll('label');
    expect(labels[0].classList.contains('aura-radio-checked')).toBe(true);
    expect(labels[1].classList.contains('aura-radio-checked')).toBe(false);
  });

  // 点击触发 onChange
  it('should call onChange when clicking an option', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        options={options}
        value="apple"
        onChange={onChange}
      />,
    );

    // 选中香蕉
    fireEvent.click(screen.getByText('香蕉'));
    expect(onChange).toHaveBeenCalledWith('banana');
  });

  // 点击已选中的不会重复触发变化（但 onChange 仍会被调用）
  it('should still allow clicking the selected option', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        options={options}
        value="apple"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText('苹果'));
    expect(onChange).toHaveBeenCalledWith('apple');
  });

  // 方向 class
  it('should apply direction class', () => {
    const { container } = render(
      <RadioGroup options={options} direction="vertical" />,
    );
    const group = container.querySelector('.aura-radio-group');
    expect(group?.classList.contains('aura-radio-group-vertical')).toBe(true);
  });

  // 禁用选项
  it('should disable individual option', () => {
    const { container } = render(
      <RadioGroup options={options} value="" />,
    );
    const orangeLabel = screen.getByText('橘子').closest('label')!;
    expect(orangeLabel.classList.contains('aura-radio-disabled')).toBe(true);
  });

  // 整组禁用
  it('should disable all options when group is disabled', () => {
    const { container } = render(
      <RadioGroup options={options} disabled />,
    );
    const labels = container.querySelectorAll('label');
    labels.forEach((label) => {
      expect(label.classList.contains('aura-radio-disabled')).toBe(true);
    });
  });
});
