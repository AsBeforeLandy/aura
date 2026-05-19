import React from 'react';
import { Result, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Result
    variant="404"
    title="页面未找到"
    subtitle="抱歉，您访问的页面不存在或已被移除。"
    extra={
      <Button>
        返回首页
      </Button>
    }
  />
);

export default Demo;
