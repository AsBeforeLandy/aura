import React from 'react';
import { Scatter3D, Scene3D } from '@aura-react-comp/charts-3d';

/**
 * 按值渐变 + 自动旋转的地形样例。
 *
 * y 高度 = f(x, z)：双高斯山丘叠加，颜色沿「品牌紫 → 天蓝」色带按 y 映射——
 * 同一份数据，位置和高讲同一个故事，颜色强化海拔的阅读。
 */
function buildTerrain() {
  const points: { x: number; y: number; z: number; category: string }[] = [];
  for (let gx = 0; gx < 14; gx += 1) {
    for (let gz = 0; gz < 14; gz += 1) {
      const x = gx * 8 - 52;
      const z = gz * 8 - 52;
      const dx = gx / 13 - 0.32;
      const dz = gz / 13 - 0.62;
      const y = Math.round(
        18 +
          Math.exp(-(dx * dx + dz * dz) * 14) * 52 +
          Math.exp(-((gx / 13 - 0.7) ** 2 + (gz / 13 - 0.4) ** 2) * 26) * 34,
      );
      points.push({ x, y, z, category: '海拔' });
    }
  }
  return points;
}

const data = buildTerrain();

const Demo: React.FC = () => (
  // autoRotate：展示模式的标配，无需用户拖动也能呈现三维结构
  <Scene3D
    height={400}
    cameraPosition={[280, 210, 340]}
    enableRotate
    autoRotate
  >
    <Scatter3D data={data} pointSize={4} colorByValue axisLength={230} />
  </Scene3D>
);

export default Demo;
