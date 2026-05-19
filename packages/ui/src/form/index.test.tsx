import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
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
    const { container } = render(
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
    const { container } = render(
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
    const { container } = render(
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
});
