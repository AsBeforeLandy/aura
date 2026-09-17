import React, { useState } from 'react';
import { Tag, Typography, Space } from 'antd';
import { YearCalendar, BusinessProvider } from '@aura/business';

const Demo: React.FC = () => {
  const [dates, setDates] = useState<string[]>([
    '2026-03-10',
    '2026-09-22',
  ]);

  return (
    <BusinessProvider>
      <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
        <Typography.Text type="secondary">
          cellSize=18：格子更大，更易点选（触屏友好）
        </Typography.Text>
        <YearCalendar
          year={2026}
          value={dates}
          onChange={setDates}
          cellSize={18}
        >
          {(selected) => (
            <Space size="small" wrap>
              <Typography.Text type="secondary">
                已选 {selected.length} 天：
              </Typography.Text>
              {selected.map((date) => (
                <Tag key={date} color="purple">
                  {date}
                </Tag>
              ))}
            </Space>
          )}
        </YearCalendar>
      </Space>
    </BusinessProvider>
  );
};

export default Demo;
