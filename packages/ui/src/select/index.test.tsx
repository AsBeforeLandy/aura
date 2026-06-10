import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Select } from './index';

const fruitOptions = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange', disabled: true },
];

describe('Select', () => {
  // 基础渲染
  it('should render with placeholder', () => {
    render(<Select options={fruitOptions} placeholder="请选择水果" />);
    expect(screen.getByText('请选择水果')).toBeDefined();
  });

  // className 包含 aura-select
  it('should have aura-select base class', () => {
    const { container } = render(<Select options={fruitOptions} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('aura-select')).toBe(true);
  });

  // variant 属性生成正确的 className
  it('should apply variant class', () => {
    const { container } = render(
      <Select options={fruitOptions} variant="filled" />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('aura-select-filled')).toBe(true);
  });

  // size 属性生成正确的 className
  it('should apply size class', () => {
    const { container } = render(
      <Select options={fruitOptions} size="lg" />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('aura-select-lg')).toBe(true);
  });

  // disabled 状态
  it('should apply disabled class and not open on click', () => {
    const { container } = render(
      <Select options={fruitOptions} disabled />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('aura-select-disabled')).toBe(true);

    const selector = container.querySelector('.aura-select-selector');
    fireEvent.click(selector!);
    // 下拉面板不应出现
    expect(container.querySelector('.aura-select-dropdown')).toBeNull();
  });

  // 点击展开下拉面板
  it('should toggle dropdown on click', () => {
    const { container } = render(<Select options={fruitOptions} />);
    const selector = container.querySelector('.aura-select-selector');

    // 初始关闭
    expect(container.querySelector('.aura-select-dropdown')).toBeNull();

    // 点击打开
    fireEvent.click(selector!);
    expect(container.querySelector('.aura-select-dropdown')).not.toBeNull();
    expect(screen.getByText('苹果')).toBeDefined();

    // 再次点击关闭
    fireEvent.click(selector!);
    expect(container.querySelector('.aura-select-dropdown')).toBeNull();
  });

  // 选择选项（单选）
  it('should select an option and call onChange (single)', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Select options={fruitOptions} onChange={onChange} />,
    );

    // 打开下拉
    fireEvent.click(container.querySelector('.aura-select-selector')!);

    // 选择苹果
    fireEvent.click(screen.getByText('苹果'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('apple');
  });

  // 选中后显示标签
  it('should display selected option label', () => {
    const { container, rerender } = render(
      <Select options={fruitOptions} value="banana" />,
    );
    expect(screen.getByText('香蕉')).toBeDefined();
    expect(screen.queryByText('香蕉')).not.toBeNull();
  });

  // 多选模式
  it('should support multiple selection', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Select
        options={fruitOptions}
        multiple
        value={[]}
        onChange={onChange}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('aura-select-multiple')).toBe(true);

    // 打开下拉
    fireEvent.click(container.querySelector('.aura-select-selector')!);

    // 选择苹果
    fireEvent.click(screen.getByText('苹果'));
    expect(onChange).toHaveBeenCalledWith(['apple']);
  });

  // clearable 清除
  it('should clear value when clearable', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Select
        options={fruitOptions}
        value="apple"
        clearable
        onChange={onChange}
      />,
    );

    const clearBtn = container.querySelector('.aura-select-clear');
    expect(clearBtn).not.toBeNull();

    fireEvent.click(clearBtn!);
    expect(onChange).toHaveBeenCalledWith('');
  });

  // searchable 搜索过滤
  it('should filter options when searchable', () => {
    const { container } = render(
      <Select options={fruitOptions} searchable />,
    );

    // 打开下拉
    fireEvent.click(container.querySelector('.aura-select-selector')!);

    const input = container.querySelector(
      '.aura-select-search-input',
    ) as HTMLInputElement;
    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: '苹果' } });
    // 应该只显示苹果
    expect(screen.getByText('苹果')).toBeDefined();
    expect(screen.queryByText('香蕉')).toBeNull();
  });

  // disabled 选项不可选
  it('should not select disabled option', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Select options={fruitOptions} onChange={onChange} />,
    );

    fireEvent.click(container.querySelector('.aura-select-selector')!);

    const orangeOption = screen.getByText('橘子').closest(
      '.aura-select-option',
    )!;
    expect(
      orangeOption.classList.contains('aura-select-option-disabled'),
    ).toBe(true);

    fireEvent.click(orangeOption);
    expect(onChange).not.toHaveBeenCalled();
  });

  // loading 状态
  it('should show loading state', () => {
    const { container } = render(
      <Select options={fruitOptions} loading />,
    );

    fireEvent.click(container.querySelector('.aura-select-selector')!);
    expect(screen.getByText('加载中...')).toBeDefined();
    // 加载时不显示选项
    expect(screen.queryByText('苹果')).toBeNull();
  });

  // 键盘交互
  it('should open/close with keyboard', () => {
    const { container } = render(<Select options={fruitOptions} />);
    const selector = container.querySelector(
      '.aura-select-selector',
    ) as HTMLElement;

    // Enter 打开
    fireEvent.keyDown(selector, { key: 'Enter' });
    expect(container.querySelector('.aura-select-dropdown')).not.toBeNull();

    // Escape 关闭
    fireEvent.keyDown(selector, { key: 'Escape' });
    expect(container.querySelector('.aura-select-dropdown')).toBeNull();
  });

  it('should navigate and select options with keyboard arrow keys', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Select options={fruitOptions} onChange={onChange} />,
    );
    const selector = container.querySelector(
      '.aura-select-selector',
    ) as HTMLElement;

    expect(container.querySelector('.aura-select-dropdown')).toBeNull();

    // 1. 按 ArrowDown 展开下拉面板
    fireEvent.keyDown(selector, { key: 'ArrowDown' });
    expect(container.querySelector('.aura-select-dropdown')).not.toBeNull();

    // 2. 再次按 ArrowDown，应该聚焦到第一个选项（苹果）
    fireEvent.keyDown(selector, { key: 'ArrowDown' });
    let options = container.querySelectorAll('.aura-select-option');
    expect(options[0].classList.contains('aura-select-option-active')).toBe(true);

    // 3. 再次按 ArrowDown，应该聚焦到第二个选项（香蕉）
    fireEvent.keyDown(selector, { key: 'ArrowDown' });
    expect(options[0].classList.contains('aura-select-option-active')).toBe(false);
    expect(options[1].classList.contains('aura-select-option-active')).toBe(true);

    // 4. 再次按 ArrowDown，第三个是 disabled，所以应该循环回到第一个（苹果）
    fireEvent.keyDown(selector, { key: 'ArrowDown' });
    expect(options[0].classList.contains('aura-select-option-active')).toBe(true);
    expect(options[1].classList.contains('aura-select-option-active')).toBe(false);

    // 5. 按 Enter 选中当前高亮的第一个选项（苹果）
    fireEvent.keyDown(selector, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('apple');
    expect(container.querySelector('.aura-select-dropdown')).toBeNull();
  });
});
