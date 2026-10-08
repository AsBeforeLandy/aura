import React from 'react';
import { Button, Space } from '@aura/ui';
import { Plus, Search } from '@aura/icons';

/** icon 属性：图标置于内容左侧；loading 时自动替换为旋转图标。 */
export default () => (
  <Space direction="vertical">
    <Space>
      <Button variant="primary" icon={<Plus size={14} />}>
        新建条目
      </Button>
      <Button icon={<Search size={14} />}>搜索</Button>
    </Space>
    <Button variant="primary" loading icon={<Plus size={14} />}>
      保存中（图标被替换）
    </Button>
  </Space>
);
