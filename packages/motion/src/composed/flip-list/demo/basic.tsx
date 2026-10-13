import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { FlipList } from '@aura-react-comp/motion';

interface Item {
  id: string;
  label: string;
  score: number;
}

let seq = 3;

/** 增删与随机排序，观察存量项的平滑位移 */
export default () => {
  const [items, setItems] = useState<Item[]>([
    { id: 'a', label: '任务 A', score: 92 },
    { id: 'b', label: '任务 B', score: 87 },
    { id: 'c', label: '任务 C', score: 78 },
  ]);

  const add = () =>
    setItems((list) => {
      const item = { id: `i${seq}`, label: `任务 ${String.fromCharCode(65 + (seq % 26))}`, score: 60 + Math.round(Math.random() * 38) };
      seq += 1;
      return [...list, item];
    });
  const shuffle = () => setItems((list) => [...list].sort(() => Math.random() - 0.5));
  const remove = () =>
    setItems((list) => (list.length > 1 ? list.filter((_, i) => i !== Math.floor(Math.random() * list.length)) : list));

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space>
        <Button onClick={add}>新增</Button>
        <Button onClick={shuffle}>随机排序</Button>
        <Button danger onClick={remove}>
          随机删除
        </Button>
      </Space>
      <FlipList
        items={items.map((it) => ({
          id: it.id,
          node: (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #d3d1c7',
                marginBottom: 8,
              }}
            >
              <span style={{ fontWeight: 500 }}>{it.label}</span>
              <span style={{ color: '#5f5e5a' }}>{it.score} 分</span>
            </div>
          ),
        }))}
      />
    </Space>
  );
};
