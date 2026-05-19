import React, { useState } from 'react';
import { Dropdown, Button } from '@aura/ui';

const menuItems = [
  { key: 'edit', label: '编辑' },
  { key: 'copy', label: '复制' },
  { key: 'paste', label: '粘贴' },
  { key: 'delete', label: '删除', danger: true },
];

const Demo: React.FC = () => {
  const [clickedKey, setClickedKey] = useState('');

  return (
    <Dropdown
      menu={menuItems}
      trigger="click"
      onMenuClick={(key) => setClickedKey(key)}
    >
      <Button>点击打开 {clickedKey && `(点击了: ${clickedKey})`}</Button>
    </Dropdown>
  );
};

export default Demo;
