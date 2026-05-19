import React from 'react';
import { Collapse } from '@aura/ui';

const Demo: React.FC = () => (
  <Collapse>
    <Collapse.Item itemKey="1" title="面板一">
      这是面板一的内容，可以包含任意 React 元素。
    </Collapse.Item>
    <Collapse.Item itemKey="2" title="面板二">
      这是面板二的内容，支持多个面板同时展开。
    </Collapse.Item>
    <Collapse.Item itemKey="3" title="面板三">
      这是面板三的内容。
    </Collapse.Item>
  </Collapse>
);

export default Demo;
