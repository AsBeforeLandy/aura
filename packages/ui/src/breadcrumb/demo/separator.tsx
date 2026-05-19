import React from 'react';
import { Breadcrumb, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Breadcrumb separator=">">
      <Breadcrumb.Item>首页</Breadcrumb.Item>
      <Breadcrumb.Item>产品</Breadcrumb.Item>
      <Breadcrumb.Item>详情</Breadcrumb.Item>
    </Breadcrumb>
    <Breadcrumb separator="-">
      <Breadcrumb.Item href="#">首页</Breadcrumb.Item>
      <Breadcrumb.Item href="#">应用中心</Breadcrumb.Item>
      <Breadcrumb.Item>应用列表</Breadcrumb.Item>
    </Breadcrumb>
  </Space>
);

export default Demo;
