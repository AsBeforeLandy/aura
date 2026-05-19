import React from 'react';
import { Breadcrumb } from '@aura/ui';

const Demo: React.FC = () => (
  <Breadcrumb>
    <Breadcrumb.Item onClick={() => alert('点击了首页')}>首页</Breadcrumb.Item>
    <Breadcrumb.Item onClick={() => alert('点击了列表')}>列表页</Breadcrumb.Item>
    <Breadcrumb.Item>详情</Breadcrumb.Item>
  </Breadcrumb>
);

export default Demo;
