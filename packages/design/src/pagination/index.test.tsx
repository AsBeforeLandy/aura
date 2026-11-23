import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Pagination } from './index';

/**
 * 打开「每页条数」下拉并点选指定项。
 * 条数选择器使用组件库的 Select（自定义下拉），不能用 fireEvent.change。
 */
function pickPageSize(container: HTMLElement, text: string) {
  const selector = container.querySelector(
    '.aura-pagination-size-changer .aura-select-selector',
  ) as HTMLElement;
  fireEvent.click(selector);
  const option = Array.from(
    container.querySelectorAll('.aura-select-option'),
  ).find((el) => el.textContent?.trim() === text) as HTMLElement | undefined;
  if (!option) throw new Error(`未找到条数选项：${text}`);
  fireEvent.click(option);
}

/** 打开下拉并返回当前渲染的条数选项文案 */
function pageSizeOptionTexts(container: HTMLElement): string[] {
  const selector = container.querySelector(
    '.aura-pagination-size-changer .aura-select-selector',
  ) as HTMLElement;
  fireEvent.click(selector);
  return Array.from(container.querySelectorAll('.aura-select-option')).map(
    (el) => el.textContent?.trim() ?? '',
  );
}

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
      <Pagination
        total={100}
        className="custom-pagination"
        style={{ margin: 10 }}
      />,
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
    expect(prevBtn?.classList.contains('aura-pagination-btn-disabled')).toBe(
      true,
    );
  });

  it('最后一页时下一页按钮应该禁用', () => {
    const { container } = render(
      <Pagination total={100} defaultCurrent={10} />,
    );
    const nextBtn = container.querySelector('.aura-pagination-next');
    expect(nextBtn?.classList.contains('aura-pagination-btn-disabled')).toBe(
      true,
    );
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
    const { container } = render(<Pagination total={100} showSizeChanger />);
    const select = container.querySelector('.aura-pagination-size-changer');
    expect(select).not.toBeNull();
  });

  it('切换每页条数应该触发 onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Pagination total={100} showSizeChanger onChange={onChange} />,
    );
    pickPageSize(container, '20 条/页');
    expect(onChange).toHaveBeenCalledWith(1, 20);
  });

  // ===== Quick Jumper =====
  it('showQuickJumper 应该渲染跳转输入框', () => {
    const { container } = render(<Pagination total={100} showQuickJumper />);
    const input = container.querySelector('.aura-pagination-jumper-input');
    expect(input).not.toBeNull();
  });

  it('在跳转输入框输入页码按回车应该跳转', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Pagination total={100} showQuickJumper onChange={onChange} />,
    );
    const input = container.querySelector(
      '.aura-pagination-jumper-input',
    ) as HTMLInputElement;
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

  // ===== showTotal =====
  it('showTotal 应该收到总条数与当前区间', () => {
    const { container } = render(
      <Pagination
        total={95}
        defaultCurrent={2}
        pageSize={10}
        showTotal={(total, range) =>
          `共 ${total} 条，当前 ${range[0]}-${range[1]}`
        }
      />,
    );
    const totalEl = container.querySelector('.aura-pagination-total');
    expect(totalEl?.textContent).toBe('共 95 条，当前 11-20');
  });

  it('total 为 0 时区间应为 [0, 0]', () => {
    const { container } = render(
      <Pagination
        total={0}
        showTotal={(total, range) => `${total}:${range[0]},${range[1]}`}
      />,
    );
    expect(container.querySelector('.aura-pagination-total')?.textContent).toBe(
      '0:0,0',
    );
  });

  // ===== pageSizeOptions =====
  it('pageSizeOptions 应该自定义条数选项', () => {
    const { container } = render(
      <Pagination total={100} showSizeChanger pageSizeOptions={[5, 15, 30]} />,
    );
    expect(pageSizeOptionTexts(container)).toEqual([
      '5 条/页',
      '15 条/页',
      '30 条/页',
    ]);
  });

  it('未传 pageSizeOptions 时使用默认选项', () => {
    const { container } = render(<Pagination total={100} showSizeChanger />);
    const texts = pageSizeOptionTexts(container);
    expect(texts).toHaveLength(4);
    expect(texts[0]).toBe('10 条/页');
  });

  // ===== onShowSizeChange =====
  it('切换条数时应该触发 onShowSizeChange 与 onChange', () => {
    const onShowSizeChange = vi.fn();
    const onChange = vi.fn();
    const { container } = render(
      <Pagination
        total={100}
        defaultCurrent={3}
        showSizeChanger
        onShowSizeChange={onShowSizeChange}
        onChange={onChange}
      />,
    );
    pickPageSize(container, '50 条/页');
    expect(onShowSizeChange).toHaveBeenCalledWith(3, 50);
    expect(onChange).toHaveBeenCalledWith(1, 50);
  });
});
