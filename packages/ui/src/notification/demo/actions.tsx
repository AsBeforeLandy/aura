import React from 'react';
import { Button, notification, Space } from '@aura-react-comp/ui';

/** 底部操作区 + 用 key 原位更新通知状态。 */
export default () => {
  const handleReview = () => {
    notification.info({
      key: 'demo-review',
      title: '新的审批请求',
      content: '张三提交了「差旅报销」审批，等待你处理。',
      actions: (
        <Space>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              notification.success({
                key: 'demo-review',
                title: '已通过',
                content: '「差旅报销」审批已通过。',
                duration: 0,
              });
            }}
          >
            通过
          </Button>
          <Button size="sm" onClick={() => notification.destroy('demo-review')}>
            忽略
          </Button>
        </Space>
      ),
    });
  };

  return (
    <Space>
      <Button variant="primary" onClick={handleReview}>
        发起审批通知
      </Button>
      <Button onClick={() => notification.destroy()}>全部关闭</Button>
    </Space>
  );
};
