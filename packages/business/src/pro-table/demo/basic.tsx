import React from 'react';
import type { TableProps } from 'antd';
import { Button, Tag } from 'antd';
import { ProTable, BusinessProvider } from '@aura/business';

interface UserRecord extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'disabled';
}

const columns: TableProps<UserRecord>['columns'] = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name', width: 140 },
  { title: '邮箱', dataIndex: 'email' },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (value: UserRecord['status']) => (
      <Tag color={value === 'active' ? 'green' : 'default'}>
        {value === 'active' ? '启用' : '禁用'}
      </Tag>
    ),
  },
];

const ALL_USERS: UserRecord[] = Array.from({ length: 46 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  email: `user${i + 1}@aura.dev`,
  status: i % 3 === 0 ? 'disabled' : 'active',
}));

const Demo: React.FC = () => (
  <BusinessProvider>
    <ProTable<UserRecord>
      title="用户列表"
      columns={columns}
      rowKey="id"
      toolbar={<Button type="primary">新建用户</Button>}
      search={{
        fields: [
          {
            name: 'keyword',
            label: '关键词',
            type: 'input',
            placeholder: '姓名 / 邮箱',
          },
          {
            name: 'status',
            label: '状态',
            type: 'select',
            options: [
              { label: '启用', value: 'active' },
              { label: '禁用', value: 'disabled' },
            ],
          },
        ],
      }}
      request={async ({ current, pageSize, status }) => {
        // 模拟服务端过滤 + 分页
        const statusValue = status as UserRecord['status'] | undefined;
        const filtered = statusValue
          ? ALL_USERS.filter((u) => u.status === statusValue)
          : ALL_USERS;
        const start = (current - 1) * pageSize;
        return {
          data: filtered.slice(start, start + pageSize),
          total: filtered.length,
        };
      }}
    />
  </BusinessProvider>
);

export default Demo;
