import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { Form } from './index';

const FormComponent = Form as unknown as React.FC<any> & { Item: any };

describe('Form', () => {
  it('应该正确渲染 Form 和 FormItem', () => {
    const { getByText } = render(
      <FormComponent>
        <FormComponent.Item label="用户名">
          <input data-testid="username" />
        </FormComponent.Item>
      </FormComponent>,
    );
    expect(getByText('用户名')).toBeDefined();
  });

  it('提交时应触发 onFinish', async () => {
    const onFinish = vi.fn();
    render(
      <FormComponent onFinish={onFinish} initialValues={{ name: '测试' }}>
        <FormComponent.Item name="name" label="名称">
          <input />
        </FormComponent.Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );

    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ name: '测试' });
    });
  });

  it('必填验证应显示错误信息', async () => {
    const onFinish = vi.fn();
    const onFinishFailed = vi.fn();
    render(
      <FormComponent onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <FormComponent.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
          <input value="" onChange={() => {}} />
        </FormComponent.Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );

    fireEvent.click(screen.getByText('提交'));

    await waitFor(() => {
      expect(onFinishFailed).toHaveBeenCalled();
      expect(screen.getByText('请输入邮箱')).toBeDefined();
    });

    expect(onFinish).not.toHaveBeenCalled();
  });

  it('pattern 验证应正常工作', async () => {
    const onFinish = vi.fn();
    const onFinishFailed = vi.fn();
    render(
      <FormComponent
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{ phone: 'abc' }}
      >
        <FormComponent.Item
          name="phone"
          label="手机号"
          rules={[{ pattern: /^1\d{10}$/, message: '手机号格式不正确' }]}
        >
          <input />
        </FormComponent.Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );

    fireEvent.click(screen.getByText('提交'));

    await waitFor(() => {
      expect(onFinishFailed).toHaveBeenCalled();
      expect(screen.getByText('手机号格式不正确')).toBeDefined();
    });
  });

  it('layout=vertical 时垂直排列', () => {
    const { container } = render(
      <FormComponent layout="vertical">
        <FormComponent.Item label="名称">
          <input />
        </FormComponent.Item>
      </FormComponent>,
    );
    const form = container.querySelector('form') as HTMLElement;
    expect(form.classList.contains('aura-form-vertical')).toBe(true);
  });

  it('layout=horizontal 时水平排列', () => {
    const { container } = render(
      <FormComponent layout="horizontal">
        <FormComponent.Item label="名称">
          <input />
        </FormComponent.Item>
      </FormComponent>,
    );
    const form = container.querySelector('form') as HTMLElement;
    expect(form.classList.contains('aura-form-horizontal')).toBe(true);
  });

  it('layout=inline 时行内排列', () => {
    const { container } = render(
      <FormComponent layout="inline">
        <FormComponent.Item label="名称">
          <input />
        </FormComponent.Item>
      </FormComponent>,
    );
    const form = container.querySelector('form') as HTMLElement;
    expect(form.classList.contains('aura-form-inline')).toBe(true);
  });

  it('required 的 label 前应显示红色星号', () => {
    const { container } = render(
      <FormComponent>
        <FormComponent.Item label="必填项" required>
          <input />
        </FormComponent.Item>
      </FormComponent>,
    );
    const star = container.querySelector('.aura-form-item-required-star');
    expect(star).toBeDefined();
    expect(star?.textContent).toBe('*');
  });

  it('FormItem 应该支持自定义 className', () => {
    const { container } = render(
      <FormComponent>
        <FormComponent.Item label="名称" className="custom-item">
          <input />
        </FormComponent.Item>
      </FormComponent>,
    );
    const item = container.querySelector('.aura-form-item') as HTMLElement;
    expect(item.classList.contains('custom-item')).toBe(true);
  });

  it('应该应用 Form 的自定义 className 和 style', () => {
    const { container } = render(
      <FormComponent className="custom-form" style={{ marginTop: 10 }}>
        <FormComponent.Item label="名称">
          <input />
        </FormComponent.Item>
      </FormComponent>,
    );
    const form = container.querySelector('form') as HTMLElement;
    expect(form.classList.contains('custom-form')).toBe(true);
    expect((form as HTMLElement).style.marginTop).toBe('10px');
  });

  it('应该兼容使用 checked 属性和 boolean onChange 的 Switch 组件', async () => {
    const onFinish = vi.fn();
    const MockSwitch: React.FC<any> = ({ checked, onChange }) => (
      <button data-testid="switch" onClick={() => onChange?.(!checked)}>
        {checked ? 'ON' : 'OFF'}
      </button>
    );
    MockSwitch.displayName = 'Switch';

    render(
      <FormComponent onFinish={onFinish} initialValues={{ status: true }}>
        <FormComponent.Item name="status" label="状态">
          <MockSwitch />
        </FormComponent.Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );

    const button = screen.getByTestId('switch');
    expect(button.textContent).toBe('ON');

    fireEvent.click(button);
    expect(button.textContent).toBe('OFF');

    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ status: false });
    });
  });

  it('应该兼容直接传递 value 的自定义 Select 组件', async () => {
    const onFinish = vi.fn();
    const MockSelect: React.FC<any> = ({ value, onChange }) => (
      <button data-testid="select" onClick={() => onChange?.('b')}>
        {value}
      </button>
    );

    render(
      <FormComponent onFinish={onFinish} initialValues={{ choice: 'a' }}>
        <FormComponent.Item name="choice" label="选择">
          <MockSelect />
        </FormComponent.Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );

    const btn = screen.getByTestId('select');
    expect(btn.textContent).toBe('a');

    fireEvent.click(btn);
    expect(btn.textContent).toBe('b');

    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ choice: 'b' });
    });
  });

  // ===== Form.useForm / FormInstance =====
  it('setFieldsValue 应该回填字段值（编辑表单场景）', () => {
    const [form] = Form.useForm();
    render(
      <Form form={form} initialValues={{ username: '' }}>
        <Form.Item name="username" label="用户名">
          <input data-testid="username" />
        </Form.Item>
      </Form>,
    );
    const input = screen.getByTestId('username') as HTMLInputElement;

    act(() => {
      form.setFieldsValue({ username: 'landy' });
    });
    expect(input.value).toBe('landy');
    expect(form.getFieldValue('username')).toBe('landy');
    expect(form.getFieldsValue()).toEqual({ username: 'landy' });
  });

  it('getFieldValue 在 setFieldsValue 后应同步可读最新值', () => {
    const [form] = Form.useForm();
    render(
      <Form form={form}>
        <Form.Item name="age">
          <input data-testid="age" />
        </Form.Item>
      </Form>,
    );
    act(() => {
      form.setFieldValue('age', 18);
    });
    expect(form.getFieldValue('age')).toBe(18);
  });

  it('validateFields 通过时应 resolve 全部字段值', async () => {
    const [form] = Form.useForm();
    render(
      <Form form={form}>
        <Form.Item name="username" rules={[{ required: true }]}>
          <input data-testid="username" />
        </Form.Item>
      </Form>,
    );
    fireEvent.change(screen.getByTestId('username'), {
      target: { value: 'landy' },
    });

    await expect(form.validateFields()).resolves.toEqual({ username: 'landy' });
  });

  it('validateFields 失败时应 reject FormError[]', async () => {
    const [form] = Form.useForm();
    render(
      <Form form={form}>
        <Form.Item name="username" rules={[{ required: true, message: '必填' }]}>
          <input data-testid="username" />
        </Form.Item>
      </Form>,
    );

    await expect(form.validateFields()).rejects.toEqual([
      { name: 'username', errors: ['必填'] },
    ]);
  });

  it('validateFields 支持只校验指定字段', async () => {
    const [form] = Form.useForm();
    render(
      <Form form={form}>
        <Form.Item name="a" rules={[{ required: true }]}>
          <input data-testid="field-a" />
        </Form.Item>
        <Form.Item name="b" rules={[{ required: true }]}>
          <input data-testid="field-b" />
        </Form.Item>
      </Form>,
    );
    fireEvent.change(screen.getByTestId('field-a'), {
      target: { value: 'ok' },
    });

    // 只校验 a：b 的必填错误不应出现
    await expect(form.validateFields(['a'])).resolves.toHaveProperty('a', 'ok');
  });

  it('resetFields 应该恢复 initialValues 并清空错误', async () => {
    const [form] = Form.useForm();
    render(
      <Form form={form} initialValues={{ username: '初始' }}>
        <Form.Item name="username" rules={[{ required: true, message: '必填' }]}>
          <input data-testid="username" />
        </Form.Item>
      </Form>,
    );
    const input = screen.getByTestId('username') as HTMLInputElement;

    // 先制造错误状态：置空后校验失败
    act(() => {
      form.setFieldsValue({ username: '' });
    });
    await expect(form.validateFields()).rejects.toBeTruthy();

    act(() => {
      form.resetFields();
    });
    expect(input.value).toBe('初始');
    expect(form.getFieldsValue()).toEqual({ username: '初始' });
    // 重置后校验应通过（错误已清空）
    await expect(form.validateFields()).resolves.toEqual({ username: '初始' });
  });

  it('外部提交按钮可以通过实例触发完整校验流程', async () => {
    const [form] = Form.useForm();
    const onFinish = vi.fn();
    render(
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="username" rules={[{ required: true }]}>
          <input data-testid="username" />
        </Form.Item>
      </Form>,
    );
    fireEvent.change(screen.getByTestId('username'), {
      target: { value: 'landy' },
    });

    const values = await form.validateFields();
    expect(values).toEqual({ username: 'landy' });
    expect(onFinish).not.toHaveBeenCalled(); // validateFields 不触发 onFinish，提交仍由表单触发
  });
});
