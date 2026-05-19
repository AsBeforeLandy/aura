import React from 'react';
import { Form, Input, Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="lg" style={{ width: '100%' }}>
    <Form layout="horizontal" labelAlign="left" colon onFinish={(v) => console.log(v)}>
      <Form.Item name="name" label="姓名">
        <Input placeholder="标签左对齐" />
      </Form.Item>
      <Form.Item name="remark" label="备注" labelAlign="right">
        <Input placeholder="此项标签右对齐（覆盖 Form 级别）" />
      </Form.Item>
      <Form.Item>
        <Button type="submit" variant="primary">提交</Button>
      </Form.Item>
    </Form>
  </Space>
);

export default Demo;
