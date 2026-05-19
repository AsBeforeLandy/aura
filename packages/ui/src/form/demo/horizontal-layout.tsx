import React from 'react';
import { Form, Input, Button, Textarea, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const handleFinish = (values: Record<string, unknown>) => {
    console.log('表单提交：', values);
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} colon>
      <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
        <Input placeholder="请输入姓名" />
      </Form.Item>
      <Form.Item name="email" label="邮箱" rules={[{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }]}>
        <Input placeholder="请输入邮箱" />
      </Form.Item>
      <Form.Item name="phone" label="手机号">
        <Input placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item name="remark" label="备注">
        <Textarea placeholder="请输入备注信息" rows={3} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="submit" variant="primary">保存</Button>
          <Button>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default Demo;
