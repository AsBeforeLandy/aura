import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { useViewTransition, ViewTransition } from '@aura-react-comp/motion';

/** 点击切换：数字卡片以原生 View Transition 衔接（支持的浏览器），其余直接切换 */
export default () => {
  const [page, setPage] = useState(1);
  const withTransition = useViewTransition();

  const go = (next: number) => withTransition(() => setPage(next));

  return (
    <Space direction="vertical" size={16}>
      <Space>
        {[1, 2, 3].map((n) => (
          <Button key={n} type={page === n ? 'primary' : 'default'} onClick={() => go(n)}>
            第 {n} 页
          </Button>
        ))}
      </Space>
      <ViewTransition name="demo-page-card">
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #185fa5, #378add)',
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          第 {page} 页内容 —— Chrome/Edge/Safari 中切换时有原生平滑转场，Firefox 中直接切换
        </div>
      </ViewTransition>
    </Space>
  );
};
