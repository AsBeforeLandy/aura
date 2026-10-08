import React from 'react';
import { Alert, Space } from '@aura/ui';

/** `banner` 通栏模式：去圆角、居中展示，适合页面顶部公告。 */
export default () => (
  <Space direction="vertical" style={{ width: '100%' }}>
    <Alert banner title="系统将于本周日 02:00-04:00 进行维护升级" closable />
    <Alert banner variant="warning" showIcon title="您有 3 张发票待认证" action={<a style={{ color: 'inherit' }}>去处理</a>} />
  </Space>
);
