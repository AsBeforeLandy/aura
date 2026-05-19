import React from 'react';
import { Result } from '@aura/ui';

const Demo: React.FC = () => (
  <Result
    variant="success"
    title="自定义图标"
    subtitle="使用 icon prop 覆盖默认图标"
    icon={
      <svg viewBox="0 0 24 24" width="72" height="72" fill="var(--aura-success)">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    }
  />
);

export default Demo;
