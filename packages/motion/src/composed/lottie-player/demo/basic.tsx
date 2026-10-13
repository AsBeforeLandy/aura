import React from 'react';
import { Space } from 'antd';
import { LottiePlayer } from '@aura-react-comp/motion';

/**
 * src 指向远程 JSON（运行时加载）。
 * 若外链失效或宿主未安装 lottie-web，组件渲染占位，不影响页面其余部分。
 */
export default () => (
  <Space size={32} wrap>
    <LottiePlayer
      src="https://assets2.lottiefiles.com/packages/lf20_M9p23l.json"
      width={140}
      height={140}
    />
    <LottiePlayer
      src="https://assets2.lottiefiles.com/packages/lf20_M9p23l.json"
      loop={false}
      width={140}
      height={140}
    />
  </Space>
);
