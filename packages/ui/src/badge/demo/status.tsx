import React from 'react';
import { Badge, Space } from '@aura/ui';

/** 状态点模式（不计数）：success / processing / error / warning / default 配合文本。 */
export default () => (
  <Space direction="vertical" size="md">
    <Badge status="success" text="运行正常" />
    <Badge status="processing" text="部署中" />
    <Badge status="error" text="服务异常" />
    <Badge status="warning" text="配额告警" />
    <Badge status="default" text="已停用" />
  </Space>
);
