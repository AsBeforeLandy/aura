import { describe, it, expect, vi } from 'vitest';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
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
        <FormComponent.Item
          name="email"
          label="邮箱"
          rules={[{ required: true, message: '请输入邮箱' }]}
        >
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
        <Form.Item
          name="username"
          rules={[{ required: true, message: '必填' }]}
        >
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
        <Form.Item
          name="username"
          rules={[{ required: true, message: '必填' }]}
        >
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

/* ===== 新增能力：嵌套路径 / onValuesChange / dependencies / useWatch 等 ===== */

describe('Form 新能力（antd 对齐）', () => {
  const Item = Form.Item as unknown as React.FC<any>;

  it('嵌套点路径：name="user.name" 读写嵌套值', async () => {
    const [form] = (Form as any).useForm();
    render(
      <FormComponent form={form}>
        <Item name="user.name" label="姓名">
          <input />
        </Item>
      </FormComponent>,
    );
    act(() => {
      form.setFieldValue('user.name', 'landy');
    });
    expect(form.getFieldValue('user.name')).toBe('landy');
    expect(form.getFieldsValue()).toEqual({ user: { name: 'landy' } });
    form.resetFields();
    expect(form.getFieldValue('user.name')).toBeUndefined();
  });

  it('onValuesChange 在字段值变化时触发', () => {
    const onValuesChange = vi.fn();
    render(
      <FormComponent onValuesChange={onValuesChange}>
        <Item name="name">
          <input />
        </Item>
      </FormComponent>,
    );
    fireEvent.change(document.querySelector('input')!, {
      target: { value: 'x' },
    });
    expect(onValuesChange).toHaveBeenCalled();
    const call = onValuesChange.mock.calls[0][0];
    expect(call).toEqual({ name: 'name', value: 'x' });
  });

  it('dependencies：依赖字段变化时重新校验自身', async () => {
    const onFinish = vi.fn();
    const { container } = render(
      <FormComponent onFinish={onFinish}>
        <Item name="password" label="密码">
          <input />
        </Item>
        <Item
          name="confirm"
          label="确认密码"
          dependencies={['password']}
          rules={[
            {
              validator: (rule: any, value: unknown) => {
                const pwd = container.querySelectorAll('input')[0].value;
                if (value !== pwd)
                  return Promise.reject(new Error('两次密码不一致'));
                return Promise.resolve();
              },
            },
          ]}
        >
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    const inputs = container.querySelectorAll('input');
    // 先都填一致
    fireEvent.change(inputs[0], { target: { value: '123' } });
    fireEvent.change(inputs[1], { target: { value: '123' } });
    // 改密码后 confirm 应被重校验并报错
    fireEvent.change(inputs[0], { target: { value: '456' } });
    await waitFor(() => {
      expect(container.textContent).toContain('两次密码不一致');
    });
  });

  it('help 覆盖校验错误，extra 独立展示', () => {
    const { container } = render(
      <FormComponent>
        <Item
          name="nick"
          label="昵称"
          help="自定义帮助"
          extra="不超过 10 个字符"
          rules={[{ required: true, message: '必填' }]}
        >
          <input />
        </Item>
      </FormComponent>,
    );
    expect(container.textContent).toContain('自定义帮助');
    expect(container.textContent).toContain('不超过 10 个字符');
    expect(container.textContent).not.toContain('必填');
  });

  it('validateStatus 手动指定状态类', () => {
    const { container } = render(
      <FormComponent>
        <Item name="s" label="状态" validateStatus="warning" help="warn">
          <input />
        </Item>
      </FormComponent>,
    );
    expect(
      container
        .querySelector('.aura-form-item')!
        .classList.contains('aura-form-item-warning'),
    ).toBe(true);
  });

  it('normalize：输入值写入前规范化（去空格转大写）', () => {
    const { container } = render(
      <FormComponent>
        <Item
          name="code"
          label="编码"
          normalize={(v: unknown) => String(v).trim().toUpperCase()}
        >
          <input />
        </Item>
      </FormComponent>,
    );
    fireEvent.change(container.querySelector('input')!, {
      target: { value: '  abc  ' },
    });
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('ABC');
  });

  it('getValueFromEvent：自定义从事件取值', () => {
    const [form] = (Form as any).useForm();
    const { container } = render(
      <FormComponent form={form}>
        <Item
          name="len"
          label="长度"
          getValueFromEvent={(e: any) => e.target.value.length}
        >
          <input />
        </Item>
      </FormComponent>,
    );
    fireEvent.change(container.querySelector('input')!, {
      target: { value: 'hello' },
    });
    expect(form.getFieldValue('len')).toBe(5);
  });

  it('validateTrigger="onBlur"：blur 时才校验', async () => {
    const { container } = render(
      <FormComponent>
        <Item
          name="email"
          label="邮箱"
          validateTrigger="onBlur"
          rules={[{ required: true, message: '邮箱必填' }]}
        >
          <input />
        </Item>
      </FormComponent>,
    );
    // change 不触发校验
    fireEvent.change(container.querySelector('input')!, {
      target: { value: '' },
    });
    expect(container.textContent).not.toContain('邮箱必填');
    // blur 触发
    fireEvent.blur(container.querySelector('input')!);
    await waitFor(() => {
      expect(container.textContent).toContain('邮箱必填');
    });
  });

  it('Form.useWatch 订阅字段值', () => {
    const WatchConsumer = React.forwardRef<{ value: unknown }, any>(
      (props, ref) => {
        React.useImperativeHandle(ref, () => props as any);
        return null;
      },
    );
    let watched: unknown;
    const Inner: React.FC<any> = (props) => {
      watched = (Form as any).useWatch('keyword');
      void props;
      return null;
    };
    render(
      <FormComponent initialValues={{ keyword: '初始' }}>
        <Item name="keyword">
          <input />
        </Item>
        <Inner />
        <WatchConsumer ref={undefined} value={watched} />
      </FormComponent>,
    );
    // 初值
    expect(watched).toBe('初始');
    // 值变化后 watch 跟随
    fireEvent.change(document.querySelector('input')!, {
      target: { value: '更新' },
    });
    expect(watched).toBe('更新');
    void WatchConsumer;
  });

  it('shouldUpdate：无 name 的函数 children 跟随值变化', () => {
    const { container } = render(
      <FormComponent>
        <Item name="a">
          <input />
        </Item>
        <Item shouldUpdate>
          {(_prev: any, next: any) => (
            <span data-testid="mirror">{String(next.a ?? '空')}</span>
          )}
        </Item>
      </FormComponent>,
    );
    expect(container.querySelector('[data-testid=mirror]')!.textContent).toBe(
      '空',
    );
    fireEvent.change(container.querySelector('input')!, {
      target: { value: 'hi' },
    });
    expect(container.querySelector('[data-testid=mirror]')!.textContent).toBe(
      'hi',
    );
  });

  it('preserve=false：字段卸载后丢弃值', () => {
    const [form] = (Form as any).useForm();
    const { rerender } = render(
      <FormComponent form={form} initialValues={{ temp: 'x' }}>
        <Item name="temp" preserve={false}>
          <input />
        </Item>
      </FormComponent>,
    );
    expect(form.getFieldValue('temp')).toBe('x');
    rerender(
      <FormComponent form={form}>
        <div />
      </FormComponent>,
    );
    expect(form.getFieldValue('temp')).toBeUndefined();
  });

  it('scrollToFirstError：提交失败时错误项存在', async () => {
    const onFinishFailed = vi.fn();
    const { container } = render(
      <FormComponent onFinishFailed={onFinishFailed} scrollToFirstError>
        <Item name="req" rules={[{ required: true, message: '必填' }]}>
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(onFinishFailed).toHaveBeenCalled();
    });
    expect(container.querySelector('.aura-form-item-error')).not.toBeNull();
  });

  it('List.move 支持调整顺序', () => {
    const List = (Form as any).List as any;
    const [form] = (Form as any).useForm();
    const { container } = render(
      <FormComponent
        form={form}
        initialValues={{ rows: [{ v: 'a' }, { v: 'b' }, { v: 'c' }] }}
      >
        <List name="rows">
          {(fields: any[], op: any) => (
            <div>
              {fields.map((f) => (
                <Item key={f.key} name={`rows.${f.name}.v`}>
                  <input />
                </Item>
              ))}
              <button type="button" onClick={() => op.move(2, 0)}>
                move
              </button>
            </div>
          )}
        </List>
      </FormComponent>,
    );
    const inputs = container.querySelectorAll('input');
    expect(inputs[0].value).toBe('a');
    fireEvent.click(screen.getByText('move'));
    const after = container.querySelectorAll('input');
    expect(after[0].value).toBe('c');
    expect(after[1].value).toBe('a');
    expect(after[2].value).toBe('b');
    expect(form.getFieldValue('rows')).toEqual([
      { v: 'c' },
      { v: 'a' },
      { v: 'b' },
    ]);
  });

  it('内置 type 校验：email / number', async () => {
    const onFinishFailed = vi.fn();
    const { container } = render(
      <FormComponent
        initialValues={{ mail: 'not-an-email', age: 'abc' }}
        onFinishFailed={onFinishFailed}
      >
        <Item
          name="mail"
          rules={[{ type: 'email', message: '邮箱格式不正确' }]}
        >
          <input />
        </Item>
        <Item name="age" rules={[{ type: 'number', message: '必须是数字' }]}>
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('邮箱格式不正确');
      expect(container.textContent).toContain('必须是数字');
    });
  });

  it('min/max：数字类型按数值比较', async () => {
    const onFinish = vi.fn();
    render(
      <FormComponent onFinish={onFinish} initialValues={{ score: 150 }}>
        <Item name="score" rules={[{ max: 100, message: '不能超过 100' }]}>
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      // 数字 150 > max 100 应报错（不是按字符串长度）
      expect(screen.getByText('不能超过 100')).toBeDefined();
    });
    void onFinish;
  });
});

