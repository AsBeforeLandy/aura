import React from 'react';
import { Collapse } from '@aura/ui';

const Demo: React.FC = () => (
  <Collapse>
    <Collapse.Item itemKey="1" title="正常面板">
      可以正常展开。
    </Collapse.Item>
    <Collapse.Item itemKey="2" title="禁用面板（不可点击）" disabled>
      这个面板被禁用了，无法展开。
    </Collapse.Item>
    <Collapse.Item itemKey="3" title="另一个正常面板">
      也可以正常展开。
    </Collapse.Item>
  </Collapse>
);

export default Demo;
