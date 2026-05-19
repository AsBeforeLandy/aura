import React from 'react';
import { Form, Input, Button, Space } from '@aura/ui';

const existingUsers = ['admin', 'root', 'test'];

const Demo: React.FC = () => (
  <Form
    layout="vertical"
    onFinish={(values) => console.log('验证通过：', values)}
    onFinishFailed={(errors) => console.log('验证失败：', errors)}
  >
    <Form.Item
      name="username"
      label="用户名"
      rules={[
        { required: true, message: '请输入用户名' },
        {
          validator: async (value) => {
            await new Promise((r) => setTimeout(r, 500));
            if (existingUsers.includes(String(value))) {
              return false;
            }
            return true;
          },
          message: '该用户名已被占用',
        },
      ]}
    >
      <Input placeholder="输入 admin / root / test 触发验证失败" />
    </Form.Item>
    <Form.Item
      name="password"
      label="密码"
      rules={[
        { required: true, message: '请输入密码' },
        {
          validator: (value) => /[A-Z]/.test(String(value)),
          message: '密码需包含至少一个大写字母',
        },
      ]}
    >
      <Input.Password placeholder="需包含大写字母" />
    </Form.Item>
    <Form.Item>
      <Button type="submit" variant="primary">提交验证</Button>
    </Form.Item>
  </Form>
);

export default Demo;