/* ===== 二期能力：warningOnly / messageVariables / 冒泡 / 规则全集 ===== */

describe('Form 二期能力', () => {
  const Item = Form.Item as unknown as React.FC<any>;
  const List = (Form as any).List as any;

  it('warningOnly：警告不阻止提交且以 warning 状态展示', async () => {
    const onFinish = vi.fn();
    const onFinishFailed = vi.fn();
    const { container } = render(
      <FormComponent
        initialValues={{ tag: 'x' }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Item
          name="tag"
          label="标签"
          rules={[{ warningOnly: true, min: 3, message: '建议至少 3 个字符' }]}
        >
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      // 警告不阻止提交
      expect(onFinish).toHaveBeenCalled();
      expect(onFinishFailed).not.toHaveBeenCalled();
      // 警告文案展示且状态为 warning
      expect(container.textContent).toContain('建议至少 3 个字符');
      expect(
        container
          .querySelector('.aura-form-item')!
          .classList.contains('aura-form-item-warning'),
      ).toBe(true);
    });
  });

  it('enum：值必须在列表内', async () => {
    const { container } = render(
      <FormComponent initialValues={{ role: 'guest' }}>
        <Item
          name="role"
          rules={[{ enum: ['admin', 'user'], message: '角色不合法' }]}
        >
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('角色不合法');
    });
  });

  it('len：精确长度', async () => {
    const { container } = render(
      <FormComponent initialValues={{ code: 'abc' }}>
        <Item name="code" rules={[{ len: 4, message: '长度应为 4' }]}>
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('长度应为 4');
    });
  });

  it('transform：校验前转换（trim 后非空）', async () => {
    const onFinish = vi.fn();
    const { container } = render(
      <FormComponent onFinish={onFinish}>
        <Item
          name="note"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '不能为空',
              transform: (v: unknown) => String(v ?? '').trim(),
            },
          ]}
        >
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    // 值是空格串，trim 后仍为空 → required 报错
    fireEvent.change(container.querySelector('input')!, {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('不能为空');
    });
    void onFinish;
  });

  it('type=boolean/array/date 校验', async () => {
    const { container } = render(
      <FormComponent
        initialValues={{ flag: 'yes', tags: 'not-array', day: '2026-13-99' }}
      >
        <Item name="flag" rules={[{ type: 'boolean', message: '须为布尔' }]}>
          <input />
        </Item>
        <Item name="tags" rules={[{ type: 'array', message: '须为数组' }]}>
          <input />
        </Item>
        <Item name="day" rules={[{ type: 'date', message: '日期无效' }]}>
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('须为布尔');
      expect(container.textContent).toContain('须为数组');
      expect(container.textContent).toContain('日期无效');
    });
  });

  it('defaultField：数组元素级校验', async () => {
    const { container } = render(
      <FormComponent initialValues={{ scores: [90, 500] }}>
        <Item
          name="scores"
          rules={[
            {
              defaultField: { max: 100, message: '分数不能超过 100' },
            },
          ]}
        >
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('第 2 项不合法');
    });
  });

  it('messageVariables：{{label}} 占位符替换', async () => {
    const { container } = render(
      <FormComponent initialValues={{}}>
        <Item
          name="city"
          label="城市"
          messageVariables={{ label: '所在城市' }}
          rules={[{ required: true, message: '请输入{{label}}' }]}
        >
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('请输入所在城市');
    });
  });

  it('message 函数形态：动态文案', async () => {
    const { container } = render(
      <FormComponent initialValues={{ n: 'x' }}>
        <Item
          name="n"
          rules={[{ len: 5, message: (rule: any) => `长度应为 ${rule.len}` }]}
        >
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('长度应为 5');
    });
  });

  it('noStyle：校验错误冒泡到最近的「有样式」Item', async () => {
    const { container } = render(
      <FormComponent>
        <Item label="地址" shouldUpdate>
          {() => (
            <div>
              <Item
                name="city"
                noStyle
                rules={[{ required: true, message: '城市必填' }]}
              >
                <input />
              </Item>
            </div>
          )}
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('城市必填');
      // 有样式 Item 获得错误状态类
      expect(container.querySelector('.aura-form-item-error')).not.toBeNull();
    });
  });

  it('labelCol/wrapperCol：horizontal 下按栅格设置宽度', () => {
    const { container } = render(
      <FormComponent
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Item name="g" label="栅格">
          <input />
        </Item>
      </FormComponent>,
    );
    const label = container.querySelector<HTMLElement>('.aura-form-item-label');
    expect(label?.style.width).toBe('33.33333333333333%');
  });

  it('Form.useFormInstance 获取最近实例', () => {
    const captured: any = {};
    const Inner: React.FC = () => {
      captured.form = (Form as any).useFormInstance();
      return null;
    };
    const [form] = (Form as any).useForm();
    render(
      <FormComponent form={form}>
        <Inner />
      </FormComponent>,
    );
    expect(captured.form).toBe(form);
    act(() => {
      captured.form.setFieldValue('x', 1);
    });
    expect(form.getFieldValue('x')).toBe(1);
  });
});

