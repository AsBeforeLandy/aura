import React from 'react';
import { Pagination } from '@aura-react-comp/ui';

const Demo: React.FC = () => (
  <Pagination
    total={500}
    showSizeChanger
    showQuickJumper
    defaultCurrent={3}
  />
);

export default Demo;
