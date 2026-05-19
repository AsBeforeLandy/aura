import React from 'react';
import { Card } from '@aura/ui';

const Demo: React.FC = () => (
  <Card loading style={{ maxWidth: 300 }}>
    <Card.Body>不会显示的内容</Card.Body>
  </Card>
);

export default Demo;
