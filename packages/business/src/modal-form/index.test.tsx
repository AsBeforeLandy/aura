import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Form, Input } from 'antd';
import { ModalForm } from './index';

type ModalFormTestProps = React.ComponentProps<typeof ModalForm>;

const renderForm = (props: Partial<ModalFormTestProps> = {}) =>
  render(
    <ModalForm open title="新建用户" {...props}>
      <Form.Item
        name="name"
        label="姓名"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>
    </ModalForm>,
  );

const getInput = (baseElement: HTMLElement) =>
  baseElement.querySelector('input') as HTMLInputElement;

describe('ModalForm', () => {
  // ---- 正常 ----
  it('正常：open 时渲染标题与表单字段', () => {
    const { getByText } = renderForm();
    expect(getByText('新建用户')).toBeDefined();
    expect(getByText('姓名')).toBeDefined();
  });

  it('正常：校验通过后触发 onFinish 并携带表单值', async () => {
    const onFinish = vi.fn();
    const { getByText, baseElement } = renderForm({ onFinish });
    fireEvent.change(getInput(baseElement), { target: { value: 'Alice' } });
    fireEvent.click(getByText(/确\s*定/));
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish.mock.calls[0][0]).toMatchObject({ name: 'Alice' });
  });

  it('正常：点击取消触发 onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    const { getByText } = renderForm({ onOpenChange });
    fireEvent.click(getByText(/取\s*消/));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  // ---- 边界 ----
  it('边界：自定义按钮文案生效', () => {
    const { getByText } = renderForm({ okText: '提交', cancelText: '返回' });
    expect(getByText(/提\s*交/)).toBeDefined();
    expect(getByText(/返\s*回/)).toBeDefined();
  });

  it('边界：open=false 时不渲染表单字段', () => {
    const { queryByText } = render(
      <ModalForm open={false} title="隐藏">
        <Form.Item name="name" label="姓名">
          <Input />
        </Form.Item>
      </ModalForm>,
    );
    expect(queryByText('姓名')).toBeNull();
  });

  // ---- 异常 ----
  it('异常：校验失败时不触发 onFinish', async () => {
    const onFinish = vi.fn();
    const { getByText } = renderForm({ onFinish });
    fireEvent.click(getByText(/确\s*定/));
    await waitFor(() => expect(getByText('请输入姓名')).toBeDefined());
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('异常：onFinish 抛错时不关闭弹窗', async () => {
    const onOpenChange = vi.fn();
    const onFinish = vi.fn().mockRejectedValue(new Error('submit failed'));
    const { getByText, baseElement } = renderForm({ onFinish, onOpenChange });
    fireEvent.change(getInput(baseElement), { target: { value: 'Bob' } });
    fireEvent.click(getByText(/确\s*定/));
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
