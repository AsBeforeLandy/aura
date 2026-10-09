import React from 'react';
import { Button, Card, message, Space } from '@aura-react-comp/ui';

/** 用 key 原位更新：loading 结束后换成 success，不重新弹出新消息。 */
export default () => {
  const handleUpload = () => {
    message.loading({ key: 'demo-upload', content: '正在上传附件...' });
    setTimeout(() => {
      message.success({
        key: 'demo-upload',
        content: (
          <span>
            附件上传成功，
            <Button variant="link" size="sm" onClick={() => message.info('跳转详情（示例）')}>
              查看详情
            </Button>
          </span>
        ),
      });
    }, 1500);
  };

  return (
    <Card>
      <Space>
        <Button variant="primary" onClick={handleUpload}>
          模拟上传（1.5s 后成功）
        </Button>
        <Button onClick={() => message.destroy('demo-upload')}>立即销毁</Button>
      </Space>
    </Card>
  );
};
