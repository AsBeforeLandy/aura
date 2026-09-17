import { useState } from 'react';
import { Button, Card, Input, Space, Switch, Tag } from 'antd';
import { BusinessProvider } from '@aura/business';

const Demo = () => {
  const [dark, setDark] = useState(false);
  const [compact, setCompact] = useState(false);

  return (
    <>
      <Space size="large" style={{ marginBottom: 16 }}>
        <span>
          暗色模式
          <Switch
            checked={dark}
            onChange={setDark}
            style={{ marginLeft: 8 }}
          />
        </span>
        <span>
          紧凑模式
          <Switch
            checked={compact}
            onChange={setCompact}
            style={{ marginLeft: 8 }}
          />
        </span>
      </Space>

      {/*
        dark 需同时作用于两处：
        - BusinessProvider 的 dark → 切 antd 暗色算法
        - data-theme → 切 Aura 令牌作用域（本示例限定在容器上）
      */}
      <div data-theme={dark ? 'dark' : 'light'}>
        <BusinessProvider dark={dark} compact={compact}>
          <Card size="small" title="桥接后的 antd 组件">
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Button type="primary">主要按钮</Button>
                <Button>默认按钮</Button>
                {/* colorLink 已跟随主色，不再是语义蓝 */}
                <Button type="link">链接按钮</Button>
              </Space>
              <Space wrap>
                <Tag color="success">成功</Tag>
                <Tag color="warning">警告</Tag>
                <Tag color="error">错误</Tag>
              </Space>
              <Input placeholder="控件高度与圆角已对齐 Aura 令牌" />
            </Space>
          </Card>
        </BusinessProvider>
      </div>
    </>
  );
};

export default Demo;
