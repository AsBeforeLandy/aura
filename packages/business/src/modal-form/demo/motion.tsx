import React, { useState } from 'react';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import { BusinessProvider, ModalForm } from '@aura-react-comp/business';
import { Reveal, SplitText } from '@aura-react-comp/motion';

/** 动效增强：每次打开弹窗，表单项逐项错峰进场（destroyOnHidden 默认开启 → 每次重播） */
export default () => {
  const [open, setOpen] = useState(false);
  const [plainOpen, setPlainOpen] = useState(false);

  return (
    <BusinessProvider>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          动效版：新建用户
        </Button>
        <Button onClick={() => setPlainOpen(true)}>对照：原生 Modal</Button>
      </div>

      <ModalForm
        open={open}
        title="新建用户"
        okText="创建"
        onOpenChange={setOpen}
        onFinish={async (values) => {
          await new Promise((resolve) => setTimeout(resolve, 600));
          message.success(`已提交：${values.name ?? ''}`);
        }}
      >
        <Reveal index={0}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
        </Reveal>
        <Reveal index={1}>
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
        </Reveal>
        <Reveal index={2}>
          <Form.Item name="role" label="角色" initialValue="member">
            <Select
              options={[
                { label: '管理员', value: 'admin' },
                { label: '成员', value: 'member' },
              ]}
            />
          </Form.Item>
        </Reveal>
        <Reveal index={3}>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={3} placeholder="可选的备注信息" />
          </Form.Item>
        </Reveal>
      </ModalForm>

      <Modal
        open={plainOpen}
        title={<SplitText text="对照：无进场动效" granularity="char" variant="fade" />}
        onCancel={() => setPlainOpen(false)}
        footer={null}
      >
        <div style={{ color: '#5f5e5a', fontSize: 13 }}>
          原生 Modal 打开时的表单项是整体同时出现；动效版按 index 递增错峰。
        </div>
      </Modal>
    </BusinessProvider>
  );
};
