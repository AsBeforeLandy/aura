import React from 'react';
import { Form, Input, Button, Space, Text } from '@aura/ui';

const Demo: React.FC = () => {
  const handleFinish = (values: Record<string, unknown>) => {
    console.log('表单提交：', values);
  };

  const handleFinishFailed = (errors: any[]) => {
    console.log('验证失败：', errors);
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
      initialValues={{ username: 'admin' }}
    >
      <Form.Item
        name="username"
        label="用户名"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input placeholder="请输入用户名" />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少 6 位' },
        ]}
      >
        <Input.Password placeholder="请输入密码" />
      </Form.Item>
      <Form.Item
        name="email"
        label="邮箱"
        rules={[{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }]}
      >
        <Input placeholder="请输入邮箱" />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="submit" variant="primary">提交</Button>
          <Button type="reset">重置</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default Demo;
