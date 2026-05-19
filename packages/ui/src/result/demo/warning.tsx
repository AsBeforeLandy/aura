import React from 'react';
import { Result } from '@aura/ui';

const Demo: React.FC = () => (
  <Result
    variant="warning"
    title="注意"
    subtitle="此操作可能会影响系统稳定性，请谨慎操作。"
  />
);

export default Demo;
