import React from 'react';
import { Result, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Result
    variant="success"
    title="操作成功"
    subtitle="您的提交已成功处理，我们会在 24 小时内给您反馈。"
    extra={
      <Button>
        返回首页
      </Button>
    }
  />
);

export default Demo;
