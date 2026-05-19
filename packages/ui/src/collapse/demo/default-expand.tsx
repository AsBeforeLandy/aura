import React from 'react';
import { Collapse } from '@aura/ui';

const Demo: React.FC = () => (
  <Collapse defaultActiveKey={['1', '3']}>
    <Collapse.Item itemKey="1" title="默认展开1">
      这个面板默认展开。
    </Collapse.Item>
    <Collapse.Item itemKey="2" title="默认收起">
      这个面板默认收起。
    </Collapse.Item>
    <Collapse.Item itemKey="3" title="默认展开3">
      这个面板也默认展开。
    </Collapse.Item>
  </Collapse>
);

export default Demo;
