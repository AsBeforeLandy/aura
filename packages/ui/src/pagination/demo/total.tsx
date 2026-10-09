import React, { useState } from 'react';
import { Pagination } from '@aura-react-comp/ui';

/** `showTotal` 展示总条数与当前区间；`pageSizeOptions` 自定义条数选项；`onShowSizeChange` 独立回调。 */
export default () => {
  const [log, setLog] = useState('尚未切换条数');

  return (
    <div>
      <Pagination
        total={287}
        showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`}
        showSizeChanger
        pageSizeOptions={[10, 30, 50]}
        onShowSizeChange={(_current, size) => setLog(`每页条数已切换为 ${size}`)}
        showQuickJumper
      />
      <p style={{ marginTop: 12, color: 'var(--aura-text-secondary)' }}>{log}</p>
    </div>
  );
};
