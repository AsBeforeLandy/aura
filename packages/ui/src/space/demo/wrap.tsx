import React from 'react';
import { Space } from '@aura/ui';
import { Button } from '../../button/index';

const Demo: React.FC = () => (
  <Space wrap style={{ maxWidth: 300 }}>
    <Button>1</Button>
    <Button>2</Button>
    <Button>3</Button>
    <Button>4</Button>
    <Button>5</Button>
    <Button>6</Button>
  </Space>
);

export default Demo;
