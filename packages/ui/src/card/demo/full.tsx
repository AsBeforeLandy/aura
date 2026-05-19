import React from 'react';
import { Card, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Card hoverable variant="elevated">
    <Card.Cover>
      <img
        src="https://via.placeholder.com/400x200"
        alt="封面"
        style={{ display: 'block', width: '100%' }}
      />
    </Card.Cover>
    <Card.Header>
      <Card.Title>卡片标题</Card.Title>
    </Card.Header>
    <Card.Body>
      这是卡片的正文内容，可以放置任意子元素。
    </Card.Body>
    <Card.Actions>
      <Button>确认</Button>
      <Button>取消</Button>
    </Card.Actions>
    <Card.Footer>最后更新于 2024 年</Card.Footer>
  </Card>
);

export default Demo;
