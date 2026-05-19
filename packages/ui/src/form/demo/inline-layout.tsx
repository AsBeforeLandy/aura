import React from 'react';
import { Form, Input, Button, Select } from '@aura/ui';

const Demo: React.FC = () => {
  const handleFinish = (values: Record<string, unknown>) => {
    console.log('搜索条件：', values);
  };

  return (
    <Form layout="inline" onFinish={handleFinish}>
      <Form.Item name="keyword" label="关键词">
        <Input placeholder="请输入关键词" />
      </Form.Item>
      <Form.Item name="status" label="状态">
        <Select
          style={{ minWidth: 120 }}
          options={[
            { label: '全部', value: '' },
            { label: '已启用', value: 'active' },
            { label: '已禁用', value: 'disabled' },
          ]}
          placeholder="请选择"
        />
      </Form.Item>
      <Form.Item>
        <Button type="submit" variant="primary">搜索</Button>
      </Form.Item>
    </Form>
  );
};

export default Demo;
