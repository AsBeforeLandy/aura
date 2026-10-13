import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { PageTransition } from '@aura-react-comp/motion';

const PAGES: Record<string, { title: string; color: string }> = {
  '/home': { title: '首页', color: '#534ab7' },
  '/reports': { title: '报表', color: '#0f6e56' },
  '/settings': { title: '设置', color: '#185fa5' },
};

/** transitionKey 变化 → 旧页退出、新页进场（mode="wait"） */
export default () => {
  const [path, setPath] = useState('/home');
  const page = PAGES[path];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space>
        {Object.keys(PAGES).map((p) => (
          <Button key={p} type={path === p ? 'primary' : 'default'} onClick={() => setPath(p)}>
            {PAGES[p].title}
          </Button>
        ))}
      </Space>
      <PageTransition transitionKey={path} mode="wait">
        <div
          style={{
            padding: 40,
            borderRadius: 12,
            color: '#fff',
            fontSize: 22,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${page.color}, ${page.color}bb)`,
          }}
        >
          {page.title} —— 切换路由观察页面级转场
        </div>
      </PageTransition>
    </Space>
  );
};
