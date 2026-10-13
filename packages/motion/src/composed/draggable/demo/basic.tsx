import React from 'react';
import { Draggable } from '@aura-react-comp/motion';

const chip: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 24,
  background: '#534ab7',
  color: '#fff',
  fontWeight: 500,
  cursor: 'grab',
  userSelect: 'none',
};

/** 在容器内拖动；松手后吸附到 40px 网格 */
export default () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <div
      style={{
        position: 'relative',
        height: 200,
        borderRadius: 12,
        border: '1px dashed #b4b2a9',
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 39px, #f1efe8 39px, #f1efe8 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #f1efe8 39px, #f1efe8 40px)',
      }}
    >
      <Draggable bounds="parent" grid={[40, 40]} style={{ position: 'absolute', top: 16, left: 16 }}>
        <div style={chip}>拖我（40px 网格吸附）</div>
      </Draggable>
    </div>
    <div
      style={{
        position: 'relative',
        height: 120,
        borderRadius: 12,
        border: '1px dashed #b4b2a9',
      }}
    >
      <Draggable bounds="parent" axis="x" style={{ position: 'absolute', top: 16, left: 16 }}>
        <div style={{ ...chip, background: '#0f6e56' }}>只能左右拖</div>
      </Draggable>
    </div>
  </div>
);
