import React from 'react';
import { Collapse } from '@aura/ui';

const Demo: React.FC = () => (
  <Collapse accordion>
    <Collapse.Item itemKey="1" title="唯一面板一">
      手风琴模式下，同时只能展开一个面板。
    </Collapse.Item>
    <Collapse.Item itemKey="2" title="唯一面板二">
      展开另一个时，前一个会自动收起。
    </Collapse.Item>
    <Collapse.Item itemKey="3" title="唯一面板三">
      这是第三个面板。
    </Collapse.Item>
  </Collapse>
);

export default Demo;
