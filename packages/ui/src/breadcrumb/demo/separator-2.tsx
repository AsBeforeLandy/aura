import React from 'react';
import { Breadcrumb } from '@aura/ui';

const Demo: React.FC = () => (
  <Breadcrumb separator=">">
    <Breadcrumb.Item>首页</Breadcrumb.Item>
    <Breadcrumb.Item>分类</Breadcrumb.Item>
    <Breadcrumb.Item>详情</Breadcrumb.Item>
  </Breadcrumb>
);

export default Demo;
