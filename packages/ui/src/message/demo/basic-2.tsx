import React from 'react';
import { message, Space, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size="md">
    <Button onClick={() => message.success('操作成功完成')}>
      Success
    </Button>
    <Button onClick={() => message.error('操作失败，请重试')}>
      Error
    </Button>
    <Button onClick={() => message.warning('请注意数据安全')}>
      Warning
    </Button>
    <Button onClick={() => message.info('这是一条信息提示')}>
      Info
    </Button>
    <Button onClick={() => message.loading('正在加载中...')}>
      Loading
    </Button>
  </Space>
);

export default Demo;
