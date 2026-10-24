import React, { useEffect, useState } from 'react';
import type { TableProps } from 'antd';
import { Button, Space, Tag } from 'antd';
import { BusinessProvider, ProTable } from '@aura-react-comp/business';
import { Reveal, SkeletonShimmer } from '@aura-react-comp/motion';

interface UserRecord extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'disabled';
}

const columns: TableProps<UserRecord>['columns'] = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '姓名', dataIndex: 'name', width: 130 },
  { title: '邮箱', dataIndex: 'email' },
  {
    title: '状态',
    dataIndex: 'status',
    width: 90,
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

/** 表格行骨架：圆点 + 两段长短条，index 控制扫光错峰 */
function RowSkeleton({ index }: { index: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0' }}>
      <SkeletonShimmer width={26} height={26} radius={13} index={index} />
      <SkeletonShimmer width="18%" height={12} index={index} />
      <SkeletonShimmer width="34%" height={12} index={index} />
      <SkeletonShimmer width="12%" height={12} index={index} />
    </div>
  );
}

/** 首屏骨架（错峰扫光）→ 数据就绪后表格整体 Reveal 进场；可点击重播 */
export default () => {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (!booting) return;
    const timer = setTimeout(() => setBooting(false), 1800);
    return () => clearTimeout(timer);
  }, [booting]);

  return (
    <BusinessProvider>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Space>
          <Button size="small" onClick={() => setBooting(true)} disabled={booting}>
            重播首屏骨架
          </Button>
          <span style={{ color: '#8a8984', fontSize: 12 }}>
            骨架错峰扫光 1.8s → 表格 Reveal 进场（内部刷新仍由 antd Spin 接管）
          </span>
        </Space>

        {booting ? (
          <div style={{ padding: '8px 16px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <RowSkeleton key={i} index={i} />
            ))}
          </div>
        ) : (
          <Reveal variant="fade">
            <ProTable<UserRecord>
              title="用户列表"
              columns={columns}
              rowKey="id"
              search={{
                fields: [
                  {
                    name: 'keyword',
                    label: '关键词',
                    type: 'input',
                    placeholder: '姓名 / 邮箱',
                  },
                ],
              }}
              request={async ({ current, pageSize }) => {
                const start = (current - 1) * pageSize;
                return {
                  data: ALL_USERS.slice(start, start + pageSize),
                  total: ALL_USERS.length,
                };
              }}
            />
          </Reveal>
        )}
      </Space>
    </BusinessProvider>
  );
};
