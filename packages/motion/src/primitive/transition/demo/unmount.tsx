import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { AnimatePresence } from 'motion/react';
import { Slide, Zoom, Fade } from '@aura-react-comp/motion';

/** 卸载式：条件渲染 + AnimatePresence，卸载时播放退场动画 */
export default () => {
  const [open, setOpen] = useState(false);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Button type="primary" onClick={() => setOpen((v) => !v)}>
        {open ? '关闭' : '打开'}弹层
      </Button>
      <AnimatePresence>
        {open && (
          <Slide key="slide" direction="up">
            <div style={{ padding: 16, border: '1px solid #d3d1c7', borderRadius: 12 }}>
              Slide：卸载时会播放退场动画
            </div>
          </Slide>
        )}
        {open && (
          <Zoom key="zoom">
            <div style={{ padding: 16, border: '1px solid #d3d1c7', borderRadius: 12 }}>
              Zoom：从 92% 缩放长出来
            </div>
          </Zoom>
        )}
        {open && (
          <Fade key="fade">
            <div style={{ padding: 16, border: '1px solid #d3d1c7', borderRadius: 12 }}>
              Fade：纯淡入淡出
            </div>
          </Fade>
        )}
      </AnimatePresence>
    </Space>
  );
};
