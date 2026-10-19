import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { Bubble } from '@aura-react-comp/x';
import { GradientBorder, TextShimmer, TiltCard, TypingDots } from '@aura-react-comp/motion';

/** 四种动效增强组合：思考态 / 生成流光 / 流光边框 / 3D 倾斜 */
export default () => {
  const [thinking, setThinking] = useState(true);

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Space>
        <Button size="small" onClick={() => setThinking((v) => !v)}>
          {thinking ? '结束思考' : '开始思考'}
        </Button>
        <span style={{ color: '#8a8984', fontSize: 12 }}>
          motion 为可选依赖，未安装时 Bubble 功能不受影响
        </span>
      </Space>

      {/* 1. 思考态：TypingDots（content 是字符串，自定义节点走 contentRender） */}
      <Bubble
        role="assistant"
        header={<span style={{ fontSize: 12, color: '#8a8984' }}>助手</span>}
        content=""
        contentRender={() =>
          thinking ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <TypingDots color="#534ab7" />
              <span style={{ fontSize: 13, color: '#8a8984' }}>正在思考…</span>
            </span>
          ) : (
            <span>已收到问题，正在组织回答。</span>
          )
        }
      />

      {/* 2. 生成态：header 里的文字流光 */}
      <Bubble
        role="assistant"
        header={
          <TextShimmer duration={1.8} highlightColor="rgba(0,0,0,0.45)">
            正在为你生成摘要…
          </TextShimmer>
        }
        content="本季度营收同比增长 23%，订阅收入贡献 61%。"
      />

      {/* 3. 流光边框包裹回答卡片 */}
      <GradientBorder radius={16} size={1.5} speed={4.5}>
        <Bubble role="assistant" content="这是带流光边框的 AI 回答卡片，光带沿边框缓慢绕行。" />
      </GradientBorder>

      {/* 4. 3D 倾斜卡片（移动鼠标体验） */}
      <TiltCard maxTilt={4} style={{ borderRadius: 16 }}>
        <Bubble
          role="assistant"
          variant="shadow"
          content="带 3D 倾斜的回答卡片——移动鼠标试试，倾斜与光泽都会跟随指针。"
        />
      </TiltCard>
    </Space>
  );
};
