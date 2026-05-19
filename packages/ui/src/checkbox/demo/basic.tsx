import React, { useState } from 'react';
import { Checkbox, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [checked, setChecked] = useState(false);
  return (
    <Space direction="vertical" size="md">
      <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
        受控复选框：{checked ? '已选中' : '未选中'}
      </Checkbox>
      <Checkbox defaultChecked>默认选中</Checkbox>
      <Checkbox disabled>禁用未选</Checkbox>
      <Checkbox disabled checked>禁用已选</Checkbox>
    </Space>
  );
};

export default Demo;
