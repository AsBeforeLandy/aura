import React, { useState } from 'react';
import { Pagination, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <Space direction="vertical" size="sm">
      <Pagination
        total={200}
        current={current}
        pageSize={pageSize}
        onChange={(page, size) => {
          setCurrent(page);
          setPageSize(size);
        }}
      />
      <Text>当前页：{current}，每页条数：{pageSize}</Text>
    </Space>
  );
};

export default Demo;
