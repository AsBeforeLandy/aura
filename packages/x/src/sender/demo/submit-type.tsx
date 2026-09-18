import React, { useState } from 'react';
import { Sender } from '@aura/x';

export default () => {
  const [value, setValue] = useState('Shift + Enter 才会提交这条内容');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640 }}>
      {/* shiftEnter 键位 + header / footer 插槽 + 字数统计 */}
      <Sender
        value={value}
        onChange={setValue}
        submitType="shiftEnter"
        placeholder="Shift + Enter 提交，Enter 换行"
        header={
          <span>
            📎 附件条插槽：<i>报表.pdf</i>
          </span>
        }
        footer={<span style={{ marginLeft: 'auto' }}>{value.length} 字</span>}
      />

      {/* 默认 enter 键位对照 */}
      <Sender submitType="enter" placeholder="对照：Enter 提交（默认）" footer={<span style={{ marginLeft: 'auto' }}>Enter 提交</span>} />
    </div>
  );
};
