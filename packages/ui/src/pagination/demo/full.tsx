import React from 'react';
import { Pagination } from '@aura/ui';

const Demo: React.FC = () => (
  <Pagination
    total={500}
    showSizeChanger
    showQuickJumper
    defaultCurrent={3}
  />
);

export default Demo;
