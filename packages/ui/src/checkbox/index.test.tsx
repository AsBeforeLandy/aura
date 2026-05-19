import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Checkbox, CheckboxGroup } from './index';

describe('Checkbox', () => {
  // 基础渲染
  it('should render with children', () => {
    render(<Checkbox>同意协议</Checkbox>);
    expect(screen.getByText('同意协议')).toBeDefined();
  });

  // className 包含 aura-checkbox
  it('should have aura-checkbox base class', () => {
    const { container } = render(<Checkbox>选项</Checkbox>);
    const label = container.querySelector('label');
    expect(label?.classList.contains('aura-checkbox')).toBe(true);
  });

  // size 属性生成正确的 className
  it('should apply size class', () => {
    const { container } = render(<Checkbox size="sm">小号</Checkbox>);
    const label = container.querySelector('label');
    expect(label?.classList.contains('aura-checkbox-sm')).toBe(true);
  });

  // 选中状态
  it('should apply checked class', () => {
    const { container } = render(<Checkbox checked>已选</Checkbox>);
    const label = container.querySelector('label');
    expect(label?.classList.contains('aura-checkbox-checked')).toBe(true);
  });

  // 半选状态
  it('should apply indeterminate class', () => {
    const { container } = render(
      <Checkbox checked indeterminate>
        半选
      </Checkbox>,
    );
    const label = container.querySelector('label');
    expect(label?.classList.contains('aura-checkbox-indeterminate')).toBe(true);
  });

  // 禁用状态
  it('should apply disabled class', () => {
    const { container } = render(<Checkbox disabled>禁用</Checkbox>);
    const label = container.querySelector('label');
    expect(label?.classList.contains('aura-checkbox-disabled')).toBe(true);

    const input = container.querySelector('input');
    expect(input?.disabled).toBe(true);
  });

  // 点击触发 onChange
  it('should handle onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Checkbox onChange={onChange}>可点击</Checkbox>,
    );
    fireEvent.click(screen.getByText('可点击'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  // forwardRef 支持
  it('should forward ref to input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Checkbox ref={ref}>Ref</Checkbox>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.type).toBe('checkbox');
  });
});

describe('CheckboxGroup', () => {
  const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '橘子', value: 'orange', disabled: true },
  ];

  // 渲染选项
  it('should render all options', () => {
    render(<CheckboxGroup options={options} />);
    expect(screen.getByText('苹果')).toBeDefined();
    expect(screen.getByText('香蕉')).toBeDefined();
    expect(screen.getByText('橘子')).toBeDefined();
  });

  // 受控值正确标记选中
  it('should mark options as checked based on value', () => {
    const { container } = render(
      <CheckboxGroup options={options} value={['apple']} />,
    );
    const labels = container.querySelectorAll('label');
    expect(labels[0].classList.contains('aura-checkbox-checked')).toBe(true);
    expect(labels[1].classList.contains('aura-checkbox-checked')).toBe(false);
  });

  // 点击触发 onChange
  it('should call onChange when clicking an option', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        options={options}
        value={['apple']}
        onChange={onChange}
      />,
    );

    // 取消选中苹果
    fireEvent.click(screen.getByText('苹果'));
    expect(onChange).toHaveBeenCalledWith([]);

    // 选中香蕉
    fireEvent.click(screen.getByText('香蕉'));
    expect(onChange).toHaveBeenCalledWith(['apple', 'banana']);
  });

  // 方向 class
  it('should apply direction class', () => {
    const { container } = render(
      <CheckboxGroup options={options} direction="vertical" />,
    );
    const group = container.querySelector('.aura-checkbox-group');
    expect(
      group?.classList.contains('aura-checkbox-group-vertical'),
    ).toBe(true);
  });

  // 禁用选项
  it('should disable individual option', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        options={options}
        value={[]}
        onChange={onChange}
      />,
    );

    const orangeLabel = screen.getByText('橘子').closest('label')!;
    expect(
      orangeLabel.classList.contains('aura-checkbox-disabled'),
    ).toBe(true);
  });
});
