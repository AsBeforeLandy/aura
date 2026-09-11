import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { CascaderPanel } from './index';
import type { CascaderOption } from './index';

const TREE: CascaderOption[] = [
  {
    label: '华东',
    value: 'east',
    children: [
      {
        label: '浙江',
        value: 'zj',
        children: [
          { label: '杭州', value: 'hz' },
          { label: '宁波', value: 'nb' },
        ],
      },
      { label: '江苏', value: 'js' },
    ],
  },
  {
    label: '华南',
    value: 'south',
    children: [{ label: '广东', value: 'gd' }],
  },
];

/** 通过文本定位选项行 */
const optionRow = (container: HTMLElement, text: string): HTMLElement =>
  Array.from(container.querySelectorAll('.aura-cascader-panel-option')).find(
    (el) => el.textContent?.includes(text),
  ) as HTMLElement;

const checkboxIn = (row: HTMLElement): HTMLInputElement =>
  row.querySelector('input') as HTMLInputElement;

/** 第 col 列的「全选」checkbox */
const checkAllInput = (container: HTMLElement, col = 0): HTMLInputElement =>
  container.querySelectorAll('.aura-cascader-panel-check-all input')[
    col
  ] as HTMLInputElement;

const lastValues = (onChange: { mock: { calls: any[] } } ) =>
  onChange.mock.calls.at(-1)![0] as string[];

describe('CascaderPanel', () => {
  // ---- 正常 ----
  it('正常：渲染首列选项与全选', () => {
    const { getByText } = render(<CascaderPanel options={TREE} />);
    expect(getByText('华东')).toBeDefined();
    expect(getByText('华南')).toBeDefined();
    expect(getByText('全选')).toBeDefined();
  });

  it('正常：点击选项展开下一列并触发 onCurrentClick', () => {
    const onCurrentClick = vi.fn();
    const { getByText, container } = render(
      <CascaderPanel options={TREE} onCurrentClick={onCurrentClick} />,
    );
    fireEvent.click(getByText('华东'));
    expect(onCurrentClick).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'east' }),
    );
    expect(getByText('浙江')).toBeDefined();
    expect(getByText('江苏')).toBeDefined();
    // 尚未勾选任何值
    expect(checkboxIn(optionRow(container, '华东')).checked).toBe(false);
  });

  it('正常：勾选父级输出最大粒度选项（父级代表整树）', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CascaderPanel options={TREE} onChange={onChange} />,
    );
    fireEvent.click(checkboxIn(optionRow(container, '华东')));
    // 原组件语义：onChange 输出「去重的最大粒度选中项」，
    // 整树选中时由父级代表子孙，避免输出冗余
    expect(lastValues(onChange)).toEqual(['east']);
  });

  it('正常：部分子级勾选时父级呈半选状态', () => {
    const { container } = render(<CascaderPanel options={TREE} />);
    // 展开并勾选「杭州」
    fireEvent.click(optionRow(container, '华东'));
    fireEvent.click(optionRow(container, '浙江'));
    fireEvent.click(checkboxIn(optionRow(container, '杭州')));
    // 华东与浙江均为半选
    expect(checkboxIn(optionRow(container, '华东')).indeterminate).toBe(true);
    expect(checkboxIn(optionRow(container, '浙江')).indeterminate).toBe(true);
  });

  it('正常：受控 value 自动包含子孙值', () => {
    const { container } = render(
      <CascaderPanel options={TREE} value={['east']} />,
    );
    expect(checkboxIn(optionRow(container, '华东')).checked).toBe(true);
    // 展开第二、三级后，子孙格同样呈现选中
    fireEvent.click(optionRow(container, '华东'));
    fireEvent.click(optionRow(container, '浙江'));
    expect(checkboxIn(optionRow(container, '浙江')).checked).toBe(true);
    expect(checkboxIn(optionRow(container, '杭州')).checked).toBe(true);
    expect(checkboxIn(optionRow(container, '江苏')).checked).toBe(true);
  });

  it('正常：渲染首列标题', () => {
    const { getByText } = render(
      <CascaderPanel options={TREE} title="全部大区" />,
    );
    expect(getByText('全部大区')).toBeDefined();
  });

  // ---- 边界 ----
  it('边界：取消一个子级后父级退出选中并转半选', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CascaderPanel options={TREE} value={['east']} onChange={onChange} />,
    );
    // 展开并取消「杭州」
    fireEvent.click(optionRow(container, '华东'));
    fireEvent.click(optionRow(container, '浙江'));
    fireEvent.click(checkboxIn(optionRow(container, '杭州')));
    const values = lastValues(onChange);
    // 半选的父级会被拆解：输出实际勾选的叶子（nb 代表浙江剩余，js 独立叶子）
    expect(values).toEqual(['nb', 'js']);
    expect(checkboxIn(optionRow(container, '华东')).indeterminate).toBe(true);
    expect(checkboxIn(optionRow(container, '浙江')).indeterminate).toBe(true);
  });

  it('边界：列首全选输出最大粒度选项，取消则整体清空', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CascaderPanel options={TREE} onChange={onChange} />,
    );
    fireEvent.click(checkAllInput(container, 0));
    // 整树选中 → 两个顶级父级代表全部子孙
    expect(lastValues(onChange)).toEqual(['east', 'south']);
    fireEvent.click(checkAllInput(container, 0));
    expect(lastValues(onChange)).toEqual([]);
  });

  it('边界：disabled 透传不在此处理，空 options 不渲染列', () => {
    const { container } = render(<CascaderPanel options={[]} />);
    expect(
      container.querySelectorAll('.aura-cascader-panel-column').length,
    ).toBe(0);
  });

  // ---- 异常 ----
  it('异常：未传 onChange 时勾选不崩溃', () => {
    const { container } = render(<CascaderPanel options={TREE} />);
    expect(() =>
      fireEvent.click(checkboxIn(optionRow(container, '华东'))),
    ).not.toThrow();
  });

  it('异常：value 为空数组时首列全部未选中', () => {
    const { container } = render(<CascaderPanel options={TREE} value={[]} />);
    expect(checkboxIn(optionRow(container, '华东')).checked).toBe(false);
    expect(checkboxIn(optionRow(container, '华南')).checked).toBe(false);
  });
});
