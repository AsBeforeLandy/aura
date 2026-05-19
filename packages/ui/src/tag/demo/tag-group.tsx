import React, { useState } from 'react';
import { Tag, TagCheckable, TagGroup, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [values, setValues] = useState(['react', 'vue']);

  return (
    <Space direction="vertical" size="sm">
      <TagGroup value={values} onChange={(v) => setValues(v as string[])}>
        <TagCheckable value="react">React</TagCheckable>
        <TagCheckable value="vue">Vue</TagCheckable>
        <TagCheckable value="angular">Angular</TagCheckable>
        <TagCheckable value="svelte">Svelte</TagCheckable>
        <TagCheckable value="solid">SolidJS</TagCheckable>
      </TagGroup>
      <Text variant="secondary">已选择：{values.join(', ') || '无'}</Text>
    </Space>
  );
};

export default Demo;
