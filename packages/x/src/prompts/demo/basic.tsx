import React, { useState } from 'react';
import { Prompts } from '@aura/x';

const ITEMS = [
  { key: 'a', label: '周报助手', description: '按本周提交生成工作周报', icon: '📝' },
  { key: 'b', label: '代码审查', description: '检查潜在缺陷与风格', icon: '🔍' },
  { key: 'c', label: '生成测试用例', description: '正常 / 边界 / 异常', icon: '🧪' },
];

export default () => {
  const [picked, setPicked] = React.useState<React.ReactNode>('');

  return (
    <div style={{ maxWidth: 640 }}>
      <Prompts
        items={ITEMS}
        onItemClick={(item) => setPicked(item.label)}
        title="试试这样问"
      />
      {picked ? (
        <p style={{ fontSize: 13, color: 'var(--aura-text-secondary)' }}>
          已选择：{picked}
        </p>
      ) : null}
    </div>
  );
};
