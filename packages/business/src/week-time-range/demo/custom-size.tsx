import React, { useState } from 'react';
import { Typography, Space } from 'antd';
import { WeekTimeRange, BusinessProvider } from '@aura/business';
import type { WeekTimeRangeValue } from '@aura/business';

const Demo: React.FC = () => {
  const [value, setValue] = useState<WeekTimeRangeValue>([
    [{ start: '09:00', end: '12:00' }],
    [],
    [{ start: '14:00', end: '18:00' }],
    [],
    [],
    [],
    [],
  ]);

  return (
    <BusinessProvider>
      <Space orientation="vertical" size="middle" style={{ display: 'flex' }}>
        <Typography.Text type="secondary">
          cellWidth=18、cellHeight=32：格子更宽松，适合触屏场景
        </Typography.Text>
        <WeekTimeRange
          value={value}
          onChange={setValue}
          cellWidth={18}
          cellHeight={32}
        />
      </Space>
    </BusinessProvider>
  );
};

export default Demo;
