import React from 'react';
import { Textarea } from '@aura/ui';

const Demo: React.FC = () => (
  <Textarea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="最少 2 行，最多 6 行" />
);

export default Demo;
