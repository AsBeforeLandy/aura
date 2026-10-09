import React, { useState } from 'react';
import { Slider } from '@aura-react-comp/ui';

/** `onChangeComplete` 在一次调节结束后触发（松开拖拽 / 点击轨道 / 单次键盘调节），
 * 适合用它替代 onChange 做搜索、保存等请求类操作。 */
export default () => {
  const [committed, setCommitted] = useState('尚未调节');

  return (
    <div>
      <Slider
        defaultValue={50}
        onChangeComplete={(value) => setCommitted(`已提交调节：${value}`)}
      />
      <p style={{ marginTop: 12, color: 'var(--aura-text-secondary)' }}>
        {committed}（拖动过程不会触发，松手才触发）
      </p>
    </div>
  );
};
