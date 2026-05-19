import React from 'react';
import { Select } from '@aura/ui';

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
];

const Demo: React.FC = () => (
  <Select style={{ maxWidth: 400 }} options={options} loading placeholder="加载中..." />
);

export default Demo;
