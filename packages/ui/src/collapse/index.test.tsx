import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Collapse } from './index';

describe('Collapse', () => {
  // ===== 基础渲染 =====
  it('should render collapse container', () => {
    const { container } = render(
      <Collapse>
        <Collapse.Item itemKey="1" title="面板1">
          内容1
        </Collapse.Item>
      </Collapse>,
    );
    const collapse = container.firstChild as HTMLElement;
    expect(collapse.classList.contains('aura-collapse')).toBe(true);
  });

  it('should render items with titles', () => {
    render(
      <Collapse>
        <Collapse.Item itemKey="1" title="标题1">
          内容1
        </Collapse.Item>
        <Collapse.Item itemKey="2" title="标题2">
          内容2
        </Collapse.Item>
      </Collapse>,
    );
    expect(screen.getByText('标题1')).toBeDefined();
    expect(screen.getByText('标题2')).toBeDefined();
  });

  it('should apply custom className and style', () => {
    const { container } = render(
      <Collapse className="custom-collapse" style={{ maxWidth: 400 }}>
        <Collapse.Item itemKey="1" title="面板">
          内容
        </Collapse.Item>
      </Collapse>,
    );
    const collapse = container.firstChild as HTMLElement;
    expect(collapse.classList.contains('custom-collapse')).toBe(true);
    expect((collapse as HTMLElement).style.maxWidth).toBe('400px');
  });

  // ===== Default 展开 =====
  it('should expand default active keys', () => {
    const { container } = render(
      <Collapse defaultActiveKey="1">
        <Collapse.Item itemKey="1" title="面板1">
          内容1
        </Collapse.Item>
        <Collapse.Item itemKey="2" title="面板2">
          内容2
        </Collapse.Item>
      </Collapse>,
    );
    const item1 = container.querySelectorAll('.aura-collapse-item')[0];
    const item2 = container.querySelectorAll('.aura-collapse-item')[1];
    expect(item1.classList.contains('aura-collapse-item-active')).toBe(true);
    expect(item2.classList.contains('aura-collapse-item-active')).toBe(false);
  });

  it('should expand multiple default active keys', () => {
    const { container } = render(
      <Collapse defaultActiveKey={['1', '2']}>
        <Collapse.Item itemKey="1" title="面板1">
          内容1
        </Collapse.Item>
        <Collapse.Item itemKey="2" title="面板2">
          内容2
        </Collapse.Item>
      </Collapse>,
    );
    const items = container.querySelectorAll('.aura-collapse-item');
    expect(items[0].classList.contains('aura-collapse-item-active')).toBe(true);
    expect(items[1].classList.contains('aura-collapse-item-active')).toBe(true);
  });

  // ===== 交互：展开/收起 =====
  it('should toggle panel on header click', () => {
    const { container } = render(
      <Collapse>
        <Collapse.Item itemKey="1" title="面板1">
          内容1
        </Collapse.Item>
      </Collapse>,
    );

    const item = container.querySelector('.aura-collapse-item')!;
    const header = container.querySelector('.aura-collapse-header')!;

    // 初始未展开
    expect(item.classList.contains('aura-collapse-item-active')).toBe(false);

    // 点击展开
    fireEvent.click(header);
    expect(item.classList.contains('aura-collapse-item-active')).toBe(true);

    // 再次点击收起
    fireEvent.click(header);
    expect(item.classList.contains('aura-collapse-item-active')).toBe(false);
  });

  // ===== onChange 回调 =====
  it('should call onChange with active keys', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Collapse onChange={onChange}>
        <Collapse.Item itemKey="1" title="面板1">
          内容1
        </Collapse.Item>
      </Collapse>,
    );

    const header = container.querySelector('.aura-collapse-header')!;
    fireEvent.click(header);
    expect(onChange).toHaveBeenCalledWith(['1']);

    fireEvent.click(header);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  // ===== 受控模式 =====
  it('should work in controlled mode', () => {
    const { container, rerender } = render(
      <Collapse activeKey={['1']} onChange={() => {}}>
        <Collapse.Item itemKey="1" title="面板1">
          内容1
        </Collapse.Item>
        <Collapse.Item itemKey="2" title="面板2">
          内容2
        </Collapse.Item>
      </Collapse>,
    );

    const items = container.querySelectorAll('.aura-collapse-item');
    expect(items[0].classList.contains('aura-collapse-item-active')).toBe(true);
    expect(items[1].classList.contains('aura-collapse-item-active')).toBe(false);

    // 更新 activeKey
    rerender(
      <Collapse activeKey={['2']} onChange={() => {}}>
        <Collapse.Item itemKey="1" title="面板1">
          内容1
        </Collapse.Item>
        <Collapse.Item itemKey="2" title="面板2">
          内容2
        </Collapse.Item>
      </Collapse>,
    );

    const updatedItems = container.querySelectorAll('.aura-collapse-item');
    expect(updatedItems[0].classList.contains('aura-collapse-item-active')).toBe(false);
    expect(updatedItems[1].classList.contains('aura-collapse-item-active')).toBe(true);
  });

  // ===== Accordion 模式 =====
  it('should only allow one panel open in accordion mode', () => {
    const { container } = render(
      <Collapse accordion>
        <Collapse.Item itemKey="1" title="面板1">
          内容1
        </Collapse.Item>
        <Collapse.Item itemKey="2" title="面板2">
          内容2
        </Collapse.Item>
      </Collapse>,
    );

    const headers = container.querySelectorAll('.aura-collapse-header');

    // 展开第一个
    fireEvent.click(headers[0]);
    const items = container.querySelectorAll('.aura-collapse-item');
    expect(items[0].classList.contains('aura-collapse-item-active')).toBe(true);
    expect(items[1].classList.contains('aura-collapse-item-active')).toBe(false);

    // 展开第二个 → 第一个应收起
    fireEvent.click(headers[1]);
    const updatedItems = container.querySelectorAll('.aura-collapse-item');
    expect(updatedItems[0].classList.contains('aura-collapse-item-active')).toBe(false);
    expect(updatedItems[1].classList.contains('aura-collapse-item-active')).toBe(true);
  });

  // ===== Disabled =====
  it('should not toggle disabled panel', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Collapse onChange={onChange}>
        <Collapse.Item itemKey="1" title="禁用面板" disabled>
          内容
        </Collapse.Item>
      </Collapse>,
    );

    const item = container.querySelector('.aura-collapse-item')!;
    const header = container.querySelector('.aura-collapse-header')!;

    expect(item.classList.contains('aura-collapse-item-disabled')).toBe(true);

    fireEvent.click(header);
    expect(item.classList.contains('aura-collapse-item-active')).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  // ===== 箭头旋转 =====
  it('should rotate arrow when active', () => {
    const { container } = render(
      <Collapse>
        <Collapse.Item itemKey="1" title="面板">
          内容
        </Collapse.Item>
      </Collapse>,
    );

    const arrow = container.querySelector('.aura-collapse-arrow')!;
    expect(arrow.classList.contains('aura-collapse-arrow-active')).toBe(false);

    const header = container.querySelector('.aura-collapse-header')!;
    fireEvent.click(header);
    expect(arrow.classList.contains('aura-collapse-arrow-active')).toBe(true);
  });

  // ===== forwardRef =====
  it('should forward ref to collapse container', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Collapse ref={ref}>
        <Collapse.Item itemKey="1" title="面板">
          内容
        </Collapse.Item>
      </Collapse>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-collapse')).toBe(true);
  });

  // ===== displayName =====
  it('should have correct display names', () => {
    expect(Collapse.displayName).toBe('Collapse');
    expect(Collapse.Item.displayName).toBe('Collapse.Item');
  });

  // ===== Item className & style =====
  it('should apply item custom className and style', () => {
    const { container } = render(
      <Collapse>
        <Collapse.Item
          itemKey="1"
          title="面板"
          className="custom-item"
          style={{ background: 'red' }}
        >
          内容
        </Collapse.Item>
      </Collapse>,
    );
    const item = container.querySelector('.aura-collapse-item') as HTMLElement;
    expect(item.classList.contains('custom-item')).toBe(true);
    expect(item.style.background).toBe('red');
  });

  // ===== aria 属性 =====
  it('should have proper aria attributes', () => {
    const { container } = render(
      <Collapse>
        <Collapse.Item itemKey="1" title="面板">
          内容
        </Collapse.Item>
      </Collapse>,
    );

    const header = container.querySelector('.aura-collapse-header')!;
    expect(header.getAttribute('role')).toBe('button');
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(header.getAttribute('tabindex')).toBe('0');

    // 点击后
    fireEvent.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('true');
  });

  it('should have disabled aria attributes', () => {
    const { container } = render(
      <Collapse>
        <Collapse.Item itemKey="1" title="面板" disabled>
          内容
        </Collapse.Item>
      </Collapse>,
    );

    const header = container.querySelector('.aura-collapse-header')!;
    expect(header.getAttribute('aria-disabled')).toBe('true');
    expect(header.getAttribute('tabindex')).toBe('-1');
  });
});
