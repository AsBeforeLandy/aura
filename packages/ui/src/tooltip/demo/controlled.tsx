import React, { useState } from 'react';
import { Button, Tooltip } from '@aura/ui';

/** 受控模式：open + onOpenChange，配合外部逻辑决定何时显示（如校验失败时强制提示）。 */
export default () => {
  const [forced, setForced] = useState(false);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Tooltip
        content="该项为必填项，请补全后提交"
        open={forced}
        placement="rightTop"
      >
        <Button variant="dashed">必填字段（受控提示）</Button>
      </Tooltip>
      <Button variant={forced ? 'primary' : 'default'} onClick={() => setForced((v) => !v)}>
        {forced ? '关闭强制提示' : '模拟校验失败'}
      </Button>
    </div>
  );
};
