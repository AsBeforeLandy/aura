import React from 'react';
import { Form, Input, Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Form layout="horizontal" colon>
    <Form.Item name="name" label="姓名" required>
      <Input placeholder="必填星号（无 rules 验证）" />
    </Form.Item>
    <Form.Item name="phone" label="手机号">
      <Input placeholder="非必填，无星号" />
    </Form.Item>
    <Form.Item name="email" label="邮箱" required>
      <Input placeholder="必填星号（无 rules 验证）" />
    </Form.Item>
    <Form.Item>
      <Button type="submit" variant="primary">提交</Button>
    </Form.Item>
  </Form>
);

export default Demo;
