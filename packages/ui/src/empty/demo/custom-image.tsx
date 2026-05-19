import React from 'react';
import { Empty } from '@aura/ui';

const Demo: React.FC = () => (
  <Empty
    image={
      <img
        src="https://via.placeholder.com/200x160"
        alt="空状态"
        style={{ borderRadius: 8 }}
      />
    }
    description="图片加载后显示这里"
  />
);

export default Demo;
