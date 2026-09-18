import React, { useState } from 'react';
import { Conversations } from '@aura/x';

const SESSIONS = [
  { key: 's1', label: '周报助手', timestamp: '09-17' },
  { key: 's2', label: '代码审查', timestamp: '09-16' },
  { key: 's3', label: 'React 18 迁移', timestamp: '09-15' },
];

export default () => {
  const [activeKey, setActiveKey] = useState<React.Key | undefined>('s1');

  return (
    <div style={{ maxWidth: 320 }}>
      <Conversations
        items={SESSIONS}
        activeKey={activeKey}
        onActiveChange={setActiveKey}
        menu={(item) => ({
          items: [
            { key: 'rename', label: '重命名' },
            { key: 'delete', label: '删除', danger: true },
          ],
          onClick: (_item, menuKey) => {
            if (menuKey === 'delete') {
              setActiveKey((prev) => (prev === item.key ? undefined : prev));
            }
          },
        })}
      />
    </div>
  );
};
