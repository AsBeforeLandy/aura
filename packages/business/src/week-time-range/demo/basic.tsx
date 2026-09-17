import React, { useState } from 'react';
import { Typography, Space } from 'antd';
import { WeekTimeRange, BusinessProvider } from '@aura/business';
import type { WeekTimeRangeValue } from '@aura/business';

const INITIAL_VALUE: WeekTimeRangeValue = [
  [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
  [{ start: '09:00', end: '12:00' }],
  [],
  [{ start: '10:00', end: '16:00' }],
  [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
  [],
  [],
];

const Demo: React.FC = () => {
  const [value, setValue] = useState<WeekTimeRangeValue>(INITIAL_VALUE);

  return (
    <BusinessProvider>
      <Space orientation="vertical" size="middle" style={{ display: 'flex' }}>
        <WeekTimeRange value={value} onChange={setValue} />
        <Typography.Text type="secondary">
          支持单击切换、按住鼠标拖拽框选；相邻时段会自动合并。
        </Typography.Text>
      </Space>
    </BusinessProvider>
  );
};

export default Demo;
