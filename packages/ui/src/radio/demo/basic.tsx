import React from 'react';
import { Radio, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Radio checked>选中</Radio>
    <Radio>未选中</Radio>
    <Radio disabled>禁用未选</Radio>
    <Radio disabled checked>禁用已选</Radio>
  </Space>
);

export default Demo;
