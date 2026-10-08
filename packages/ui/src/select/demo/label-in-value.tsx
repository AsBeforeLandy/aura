import React from 'react';
import { Select, Space } from '@aura/ui';

/** labelInValue：取值携带 label（提交表单常需要）；maxTagCount：多选超出收敛为 +N...。 */
export default () => (
  <Space direction="vertical" style={{ width: '100%' }}>
    <Select
      labelInValue
      placeholder="单选（值带 label）"
      onChange={(value) => console.log('labelInValue:', value)}
      options={[
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
        { label: '樱桃', value: 'cherry' },
      ]}
    />
    <Select
      labelInValue
      multiple
      maxTagCount={2}
      placeholder="多选，最多显示 2 个标签"
      options={[
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
        { label: '樱桃', value: 'cherry' },
        { label: '葡萄', value: 'grape' },
      ]}
    />
  </Space>
);
