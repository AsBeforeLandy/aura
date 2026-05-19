import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Pagination } from './index';

describe('Pagination', () => {
  // ===== 基础渲染 =====
  it('应该正确渲染分页组件', () => {
    const { container } = render(<Pagination total={100} />);
    const pagination = container.firstChild as HTMLElement;
    expect(pagination.classList.contains('aura-pagination')).toBe(true);
  });

  it('应该渲染正确的页码数量', () => {
    // total=100, pageSize=10 → 10页 → 需要 ellipsis
    const { container } = render(<Pagination total={100} pageSize={10} />);
    const buttons = container.querySelectorAll('.aura-pagination-btn');
    // 10页当前第1页: 1 2 3 4 5 ... 10 + prev + next = 6 + 2 = 8 buttons
    expect(buttons.length).toBe(8);
  });

  it('应该应用自定义 className 和 style', () => {
    const { container } = render(
      <Pagination total={100} className="custom-pagination" style={{ margin: 10 }} />,
    );
    const pagination = container.firstChild as HTMLElement;
    expect(pagination.classList.contains('custom-pagination')).toBe(true);
    expect((pagination as HTMLElement).style.margin).toBe('10px');
  });

  it('应该渲染不同尺寸的 className', () => {
    const { container } = render(<Pagination total={100} size="sm" />);
    const pagination = container.firstChild as HTMLElement;
    expect(pagination.classList.contains('aura-pagination-sm')).toBe(true);
  });

  // ===== 页码点击 =====
  it('点击页码应该切换页码', () => {
    const { container, getByText } = render(<Pagination total={100} />);
    fireEvent.click(getByText('3'));
    const activeBtn = container.querySelector('.aura-pagination-btn-active');
    expect(activeBtn?.textContent).toBe('3');
  });

  it('点击页码应该触发 onChange', () => {
    const onChange = vi.fn();
    render(<Pagination total={100} onChange={onChange} />);
    fireEvent.click(screen.getByText('2'));
    expect(onChange).toHaveBeenCalledWith(2, 10);
  });

  // ===== 上一页/下一页 =====
  it('上一页按钮应该正常工作', () => {
    const onChange = vi.fn();
    render(<Pagination total={100} defaultCurrent={3} onChange={onChange} />);
    const prevBtn = screen.getByLabelText('上一页');
    fireEvent.click(prevBtn);
    expect(onChange).toHaveBeenCalledWith(2, 10);
  });

  it('下一页按钮应该正常工作', () => {
    const onChange = vi.fn();
    render(<Pagination total={100} defaultCurrent={3} onChange={onChange} />);
    const nextBtn = screen.getByLabelText('下一页');
    fireEvent.click(nextBtn);
    expect(onChange).toHaveBeenCalledWith(4, 10);
  });

  it('第一页时上一页按钮应该禁用', () => {
    const { container } = render(<Pagination total={100} defaultCurrent={1} />);
    const prevBtn = container.querySelector('.aura-pagination-prev');
    expect(prevBtn?.classList.contains('aura-pagination-btn-disabled')).toBe(true);
  });

  it('最后一页时下一页按钮应该禁用', () => {
    const { container } = render(<Pagination total={100} defaultCurrent={10} />);
    const nextBtn = container.querySelector('.aura-pagination-next');
    expect(nextBtn?.classList.contains('aura-pagination-btn-disabled')).toBe(true);
  });

  // ===== 受控模式 =====
  it('支持受控模式', () => {
    const { container, rerender } = render(
      <Pagination total={100} current={1} />,
    );
    let activeBtn = container.querySelector('.aura-pagination-btn-active');
    expect(activeBtn?.textContent).toBe('1');

    rerender(<Pagination total={100} current={5} />);
    activeBtn = container.querySelector('.aura-pagination-btn-active');
    expect(activeBtn?.textContent).toBe('5');
  });

  // ===== 省略号 =====
  it('超过 7 页时应该显示省略号', () => {
    const { container } = render(<Pagination total={100} defaultCurrent={5} />);
    const ellipses = container.querySelectorAll('.aura-pagination-ellipsis');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  // ===== Size Changer =====
  it('showSizeChanger 应该渲染每页条数选择器', () => {
    const { container } = render(
      <Pagination total={100} showSizeChanger />,
    );
    const select = container.querySelector('.aura-pagination-size-changer');
    expect(select).not.toBeNull();
  });

  it('切换每页条数应该触发 onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Pagination total={100} showSizeChanger onChange={onChange} />,
    );
    const select = container.querySelector('.aura-pagination-size-changer') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '20' } });
    expect(onChange).toHaveBeenCalledWith(1, 20);
  });

  // ===== Quick Jumper =====
  it('showQuickJumper 应该渲染跳转输入框', () => {
    const { container } = render(
      <Pagination total={100} showQuickJumper />,
    );
    const input = container.querySelector('.aura-pagination-jumper-input');
    expect(input).not.toBeNull();
  });

  it('在跳转输入框输入页码按回车应该跳转', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Pagination total={100} showQuickJumper onChange={onChange} />,
    );
    const input = container.querySelector('.aura-pagination-jumper-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(5, 10);
  });

  // ===== forwardRef =====
  it('应该支持 forwardRef', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Pagination total={100} ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-pagination')).toBe(true);
  });

  // ===== displayName =====
  it('应该有正确的 displayName', () => {
    expect(Pagination.displayName).toBe('Pagination');
  });

  // ===== aria 属性 =====
  it('应该有正确的 aria 属性', () => {
    const { container } = render(<Pagination total={100} />);
    const pagination = container.firstChild as HTMLElement;
    expect(pagination.getAttribute('role')).toBe('navigation');
    expect(pagination.getAttribute('aria-label')).toBe('分页');

    const activeBtn = container.querySelector('.aura-pagination-btn-active');
    expect(activeBtn?.getAttribute('aria-current')).toBe('page');
  });
});
