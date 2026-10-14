import React, { useState } from 'react';
import { ReorderGroup, ReorderItem } from '@aura-react-comp/motion';

/** 按住任意条目上下拖动，其余条目实时让位 */
export default () => {
  const [items, setItems] = useState(['整理发布清单', '补充组件 demo', '验证 OIDC 发布', '写周报']);

  return (
    <ReorderGroup
      axis="y"
      values={items}
      onReorder={setItems}
      style={{ listStyle: 'none', margin: 0, padding: 0, maxWidth: 360, display: 'grid', gap: 8 }}
    >
      {items.map((item) => (
        <ReorderItem
          key={item}
          value={item}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid #d3d1c7',
            background: '#faf9f5',
            cursor: 'grab',
            userSelect: 'none',
            fontWeight: 500,
          }}
          whileDrag={{ background: '#eae8f9', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
        >
          {item}
        </ReorderItem>
      ))}
    </ReorderGroup>
  );
};
