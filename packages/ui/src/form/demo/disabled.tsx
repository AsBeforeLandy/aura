import React from 'react';
import { Form, Input, Textarea, Button, Text } from '@aura/ui';

const Demo: React.FC = () => (
  <Form layout="horizontal" colon disabled>
    <Form.Item name="name" label="姓名">
      <Input placeholder="请输入姓名" />
    </Form.Item>
    <Form.Item name="email" label="邮箱">
      <Input placeholder="请输入邮箱" />
    </Form.Item>
    <Form.Item name="remark" label="备注">
      <Textarea placeholder="请输入备注" rows={2} />
    </Form.Item>
    <Form.Item>
      <Button variant="primary">提交</Button>
    </Form.Item>
  </Form>
);

export default Demo;
