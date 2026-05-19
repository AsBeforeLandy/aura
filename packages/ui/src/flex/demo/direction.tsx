import React from 'react';
import { Flex, Text, Space, Card } from '@aura/ui';

const Demo: React.FC = () => (
  <Space size="lg">
    <Space direction="vertical" size={4}>
      <Text>row</Text>
      <Flex direction="row" gap="sm">
        <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">1</Card>
        <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">2</Card>
      </Flex>
    </Space>
    <Space direction="vertical" size={4}>
      <Text>column</Text>
      <Flex direction="column" gap="sm">
        <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">1</Card>
        <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">2</Card>
      </Flex>
    </Space>
  </Space>
);

export default Demo;
