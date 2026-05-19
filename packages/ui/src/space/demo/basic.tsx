import React from 'react';
import { Space } from '@aura/ui';
import { Button } from '../../button/index';

const Demo: React.FC = () => (
  <Space>
    <Button>默认按钮</Button>
    <Button variant="primary">主按钮</Button>
    <Button variant="dashed">虚线按钮</Button>
  </Space>
);

export default Demo;
