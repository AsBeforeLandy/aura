import React from 'react';
import { Empty, Button } from '@aura-react-comp/ui';

const Demo: React.FC = () => (
  <Empty description="暂无数据">
    <Button>
      立即创建
    </Button>
  </Empty>
);

export default Demo;
