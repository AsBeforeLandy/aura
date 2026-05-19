import React from 'react';
import { Breadcrumb } from '@aura/ui';

const Demo: React.FC = () => (
  <Breadcrumb separator="→">
    <Breadcrumb.Item>步骤一</Breadcrumb.Item>
    <Breadcrumb.Item>步骤二</Breadcrumb.Item>
    <Breadcrumb.Item>步骤三</Breadcrumb.Item>
  </Breadcrumb>
);

export default Demo;
