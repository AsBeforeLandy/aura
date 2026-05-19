import React from 'react';
import { Alert, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Alert variant="default" showIcon>
      这是一条默认提示信息
    </Alert>
    <Alert variant="info" showIcon title="提示">
      这是一条信息提示，用于告知用户一些重要信息。
    </Alert>
    <Alert variant="success" showIcon title="成功">
      操作已成功完成！
    </Alert>
    <Alert variant="warning" showIcon title="警告">
      请注意，此操作可能存在风险。
    </Alert>
    <Alert variant="error" showIcon title="错误">
      操作失败，请稍后重试。
    </Alert>
    <Alert variant="info" showIcon closable title="可关闭">
      点击右侧按钮关闭此提示。
    </Alert>
    <Alert variant="info" closable>
      无标题可关闭提示
    </Alert>
  </Space>
);

export default Demo;
