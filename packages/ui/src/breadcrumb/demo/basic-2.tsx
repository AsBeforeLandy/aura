import React from 'react';
import { Breadcrumb } from '@aura/ui';

const Demo: React.FC = () => (
  <Breadcrumb>
    <Breadcrumb.Item>首页</Breadcrumb.Item>
    <Breadcrumb.Item>商品列表</Breadcrumb.Item>
    <Breadcrumb.Item>商品详情</Breadcrumb.Item>
  </Breadcrumb>
);

export default Demo;
