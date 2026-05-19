import React from 'react';
import { Flex, Text, Space, Card } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Text>justify="center"</Text>
    <Flex justify="center" gap="sm">
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">1</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">2</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">3</Card>
    </Flex>
    <Text>justify="between"</Text>
    <Flex justify="between" gap="sm">
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">1</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">2</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">3</Card>
    </Flex>
    <Text>align="center" (不同高度)</Text>
    <Flex align="center" gap="sm">
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">1</Card>
      <Card style={{ width: 60, height: 80, background: '#a78bfa', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} size="sm">2</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">3</Card>
    </Flex>
  </Space>
);

export default Demo;
