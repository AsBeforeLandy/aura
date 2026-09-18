import React, { useState } from 'react';
import { Sender } from '@aura/x';

export default () => {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
      <Sender
        loading={loading}
        placeholder="Enter 发送，Shift + Enter 换行"
        onSubmit={(content) => {
          setLog((prev) => [...prev, `已提交：${content}`]);
          setLoading(true); // 演示：进入生成态，按钮变为「停止」
          setTimeout(() => setLoading(false), 2000);
        }}
        onCancel={() => setLog((prev) => [...prev, '已取消'])}
      />
      {log.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--aura-text-secondary)' }}>
          {log.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
