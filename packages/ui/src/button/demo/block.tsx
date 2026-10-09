import React from 'react';
import { Button, Space } from '@aura-react-comp/ui';

/** block 撑满容器；href 渲染为链接按钮，禁用时不可点击。 */
export default () => (
  <Space direction="vertical" style={{ width: '100%' }}>
    <Button block variant="primary">
      全宽主按钮
    </Button>
    <Space>
      <Button href="https://example.com" target="_blank">
        链接按钮（新窗口）
      </Button>
      <Button href="https://example.com" disabled>
        禁用的链接按钮
      </Button>
    </Space>
  </Space>
);
