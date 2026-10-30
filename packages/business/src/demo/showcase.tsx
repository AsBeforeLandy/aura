import React, { useCallback, useEffect, useState } from 'react';
import type { TableProps } from 'antd';
import { Button, Space, Tag } from 'antd';
import { AnimatePresence, motion } from '@aura-react-comp/motion';
import {
  BusinessProvider,
  PageContainer,
  ProTable,
  SearchForm,
} from '@aura-react-comp/business';

/** 业务组件演示墙：3 个场景自动轮播（悬停暂停、点击指示器切换） */

interface UserRecord extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'disabled';
}

const columns: TableProps<UserRecord>['columns'] = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '姓名', dataIndex: 'name', width: 110 },
  { title: '邮箱', dataIndex: 'email' },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    render: (value: UserRecord['status']) => (
      <Tag color={value === 'active' ? 'green' : 'default'}>
        {value === 'active' ? '启用' : '禁用'}
      </Tag>
    ),
  },
];

const USERS: UserRecord[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  email: `user${i + 1}@aura.dev`,
  status: i % 4 === 0 ? 'disabled' : 'active',
}));

function SceneProTable() {
  return (
    <ProTable<UserRecord>
      title="用户列表"
      columns={columns}
      rowKey="id"
      toolbar={<Button type="primary">新建用户</Button>}
      request={async ({ current, pageSize }) => {
        const start = (current - 1) * pageSize;
        return {
          data: USERS.slice(start, start + pageSize),
          total: USERS.length,
        };
      }}
    />
  );
}

function SceneSearchForm() {
  return (
    <SearchForm
      fields={[
        {
          name: 'keyword',
          label: '关键词',
          type: 'input',
          placeholder: '用户名 / 手机号',
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
        {
          name: 'role',
          label: '角色',
          type: 'select',
          options: [
            { label: '管理员', value: 'admin' },
            { label: '普通用户', value: 'user' },
          ],
        },
        { name: 'createdAt', label: '创建时间', type: 'date' },
      ]}
      onSearch={(values) => console.log('search', values)}
      onReset={() => console.log('reset')}
    />
  );
}

function ScenePageContainer() {
  return (
    <PageContainer
      title="运营概览"
      description="统一中后台页面骨架：面包屑 + 标题区 + 操作区 + 内容区"
      breadcrumb={[{ title: '首页' }, { title: '运营' }, { title: '概览' }]}
      extra={
        <Space>
          <Button>导出</Button>
          <Button type="primary">新建报表</Button>
        </Space>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        {['今日请求量', '活跃用户', '平均响应'].map((label, i) => (
          <div
            key={label}
            style={{
              padding: 14,
              borderRadius: 10,
              border: '1px solid #e8e6de',
              background: '#fff',
            }}
          >
            <div style={{ fontSize: 12, color: '#8a8984', marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {[128940, 3286, '218 ms'][i]}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

const SCENES: {
  key: string;
  title: string;
  tag: string;
  render: () => React.ReactElement;
}[] = [
  {
    key: 'pro-table',
    title: '高级表格',
    tag: 'ProTable · 查询 / 分页 / 工具栏',
    render: () => <SceneProTable />,
  },
  {
    key: 'search-form',
    title: '查询表单',
    tag: 'SearchForm · 字段配置驱动',
    render: () => <SceneSearchForm />,
  },
  {
    key: 'page-container',
    title: '页面骨架',
    tag: 'PageContainer · 面包屑 / 操作区',
    render: () => <ScenePageContainer />,
  },
];

export default () => {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setCur((c) => (c + 1) % SCENES.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [paused, cur]);

  const go = useCallback((i: number) => setCur(i), []);
  const scene = SCENES[cur];

  return (
    <BusinessProvider>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          border: '1px solid #e8e6de',
          borderRadius: 16,
          background: '#faf9f5',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '14px 20px 0',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{scene.title}</div>
            <div style={{ color: '#8a8984', fontSize: 12, marginTop: 2 }}>
              {scene.tag}
            </div>
          </div>
          <div style={{ color: '#b4b2a9', fontSize: 12 }}>
            {paused ? '已暂停' : '自动轮播'}
          </div>
        </div>

        <div
          style={{
            height: 300,
            padding: 16,
            position: 'relative',
            overflow: 'auto',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={scene.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              {scene.render()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            padding: '0 0 16px',
          }}
        >
          {SCENES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={s.title}
              onClick={() => go(i)}
              style={{
                width: i === cur ? 22 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: i === cur ? '#7c3aed' : '#d3d1c7',
                transition: 'all 260ms cubic-bezier(0.21, 0.47, 0.32, 0.98)',
              }}
            />
          ))}
        </div>
      </div>
    </BusinessProvider>
  );
};
