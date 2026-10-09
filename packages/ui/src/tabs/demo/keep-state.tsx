import React, { useState } from 'react';
import { Button, Tabs } from '@aura-react-comp/ui';

/** 默认保留已访问面板的挂载状态：切走再切回，表单输入不丢失；`destroyInactiveTabPane` 可关闭。 */
export default () => {
  const [saved, setSaved] = useState('');

  return (
    <div>
      <Tabs defaultActiveKey="form">
        <Tabs.Tab tabKey="form" title="编辑资料">
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="在这里输入后切到其他 Tab 再切回"
              style={{
                flex: 1,
                padding: '6px 12px',
                border: '1px solid var(--aura-border)',
                borderRadius: 'var(--aura-radius-md)',
              }}
            />
            <Button variant="primary" onClick={() => setSaved('已保存（示例）')}>
              保存
            </Button>
          </div>
        </Tabs.Tab>
        <Tabs.Tab tabKey="log" title="操作日志">
          <p>这里放日志内容：{saved}</p>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};
