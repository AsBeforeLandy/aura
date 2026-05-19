import React from 'react';
import { Form, Input, Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="lg" style={{ width: '100%' }}>
    <Form size="sm" layout="horizontal" colon>
      <Form.Item name="name-sm" label="姓名">
        <Input placeholder="小尺寸 (sm)" />
      </Form.Item>
      <Form.Item>
        <Button type="submit" variant="primary">提交</Button>
      </Form.Item>
    </Form>

    <Form size="md" layout="horizontal" colon>
      <Form.Item name="name-md" label="姓名">
        <Input placeholder="中尺寸 (md)" />
      </Form.Item>
      <Form.Item>
        <Button type="submit" variant="primary">提交</Button>
      </Form.Item>
    </Form>

    <Form size="lg" layout="horizontal" colon>
      <Form.Item name="name-lg" label="姓名">
        <Input placeholder="大尺寸 (lg)" />
      </Form.Item>
      <Form.Item>
        <Button type="submit" variant="primary">提交</Button>
      </Form.Item>
    </Form>
  </Space>
);

export default Demo;