describe('Form fields（对象子字段 schema）', () => {
  const Item = Form.Item as unknown as React.FC<any>;

  it('type=object + fields：子字段错误写入嵌套路径并汇总展示', async () => {
    const onFinishFailed = vi.fn();
    const [form] = (Form as any).useForm();
    const { container } = render(
      <FormComponent
        form={form}
        initialValues={{ address: { city: '', street: '' } }}
        onFinishFailed={onFinishFailed}
      >
        <Item
          name="address"
          label="地址"
          rules={[
            {
              type: 'object',
              fields: {
                city: { required: true, message: '请输入城市' },
                street: { required: true, message: '请输入街道' },
              },
            },
          ]}
        >
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      // 父字段汇总展示子字段错误
      expect(container.textContent).toContain('city: 请输入城市');
      expect(container.textContent).toContain('street: 请输入街道');
      // 子字段错误写入嵌套路径
      expect(form.getFieldError('address.city')).toEqual(['请输入城市']);
      expect(form.getFieldError('address.street')).toEqual(['请输入街道']);
      expect(onFinishFailed).toHaveBeenCalled();
    });
  });

  it('嵌套 noStyle Item 消费子字段错误', async () => {
    const [form] = (Form as any).useForm();
    const { container } = render(
      <FormComponent form={form} initialValues={{ address: { city: '' } }}>
        <Item label="地址">
          <Item
            name="address.city"
            noStyle
            rules={[{ required: true, message: '请输入城市' }]}
          >
            <input placeholder="城市" />
          </Item>
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('请输入城市');
    });
  });

  it('子字段修复后错误自动清除', async () => {
    const [form] = (Form as any).useForm();
    const { container } = render(
      <FormComponent form={form} initialValues={{ address: { city: '' } }}>
        <Item
          name="address"
          label="地址"
          rules={[
            {
              type: 'object',
              fields: { city: { required: true, message: '请输入城市' } },
            },
          ]}
        >
          <input />
        </Item>
        <button type="submit">提交</button>
      </FormComponent>,
    );
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() => {
      expect(container.textContent).toContain('city: 请输入城市');
    });
    // 修复子字段值
    act(() => {
      form.setFieldValue('address.city', '杭州');
    });
    act(() => {
      void form.validateFields();
    });
    await waitFor(() => {
      expect(form.getFieldError('address.city')).toEqual([]);
      expect(container.textContent).not.toContain('city: 请输入城市');
    });
  });
});
