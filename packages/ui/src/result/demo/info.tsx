import React from 'react';
import { Result } from '@aura-react-comp/ui';

const Demo: React.FC = () => (
  <Result
    variant="info"
    title="提示"
    subtitle="您的账户将在 30 天后到期，请及时续费。"
  />
);

export default Demo;
