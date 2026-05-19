import React from 'react';
import { Alert, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Alert variant="info" title="提示信息" closable showIcon>
      这是一条可关闭的提示信息。
    </Alert>
    <Alert variant="success" title="操作成功" closable showIcon>
      您的操作已成功完成。
    </Alert>
    <Alert variant="warning" closable showIcon>
      这是一条可关闭的警告提示。
    </Alert>
  </Space>
);

export default Demo;
