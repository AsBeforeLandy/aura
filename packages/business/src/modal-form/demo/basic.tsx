import React, { useState } from 'react';
import { Button, Form, Input, Select, message } from 'antd';
import { ModalForm, BusinessProvider } from '@aura/business';

const Demo: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <BusinessProvider>
      <Button type="primary" onClick={() => setOpen(true)}>
        新建用户
      </Button>

      <ModalForm
        open={open}
        title="新建用户"
        onOpenChange={setOpen}
        onFinish={async (values) => {
          // 模拟异步提交
          await new Promise((resolve) => setTimeout(resolve, 1000));
          message.success(`已提交：${JSON.stringify(values)}`);
        }}
      >
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item name="role" label="角色" initialValue="user">
          <Select
            options={[
              { label: '管理员', value: 'admin' },
              { label: '普通用户', value: 'user' },
            ]}
          />
        </Form.Item>
      </ModalForm>
    </BusinessProvider>
  );
};

export default Demo;
