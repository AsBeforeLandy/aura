import React from 'react';
import { Form, Input, Button, Tag, Space } from '@aura-react-comp/ui';

/** Form.useWatch：订阅字段值做联动渲染（实时预览与字数统计） */
const Demo: React.FC = () => {
  const [form] = (Form as any).useForm();
  const nickname = (Form as any).useWatch('nickname', form);

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 360 }}>
      <Form.Item name="nickname" label="昵称">
        <Input placeholder="请输入昵称" />
      </Form.Item>
      <Form.Item>
        <Space size="sm">
          <Tag variant="info">
            实时预览：{nickname ? `${nickname}` : '（未填写）'}
          </Tag>
          <span style={{ fontSize: 12, color: 'var(--aura-text-tertiary)' }}>
            {(nickname ?? '').length} / 12 字
          </span>
          <Button size="sm" onClick={() => form.setFieldValue('nickname', '')}>
            清空
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default Demo;
