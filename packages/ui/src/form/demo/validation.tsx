import React from 'react';
import { Form, Input, Button, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const handleFinish = (values: Record<string, unknown>) => {
    console.log('验证通过：', values);
  };

  const handleFinishFailed = (errors: any[]) => {
    console.log('验证失败：', errors);
  };

  return (
    <Form
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
    >
      <Form.Item
        name="username"
        label="用户名"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, message: '用户名至少 3 个字符' },
          { max: 20, message: '用户名最多 20 个字符' },
        ]}
      >
        <Input placeholder="3-20 个字符" />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少 6 位' },
          { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: '需包含字母和数字' },
        ]}
      >
        <Input.Password placeholder="至少 6 位，包含字母和数字" />
      </Form.Item>
      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
        ]}
      >
        <Input placeholder="example@domain.com" />
      </Form.Item>
      <Form.Item>
        <Button type="submit" variant="primary">提交验证</Button>
      </Form.Item>
    </Form>
  );
};

export default Demo;
