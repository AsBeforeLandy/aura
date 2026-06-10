import React from 'react';
import { Form, Input, Button, Space, Select, Switch, message } from '@aura/ui';

const Demo: React.FC = () => {
  const handleFinish = (values: Record<string, unknown>) => {
    console.log('表单提交成功：', values);
    message.success(`提交成功！数据：${JSON.stringify(values)}`);
  };

  const handleFinishFailed = (errors: any[]) => {
    console.log('验证失败：', errors);
    message.error('请检查表单输入项是否正确');
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
      initialValues={{
        username: 'AuraDeveloper',
        role: 'developer',
        subscribe: true,
      }}
      style={{ maxWidth: 500 }}
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
        name="role"
        label="用户角色"
        rules={[{ required: true, message: '请选择用户角色' }]}
      >
        <Select
          placeholder="请选择用户角色"
          options={[
            { label: '系统管理员 (Administrator)', value: 'admin' },
            { label: '研发工程师 (Developer)', value: 'developer' },
            { label: '产品经理 (Product Manager)', value: 'pm' },
            { label: '访客/普通用户 (Guest)', value: 'guest' },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="subscribe"
        label="订阅周报"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item style={{ marginTop: '24px' }}>
        <Space>
          <Button type="submit" variant="primary">提交</Button>
          <Button type="reset">重置</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default Demo;
