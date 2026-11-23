import React from 'react';
import { Form, Input, Button } from '@aura-react-comp/ui';

/** dependencies：确认密码依赖密码字段，密码变化时自动重新校验 */
const Demo: React.FC = () => {
  const [form] = (Form as any).useForm();

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 360 }}>
      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少 6 位' },
        ]}
      >
        <Input type="password" placeholder="请输入密码" />
      </Form.Item>
      <Form.Item
        name="confirm"
        label="确认密码"
        dependencies={['password']}
        rules={[
          { required: true, message: '请再次输入密码' },
          {
            validator: (rule, value) => {
              const password = form.getFieldValue('password');
              if (value !== password) {
                return Promise.reject(new Error('两次输入的密码不一致'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input type="password" placeholder="再次输入密码" />
      </Form.Item>
      <Form.Item>
        <Button type="submit" variant="primary">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Demo;
