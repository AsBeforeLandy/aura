import React from 'react';
import { Form, Input, Textarea, Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Form layout="horizontal" colon onFinish={(v) => console.log(v)}>
    <Form.Item name="title" label="标题" labelWidth={120}>
      <Input placeholder="标签宽度 120px" />
    </Form.Item>
    <Form.Item name="author" label="作者" labelWidth={120}>
      <Input placeholder="统一标签宽度" />
    </Form.Item>
    <Form.Item name="desc" label="详细描述" labelWidth={120}>
      <Textarea placeholder="多行文本" rows={3} />
    </Form.Item>
    <Form.Item labelWidth={120}>
      <Space>
        <Button type="submit" variant="primary">保存</Button>
        <Button>取消</Button>
      </Space>
    </Form.Item>
  </Form>
);

export default Demo;
