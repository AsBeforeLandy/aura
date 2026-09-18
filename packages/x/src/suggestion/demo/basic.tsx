import React, { useState } from 'react';
import { Suggestion } from '@aura/x';

const SUGGESTIONS = [
  { key: 's1', label: '帮我总结上面的结论' },
  { key: 's2', label: '给出可执行的下一步' },
  { key: 's3', label: '换个更简单的说法' },
];

export default () => {
  const [selected, setSelected] = useState<React.ReactNode>('');

  return (
    <div style={{ maxWidth: 420 }}>
      <Suggestion items={SUGGESTIONS} onSelect={(item) => setSelected(item.label)} />
      {selected ? (
        <p style={{ fontSize: 13, color: 'var(--aura-text-secondary)' }}>
          已选择：{selected}
        </p>
      ) : null}
    </div>
  );
};
