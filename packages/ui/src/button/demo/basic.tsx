import React from 'react';
import { Button } from '../index';

const App = () => (
  <div style={{ display: 'flex', gap: 12 }}>
    <Button type="primary">主要按钮</Button>
    <Button type="default">默认按钮</Button>
    <Button type="dashed">虚线按钮</Button>
    <Button type="text">文字按钮</Button>
    <Button type="link">链接按钮</Button>
  </div>
);

export default App;
