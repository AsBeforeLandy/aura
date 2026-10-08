import React from 'react';
import { Button, Form, Input, Space } from '@aura/ui';

/** `Form.useForm()` 创建实例：编辑回填（setFieldsValue）与外部提交（validateFields）。 */
export default () => {
  const [form] = Form.useForm();

  const handleFill = () => {
    // 模拟编辑页拉取详情后回填
    form.setFieldsValue({ name: '张三', email: 'zhangsan@example.com' });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('校验通过：', values);
    } catch {
      // 校验失败：错误信息已显示在对应字段下方
    }
  };

  return (
    <div>
      <Form form={form} initialValues={{ name: '', email: '' }}>
        <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
          <Input placeholder="请输入邮箱" />
        </Form.Item>
      </Form>
      <Space>
        <Button onClick={handleFill}>回填表单</Button>
        <Button variant="primary" onClick={handleSubmit}>
          外部提交（校验）
        </Button>
      </Space>
    </div>
  );
};
