import React from 'react';
import { Result } from '@aura/ui';

const Demo: React.FC = () => (
  <Result
    variant="403"
    title="无访问权限"
    subtitle="您没有权限访问此资源，请联系管理员。"
  />
);

export default Demo;
