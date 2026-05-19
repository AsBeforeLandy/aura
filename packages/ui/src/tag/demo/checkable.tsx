import React, { useState } from 'react';
import { Tag, TagCheckable, TagGroup, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [selected, setSelected] = useState<(string | number)[]>([]);

  return (
    <Space direction="vertical" size="md">
      <TagGroup value={selected} onChange={setSelected}>
        <TagCheckable value="react">React</TagCheckable>
        <TagCheckable value="vue">Vue</TagCheckable>
        <TagCheckable value="angular">Angular</TagCheckable>
        <TagCheckable value="svelte">Svelte</TagCheckable>
      </TagGroup>
      <Text style={{ fontSize: 13 }}>已选：{selected.join(', ') || '无'}</Text>
    </Space>
  );
};

export default Demo;
