import React from 'react';
import { Bar3D, Scene3D } from '@aura-react-comp/charts-3d';

/** 汇报周期 × 区域的交付量（与柱状矩阵示例同一数据，便于对照） */
const data = ['R1', 'R2', 'R3', 'R4'].flatMap((team, teamIndex) =>
  ['W1', 'W2', 'W3', 'W4', 'W5'].map((week, weekIndex) => ({
    x: week,
    z: team,
    value:
      120 +
      (teamIndex + 1) * 30 +
      weekIndex * 18 +
      Math.round(Math.sin(teamIndex * 1.3 + weekIndex) * 55),
  })),
);

const Demo: React.FC = () => (
  // inspection 预设：低角度自动环绕，无需任何操作即可持续展示
  <Scene3D height={400} preset="inspection">
    <Bar3D data={data} maxHeight={150} cellSize={22} />
  </Scene3D>
);

export default Demo;
