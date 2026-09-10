import React from 'react';
import { Button, Space } from 'antd';
import { PageContainer, BusinessProvider } from '@aura/business';

const Demo: React.FC = () => (
  <BusinessProvider>
    <PageContainer
      title="用户管理"
      description="管理平台中的所有用户账号、角色与权限"
      breadcrumb={[
        { title: '首页', href: '#' },
        { title: '系统管理' },
        { title: '用户管理' },
      ]}
      extra={
        <Space>
          <Button>导出</Button>
          <Button type="primary">新建用户</Button>
        </Space>
      }
    >
      <div style={{ padding: 24, background: 'var(--aura-bg)', borderRadius: 8 }}>
        页面内容区域
      </div>
    </PageContainer>
  </BusinessProvider>
);

export default Demo;
