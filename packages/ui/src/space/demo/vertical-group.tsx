import React from 'react';
import { Space } from '@aura-react-comp/ui';
import { Button } from '../../button/index';

const Demo: React.FC = () => (
  <Space direction="vertical">
    <Button>按钮一</Button>
    <Button variant="primary">按钮二</Button>
    <Button variant="dashed">按钮三</Button>
  </Space>
);

export default Demo;
