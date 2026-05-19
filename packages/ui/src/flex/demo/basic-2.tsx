import React from 'react';
import { Flex, Card } from '@aura/ui';

const Demo: React.FC = () => (
  <Flex gap="md">
    <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">1</Card>
    <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">2</Card>
    <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">3</Card>
  </Flex>
);

export default Demo;
