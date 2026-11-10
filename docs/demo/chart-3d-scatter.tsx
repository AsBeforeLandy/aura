import React from 'react';
import { Scatter3D, Scene3D } from '@aura-react-comp/charts-3d';

/** 三簇高斯分布 + 少量离群点，按类别着色 */
function buildClusters() {
  const clusters = [
    {
      cx: 30,
      cy: 55,
      cz: 30,
      color: undefined,
      name: '核心用户',
      count: 26,
      spread: 14,
    },
    {
      cx: 70,
      cy: 30,
      cz: 66,
      color: undefined,
      name: '成长用户',
      count: 22,
      spread: 12,
    },
    {
      cx: 48,
      cy: 78,
      cz: 44,
      color: undefined,
      name: '高价值',
      count: 14,
      spread: 9,
    },
  ];
  const points: { x: number; y: number; z: number; category: string }[] = [];

  clusters.forEach((cluster, clusterIndex) => {
    for (let index = 0; index < cluster.count; index += 1) {
      const seed = clusterIndex * 100 + index;
      const wave = (seed: number) => Math.sin(seed * 12.9898) * 43758.5453;
      const rand = (n: number) => Math.abs(wave(n)) % 1;
      points.push({
        x: Math.round(cluster.cx + (rand(seed) - 0.5) * cluster.spread * 2),
        y: Math.round(cluster.cy + (rand(seed + 7) - 0.5) * cluster.spread * 2),
        z: Math.round(
          cluster.cz + (rand(seed + 13) - 0.5) * cluster.spread * 2,
        ),
        category: cluster.name,
      });
    }
  });

  // 少量离群点：散点图的价值之一就是把它们暴露出来
  points.push({ x: 96, y: 96, z: 12, category: '高价值' });
  points.push({ x: 4, y: 88, z: 90, category: '核心用户' });

  return points;
}

const data = buildClusters();

const Demo: React.FC = () => (
  <Scene3D height={400} cameraPosition={[300, 230, 360]} enableRotate>
    <Scatter3D
      data={data}
      pointSize={5}
      colorByValue={false}
      axisLength={230}
    />
  </Scene3D>
);

export default Demo;
