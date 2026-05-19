import React from 'react';
import { Checkbox, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space align="center" size="md">
    <Checkbox indeterminate checked>半选状态</Checkbox>
    <Checkbox indeterminate>半选未选</Checkbox>
  </Space>
);

export default Demo;
