import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SearchForm } from './index';
import type { SearchField } from './index';

/**
 * 注：antd Button 会在两个汉字之间插入空格（"查询" → "查 询"），
 * 因此按钮文案统一用正则匹配。
 */
const fields: SearchField[] = [
  { name: 'keyword', label: '关键词', type: 'input' },
  { name: 'status', label: '状态', type: 'select' },
  { name: 'age', label: '年龄', type: 'number' },
  { name: 'createdAt', label: '创建日期', type: 'date' },
];

describe('SearchForm', () => {
  // ---- 正常 ----
  it('正常：渲染「查询」「重置」按钮', () => {
    const { getByText } = render(<SearchForm fields={fields} />);
    expect(getByText(/查\s*询/)).toBeDefined();
    expect(getByText(/重\s*置/)).toBeDefined();
  });

  it('正常：点击查询触发 onSearch', async () => {
    const onSearch = vi.fn();
    const { getByText } = render(
      <SearchForm fields={fields} onSearch={onSearch} />,
    );
    fireEvent.click(getByText(/查\s*询/));
    await waitFor(() => expect(onSearch).toHaveBeenCalledTimes(1));
  });

  it('正常：点击重置触发 onReset', async () => {
    const onReset = vi.fn();
    const { getByText } = render(
      <SearchForm fields={fields} onReset={onReset} />,
    );
    fireEvent.click(getByText(/重\s*置/));
    await waitFor(() => expect(onReset).toHaveBeenCalledTimes(1));
  });

  it('正常：自定义按钮文案生效', () => {
    const { getByText } = render(
      <SearchForm fields={fields} submitText="搜索" resetText="清空" />,
    );
    expect(getByText(/搜\s*索/)).toBeDefined();
    expect(getByText(/清\s*空/)).toBeDefined();
  });

  // ---- 边界 ----
  it('边界：字段数超过 collapseAfter 时显示「展开」', () => {
    const { getByText } = render(
      <SearchForm fields={fields} collapseAfter={2} />,
    );
    expect(getByText(/展\s*开/)).toBeDefined();
  });

  it('边界：字段数未超过 collapseAfter 时不显示「展开」', () => {
    const { queryByText } = render(
      <SearchForm fields={fields.slice(0, 2)} collapseAfter={3} />,
    );
    expect(queryByText(/展\s*开/)).toBeNull();
  });

  it('边界：折叠时隐藏多余字段，展开后显示', () => {
    const { getByText, queryByText } = render(
      <SearchForm fields={fields} collapseAfter={2} />,
    );
    expect(queryByText('创建日期')).toBeNull();
    fireEvent.click(getByText(/展\s*开/));
    expect(getByText('创建日期')).toBeDefined();
    expect(getByText(/收\s*起/)).toBeDefined();
  });

  it('边界：defaultCollapsed=false 时默认展开全部字段', () => {
    const { getByText, queryByText } = render(
      <SearchForm fields={fields} collapseAfter={2} defaultCollapsed={false} />,
    );
    expect(getByText('创建日期')).toBeDefined();
    expect(queryByText(/展\s*开/)).toBeNull();
  });

  it('边界：custom 类型走 render 自定义渲染', () => {
    const customFields: SearchField[] = [
      {
        name: 'custom',
        label: '自定义',
        type: 'custom',
        render: () => <span data-testid="custom-node">custom</span>,
      },
    ];
    const { getByTestId } = render(<SearchForm fields={customFields} />);
    expect(getByTestId('custom-node')).toBeDefined();
  });

  // ---- 异常 ----
  it('异常：fields 为空数组时不崩溃', () => {
    expect(() => render(<SearchForm fields={[]} />)).not.toThrow();
  });

  it('异常：未传 onSearch 时点击查询不崩溃', async () => {
    const { getByText } = render(<SearchForm fields={fields} />);
    expect(() => fireEvent.click(getByText(/查\s*询/))).not.toThrow();
    await waitFor(() => expect(getByText(/查\s*询/)).toBeDefined());
  });
});
