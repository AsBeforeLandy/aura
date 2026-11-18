import React from 'react';
import { Surface3D, Scene3D } from '@aura-react-comp/charts-3d';

/** 环形波纹：sin(dist) 构造同心起伏，确定性生成 */
function buildRipple(rows: number, cols: number, amplitude: number) {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      const dx = col - cols / 2 + 0.5;
      const dz = row - rows / 2 + 0.5;
      const dist = Math.sqrt(dx * dx + dz * dz);
      return Math.round(Math.sin(dist * 0.9) * amplitude + amplitude);
    }),
  );
}

const ripple = buildRipple(16, 16, 45);

/** 双高斯山丘（大屏「能耗曲面」同款算法，用于对照线框模式） */
function buildHills(rows: number, cols: number) {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      const dx = col / (cols - 1) - 0.5;
      const dz = row / (rows - 1) - 0.5;
      return Math.round(
        50 +
          Math.exp(-(dx * dx + dz * dz) * 22) * 55 +
          Math.sin(col / 2 + row) * 6,
      );
    }),
  );
}

const hills = buildHills(14, 14);

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        环形波纹：顶点色沿三段色带渐变（可拖转视角）
      </div>
      <Scene3D height={360} cameraPosition={[260, 200, 300]} enableRotate>
        <Surface3D
          values={ripple}
          width={210}
          depth={210}
          maxHeight={80}
          colorRange={['#5CB9E0', '#668FE2', '#7E54DE']}
        />
      </Scene3D>
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        线框模式：叠加网格线，排查曲面结构与密度
      </div>
      <Scene3D
        height={320}
        cameraPosition={[280, 190, 320]}
        enableRotate
        autoRotate
      >
        <Surface3D
          values={hills}
          width={210}
          depth={210}
          maxHeight={70}
          wireframe
          colorRange={['#279BCC', '#668FE2', '#7E54DE']}
        />
      </Scene3D>
    </div>
  </div>
);

export default Demo;
