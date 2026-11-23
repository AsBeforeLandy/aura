import React from 'react';
import { Form, Input, Button } from '@aura-react-comp/design';

/** requiredMark='optional'：非必填项标注「可选」，必填项保留星号 */
const Demo: React.FC = () => (
  <Form requiredMark="optional" layout="vertical" style={{ maxWidth: 360 }}>
    <Form.Item
      name="name"
      label="姓名"
      rules={[{ required: true, message: '请输入姓名' }]}
    >
      <Input placeholder="必填" />
    </Form.Item>
    <Form.Item name="nickname" label="昵称">
      <Input placeholder="选填" />
    </Form.Item>
    <Form.Item>
      <Button type="submit" variant="primary">
        提交
      </Button>
    </Form.Item>
  </Form>
);

export default Demo;
