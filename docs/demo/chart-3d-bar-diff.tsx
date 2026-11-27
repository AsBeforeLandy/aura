import React from 'react';
import { Bar3D, Scene3D } from '@aura-react-comp/charts-3d';

/**
 * 预算执行差值：正 = 超支，负 = 节省。
 *
 * 色带三段取负值 / 零值 / 正值语义色（翠绿 / 中性灰 / 玫红）：
 * 负值（节省）落翠绿端、正值（超支）落玫红端。
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
      colorRange={['#16a34a', '#94a3b8', '#db2777']}
    />
  </Scene3D>
);

export default Demo;
