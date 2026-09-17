import React, { useState } from 'react';
import { Typography, Space } from 'antd';
import { CascaderPanel, BusinessProvider } from '@aura/business';
import type { CascaderOption } from '@aura/business';

const OPTIONS: CascaderOption[] = [
  {
    label: '华东大区',
    value: 'east',
    tooltips: '含江浙沪皖',
    children: [
      { label: '浙江省', value: 'zj' },
      { label: '江苏省', value: 'js' },
      {
        label: '上海市',
        value: 'sh',
        children: [
          { label: '浦东新区', value: 'pd' },
          { label: '徐汇区', value: 'xh' },
        ],
      },
    ],
  },
  {
    label: '华南大区',
    value: 'south',
    children: [
      { label: '广东省', value: 'gd' },
      { label: '福建省', value: 'fj' },
    ],
  },
  {
    label: '华北大区',
    value: 'north',
    children: [
      { label: '北京市', value: 'bj' },
      { label: '天津市', value: 'tj' },
    ],
  },
];

const Demo: React.FC = () => {
  const [values, setValues] = useState<string[]>([]);
  const [current, setCurrent] = useState<CascaderOption>();

  return (
    <BusinessProvider>
      <Space orientation="vertical" size="middle" style={{ display: 'flex' }}>
        <CascaderPanel
          options={OPTIONS}
          title="全部大区"
          value={values}
          onChange={setValues}
          onCurrentClick={setCurrent}
        />
        <Typography.Text type="secondary">
          当前展开：{current?.label ?? '（未选择）'}
        </Typography.Text>
        <Typography.Text>
          选中值：{values.length ? values.join('、') : '（空）'}
        </Typography.Text>
      </Space>
    </BusinessProvider>
  );
};

export default Demo;
