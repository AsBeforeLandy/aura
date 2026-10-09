import React from 'react';
import { Alert, Button, Space } from '@aura-react-comp/ui';
import { WarningTriangleFilled } from '@aura-react-comp/icons';

/** `icon` 自定义图标；`action` 渲染右侧操作区。 */
export default () => (
  <Space direction="vertical" style={{ width: '100%' }}>
    <Alert
      variant="warning"
      showIcon
      icon={<WarningTriangleFilled size={16} />}
      title="配额即将用尽"
      action={<Button size="sm" variant="primary">立即扩容</Button>}
    >
      本月 API 调用量已使用 92%，建议升级套餐或设置用量告警。
    </Alert>
    <Alert
      variant="info"
      title="新版本可用"
      action={<Button size="sm" variant="link">查看更新日志</Button>}
    >
      v2.6.0 已发布，包含性能优化与若干问题修复。
    </Alert>
  </Space>
);
