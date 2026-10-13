import React, { useState } from 'react';
import { LayoutGroup, motion } from 'motion/react';

const items = [
  { id: 'a', title: '项目 Alpha', desc: '共享元素过渡：卡片展开为详情' },
  { id: 'b', title: '项目 Beta', desc: 'layoutId 相同的元素会互相衔接' },
  { id: 'c', title: '项目 Gamma', desc: '同组内同一时刻只渲染一个同 id 元素' },
];

/** 点击卡片 → 同 layoutId 的详情面板"从卡片长出来" */
export default () => {
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) {
    const item = items.find((i) => i.id === selected)!;
    return (
      <LayoutGroup>
        <motion.div
          layoutId={`card-${selected}`}
          onClick={() => setSelected(null)}
          style={{
            padding: 24,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #534ab7, #7f77dd)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 600 }}>{item.title}</div>
          <div style={{ marginTop: 8, opacity: 0.9 }}>{item.desc}</div>
          <div style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>点击任意处返回列表</div>
        </motion.div>
      </LayoutGroup>
    );
  }

  return (
    <LayoutGroup>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layoutId={`card-${item.id}`}
            onClick={() => setSelected(item.id)}
            style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid #d3d1c7',
              background: '#faf9f5',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {item.title}
          </motion.div>
        ))}
      </div>
    </LayoutGroup>
  );
};
