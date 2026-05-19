import React, { useState } from 'react';
import { Input } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState('');

  return (
  <Input.Search
    placeholder="搜索关键词"
    onSearch={(value) => console.log('搜索:', value)}
  />
);
};

export default Demo;
