import React from 'react';
import { Bar3D, Scene3D } from '@aura-react-comp/charts-3d';

/**
 * 预算执行差值：正 = 超支，负 = 节省。
 *
 * 自定义色带的两端分别对应「色带的 0 端」和「1 端」：
 * 数据里的最小值（最节省）落在色带左端，最大值（最超支）落在右端。
 * colorRange 换一组颜色即可反转语义。
 */
const data = ['研发', '市场', '运营', '人力', '基建'].flatMap(
  (dept, deptIndex) =>
    ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, quarterIndex) => {
      const wave = Math.sin(deptIndex * 1.3 + quarterIndex * 0.9);
      return {
        x: quarter,
        z: dept,
        value: Math.round(wave * 140 + (quarterIndex - 1.5) * 35),
      };
    }),
);

const Demo: React.FC = () => (
  <Scene3D height={400} cameraPosition={[300, 230, 350]} enableRotate>
    <Bar3D
      data={data}
      maxHeight={130}
      cellSize={20}
      colorRange={['#34d399', '#1e3a5f', '#f472b6']}
    />
  </Scene3D>
);

export default Demo;
