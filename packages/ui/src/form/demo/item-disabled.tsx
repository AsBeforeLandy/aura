import React from 'react';
import { Form, Input, Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Form layout="horizontal" colon onFinish={(v) => console.log(v)}>
    <Form.Item name="name" label="姓名">
      <Input placeholder="可编辑" />
    </Form.Item>
    <Form.Item name="readonly-field" label="只读字段" disabled>
      <Input placeholder="此项被禁用" />
    </Form.Item>
    <Form.Item name="email" label="邮箱">
      <Input placeholder="可编辑" />
    </Form.Item>
    <Form.Item>
      <Space>
        <Button type="submit" variant="primary">提交</Button>
        <Button>取消</Button>
      </Space>
    </Form.Item>
  </Form>
);

export default Demo;
