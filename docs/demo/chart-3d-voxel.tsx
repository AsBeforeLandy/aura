import React from 'react';
import { Voxel3D, Scene3D } from '@aura-react-comp/charts-3d';

/**
 * 区域 × 机柜层 × 时间的温度采样：三维体素热力的典型场景。
 * 值（温度）→ 色带颜色，三层堆叠可在旋转中逐层检视。
 */
const data = ['R1', 'R2', 'R3', 'R4'].flatMap((room, roomIndex) =>
  ['L1', 'L2', 'L3'].flatMap((layer, layerIndex) =>
    ['周一', '周三', '周五', '周日'].map((day, dayIndex) => ({
      x: day,
      y: layer,
      z: room,
      value: Math.round(
        24 +
          roomIndex * 3 +
          layerIndex * 4 +
          Math.sin(dayIndex * 1.4 + roomIndex) * 8 +
          Math.cos(layerIndex * 2 + dayIndex * 0.7) * 5,
      ),
    })),
  ),
);

const Demo: React.FC = () => (
  <Scene3D height={420} cameraPosition={[300, 240, 360]} enableRotate>
    <Voxel3D
      data={data}
      voxelSize={15}
      colorRange={['#0c4a6e', '#38bdf8', '#fde68a']}
    />
  </Scene3D>
);

export default Demo;
