import React from 'react';
import { Empty, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size={32}>
    <Empty.Preset type="noData" />
    <Empty.Preset type="noResult" />
    <Empty.Preset type="404" />
  </Space>
);

export default Demo;
