import React, { useState } from 'react';
import { Tag, Typography, Space } from 'antd';
import { YearCalendar, BusinessProvider } from '@aura/business';

const Demo: React.FC = () => {
  const [dates, setDates] = useState<string[]>([
    '2026-03-10',
    '2026-03-11',
    '2026-06-18',
    '2026-09-22',
  ]);

  return (
    <BusinessProvider>
      <Space orientation="vertical" size="middle" style={{ display: 'flex' }}>
        <YearCalendar
          year={2026}
          value={dates}
          onChange={setDates}
          hideYearTitle={false}
        >
          {(selected) => (
            <Space size="small" wrap>
              <Typography.Text type="secondary">
                已选 {selected.length} 天：
              </Typography.Text>
              {selected.length === 0 ? (
                <Typography.Text type="secondary">
                  点击或拖拽选择日期
                </Typography.Text>
              ) : (
                selected.map((date) => (
                  <Tag key={date} color="purple">
                    {date}
                  </Tag>
                ))
              )}
            </Space>
          )}
        </YearCalendar>
      </Space>
    </BusinessProvider>
  );
};

export default Demo;
