import React, { useState } from 'react';
import { Pagination, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [current, setCurrent] = useState(1);
  return (
    <Space direction="vertical" size="md">
      <Pagination current={current} total={500} showSizeChanger showQuickJumper onChange={setCurrent} />
      <Text style={{ fontSize: 13 }}>当前页码：{current}</Text>
    </Space>
  );
};

export default Demo;
