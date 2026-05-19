import React from 'react';
import { Flex, Text, Space, Card } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Text>gap="sm" (8px)</Text>
    <Flex gap="sm">
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">1</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">2</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">3</Card>
    </Flex>
    <Text>gap="md" (16px)</Text>
    <Flex gap="md">
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">1</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">2</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">3</Card>
    </Flex>
    <Text>gap="lg" (24px)</Text>
    <Flex gap="lg">
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">1</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">2</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">3</Card>
    </Flex>
    <Text>gap=32 (自定义)</Text>
    <Flex gap={32}>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">1</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">2</Card>
      <Card style={{ width: 60, height: 60, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} size="sm">3</Card>
    </Flex>
  </Space>
);

export default Demo;
