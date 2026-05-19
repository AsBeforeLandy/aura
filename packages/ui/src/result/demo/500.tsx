import React from 'react';
import { Result } from '@aura/ui';

const Demo: React.FC = () => (
  <Result
    variant="500"
    title="服务器错误"
    subtitle="服务器内部错误，请稍后再试。"
  />
);

export default Demo;
