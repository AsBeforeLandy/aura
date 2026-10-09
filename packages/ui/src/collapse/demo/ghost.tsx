import React from 'react';
import { Collapse } from '@aura-react-comp/ui';

/** `expandIconPosition="start"` 箭头在前；`ghost` 极简样式，适合嵌在卡片 / 弹窗内。 */
export default () => (
  <Collapse ghost expandIconPosition="start" defaultActiveKey={['a']}>
    <Collapse.Item itemKey="a" title="什么是 Aura？">
      Aura 是基于 React 18 的现代化组件库，CSS Variables 驱动主题。
    </Collapse.Item>
    <Collapse.Item itemKey="b" title="如何自定义主题？">
      覆盖 --aura-* 设计令牌即可，支持亮暗两套。
    </Collapse.Item>
  </Collapse>
);
