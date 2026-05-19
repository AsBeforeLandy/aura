import React from 'react';
import { Divider, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm">
    <Divider>居中文字</Divider>
    <Divider orientation="left">左侧文字</Divider>
    <Divider orientation="right">右侧文字</Divider>
    <Divider variant="dashed" orientation="left">
      虚线带文字
    </Divider>
  </Space>
);

export default Demo;
