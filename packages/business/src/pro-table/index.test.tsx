import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { ProTable } from './index';

const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
];

const createRequest = (
  data: { id: number; name: string }[],
  total = data.length,
  success = true,
) => vi.fn().mockResolvedValue({ data, total, success });

describe('ProTable', () => {
  // ---- 正常 ----
  it('正常：请求数据并渲染单元格', async () => {
    const request = createRequest([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
    const { getByText, container } = render(
      <ProTable columns={columns} request={request} />,
    );
    await waitFor(() => expect(getByText('Alice')).toBeDefined());
    expect(getByText('Bob')).toBeDefined();
    expect(container.querySelector('.aura-pro-table')).not.toBeNull();
  });

  it('正常：渲染标题与工具栏', async () => {
    const request = createRequest([]);
    const { getByText } = render(
      <ProTable
        title="用户列表"
        columns={columns}
        request={request}
        toolbar={<button type="button">新建</button>}
      />,
    );
    expect(getByText('用户列表')).toBeDefined();
    expect(getByText('新建')).toBeDefined();
    await waitFor(() => expect(request).toHaveBeenCalled());
  });

  it('正常：request 收到分页参数', async () => {
    const request = createRequest([]);
    render(
      <ProTable columns={columns} request={request} defaultPageSize={20} />,
    );
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ current: 1, pageSize: 20 }),
      ),
    );
  });

  // ---- 边界 ----
  it('边界：search=false 时不渲染查询区', async () => {
    const request = createRequest([]);
    const { container } = render(
      <ProTable columns={columns} request={request} search={false} />,
    );
    expect(container.querySelector('.aura-search-form')).toBeNull();
    await waitFor(() => expect(request).toHaveBeenCalled());
  });

  it('边界：success=false 时保留列表且不报错', async () => {
    const request = createRequest([], 0, false);
    const { container } = render(
      <ProTable columns={columns} request={request} />,
    );
    await waitFor(() => expect(request).toHaveBeenCalled());
    expect(container.querySelector('.ant-table')).not.toBeNull();
  });

  // ---- 异常 ----
  it('异常：request 抛错时触发 onRequestError', async () => {
    const error = new Error('network error');
    const request = vi.fn().mockRejectedValue(error);
    const onRequestError = vi.fn();
    render(
      <ProTable
        columns={columns}
        request={request}
        onRequestError={onRequestError}
      />,
    );
    await waitFor(() => expect(onRequestError).toHaveBeenCalledWith(error));
  });

  it('异常：未传 onRequestError 时抛错不产生未处理拒绝', async () => {
    const request = vi.fn().mockRejectedValue(new Error('boom'));
    expect(() =>
      render(<ProTable columns={columns} request={request} />),
    ).not.toThrow();
    await waitFor(() => expect(request).toHaveBeenCalled());
  });
});
