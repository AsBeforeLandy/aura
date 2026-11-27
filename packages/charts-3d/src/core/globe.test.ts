import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  buildArcTubes,
  buildGlobeModel,
  buildSphereDots,
  latLngToVector3,
  sampleArcPosition,
  type Globe3DPoint,
} from './globe';

function point(
  id: string,
  latitude: number,
  longitude: number,
  value?: number,
): Globe3DPoint {
  return { id, name: id, latitude, longitude, value };
}

function expectVectorClose(
  actual: THREE.Vector3,
  expected: THREE.Vector3,
): void {
  expect(actual.x).toBeCloseTo(expected.x, 10);
  expect(actual.y).toBeCloseTo(expected.y, 10);
  expect(actual.z).toBeCloseTo(expected.z, 10);
}

describe('latLngToVector3', () => {
  it('赤道与本初子午线交点位于 +x，半径可配置', () => {
    expectVectorClose(latLngToVector3(0, 0, 120), new THREE.Vector3(120, 0, 0));
    expect(latLngToVector3(23.5, 45, 7).length()).toBeCloseTo(7, 10);
  });

  it('纬度向上，经度按约定转向 -z', () => {
    expectVectorClose(latLngToVector3(90, 0, 10), new THREE.Vector3(0, 10, 0));
    expectVectorClose(latLngToVector3(0, 90, 10), new THREE.Vector3(0, 0, -10));
    expectVectorClose(latLngToVector3(0, -90, 10), new THREE.Vector3(0, 0, 10));
  });

  it('经度归一化到 [-180, 180)，180 与 -180 等价', () => {
    const normalized = latLngToVector3(0, -180, 120);
    expectVectorClose(latLngToVector3(0, 180, 120), normalized);
    expectVectorClose(latLngToVector3(0, 540, 120), normalized);
    expectVectorClose(
      latLngToVector3(0, 190, 120),
      latLngToVector3(0, -170, 120),
    );
  });

  it('纬度越界时收敛到南北极点', () => {
    expectVectorClose(latLngToVector3(120, 35, 8), new THREE.Vector3(0, 8, 0));
    expectVectorClose(
      latLngToVector3(-120, 35, 8),
      new THREE.Vector3(0, -8, 0),
    );
  });
});

describe('buildGlobeModel 点位', () => {
  it('空数据返回空模型与安全数值域', () => {
    const model = buildGlobeModel([], []);
    expect(model.points).toEqual([]);
    expect(model.arcs).toEqual([]);
    expect(model.min).toBe(0);
    expect(model.max).toBe(0);
    expect(model.radius).toBe(120);
    expect(model.grid.length).toBeGreaterThan(0);
  });

  it('单点缺省 value 按 0，比例安全', () => {
    const model = buildGlobeModel([point('only', 0, 0)]);
    expect(model.points).toHaveLength(1);
    expect(model.points[0].value).toBe(0);
    expect(model.points[0].ratio).toBe(0.5);
    expect(model.min).toBe(0);
    expect(model.max).toBe(0);
  });

  it('过滤 NaN / Infinity 坐标，重复 id 保留首个有效点', () => {
    const model = buildGlobeModel([
      point('first', 0, 0, 10),
      point('first', 30, 30, 90),
      point('nan-lat', Number.NaN, 0),
      point('nan-lng', 0, Number.NaN),
      point('inf-lat', Number.POSITIVE_INFINITY, 0),
      point('inf-lng', 0, Number.NEGATIVE_INFINITY),
      point('last', 10, 20, 20),
    ]);
    expect(model.points.map((item) => item.point.id)).toEqual([
      'first',
      'last',
    ]);
    expect(model.points[0].value).toBe(10);
    expectVectorClose(model.points[0].position, new THREE.Vector3(120, 0, 0));
  });

  it('模型使用收敛后的纬度与归一化后的经度', () => {
    const model = buildGlobeModel([point('edge', 100, 190)]);
    expect(model.points[0].latitude).toBe(90);
    expect(model.points[0].longitude).toBe(-170);
    expectVectorClose(model.points[0].position, latLngToVector3(90, -170, 120));
  });

  it('非有限 value 按 0，有限值映射到色带两端', () => {
    const model = buildGlobeModel([
      point('nan', 0, 0, Number.NaN),
      point('inf', 0, 1, Number.POSITIVE_INFINITY),
      point('neg-inf', 0, 2, Number.NEGATIVE_INFINITY),
      point('max', 0, 3, 10),
    ]);
    expect(model.points.map((item) => item.value)).toEqual([0, 0, 0, 10]);
    expect(model.points.map((item) => item.ratio)).toEqual([0, 0, 0, 1]);
    expect(model.min).toBe(0);
    expect(model.max).toBe(10);
  });

  it('全等值使用中点比例且不产生 NaN', () => {
    const model = buildGlobeModel([point('a', 0, 0, 7), point('b', 10, 10, 7)]);
    expect(model.points.map((item) => item.ratio)).toEqual([0.5, 0.5]);
    expect(model.min).toBe(7);
    expect(model.max).toBe(7);
  });
});

describe('buildGlobeModel 弧线', () => {
  const points = [
    point('a', 0, 0, 0),
    point('b', 0, 90, 100),
    point('antipode', 0, 180, 50),
  ];

  it('slerp 路径端点精确，中点按相对半径抬升', () => {
    const model = buildGlobeModel(points, [{ from: 'a', to: 'b' }], 120, 0.35);
    const arc = model.arcs[0];
    expect(arc.path).toHaveLength(49);
    expect(arc.path[0].distanceTo(model.points[0].position)).toBe(0);
    expect(arc.path[48].distanceTo(model.points[1].position)).toBe(0);
    const middle = arc.path[24];
    expect(middle.length()).toBeCloseTo(120 * 1.35, 10);
    expect(middle.length()).toBeGreaterThan(120);
    expect(middle.x).toBeGreaterThan(0);
    expect(middle.z).toBeLessThan(0);
  });

  it('对跖点选择确定性切平面，所有坐标有限', () => {
    const model = buildGlobeModel(
      points,
      [{ from: 'a', to: 'antipode' }],
      120,
      0.5,
    );
    const arc = model.arcs[0];
    const middle = arc.path[24];
    expect(arc.path[0].distanceTo(model.points[0].position)).toBe(0);
    expect(arc.path[48].distanceTo(model.points[2].position)).toBe(0);
    expect(middle.length()).toBeCloseTo(180, 10);
    expect(Math.abs(middle.dot(model.points[0].position))).toBeLessThan(1e-8);
    arc.path.forEach((position) => {
      expect(position.toArray().every(Number.isFinite)).toBe(true);
    });
  });

  it('arcHeight=0 时路径保持在球面上', () => {
    const model = buildGlobeModel(points, [{ from: 'a', to: 'b' }], 120, 0);
    model.arcs[0].path.forEach((position) => {
      expect(position.length()).toBeCloseTo(120, 10);
    });
  });

  it('忽略非法边、自环、缺失端点与同位置跨 id 边', () => {
    const model = buildGlobeModel(
      [...points, point('same-place', 0, 0)],
      [
        { from: 'a', to: 'a' },
        { from: 'a', to: 'missing' },
        { from: 'missing', to: 'b' },
        { from: 'a', to: 'same-place' },
        { from: 'a', to: 'b' },
      ],
    );
    expect(model.arcs).toHaveLength(1);
    expect(model.arcs[0].from).toBe('a');
    expect(model.arcs[0].to).toBe('b');
  });

  it('空点位数据不会生成弧线', () => {
    expect(buildGlobeModel([], [{ from: 'a', to: 'b' }]).arcs).toEqual([]);
  });

  it('弧线非有限 value 按 0，比例保持有限', () => {
    const model = buildGlobeModel(points, [
      { from: 'a', to: 'b', value: Number.NaN },
    ]);
    expect(model.arcs[0].value).toBe(0);
    expect(model.arcs[0].ratio).toBe(0);
  });
});

describe('buildGlobeModel 几何健壮性', () => {
  it('经纬网每 30° 生成有限 lineSegments 坐标', () => {
    const model = buildGlobeModel([]);
    expect(model.grid).toHaveLength((5 * 72 + 12 * 24) * 6);
    expect(model.grid.every(Number.isFinite)).toBe(true);
    for (let index = 0; index < model.grid.length; index += 3) {
      const radius = Math.hypot(
        model.grid[index],
        model.grid[index + 1],
        model.grid[index + 2],
      );
      expect(radius).toBeCloseTo(120, 10);
    }
  });

  it('混合边界输入下点位、弧线和经纬网坐标全部有限', () => {
    const model = buildGlobeModel(
      [
        point('north', 90, 1080, Number.NaN),
        point('south', -90, -1080),
        point('bad', Number.NaN, Number.POSITIVE_INFINITY),
      ],
      [{ from: 'north', to: 'south', value: Number.POSITIVE_INFINITY }],
      75,
      0.2,
    );
    const vectors = [
      ...model.points.map((item) => item.position),
      ...model.arcs.flatMap((arc) => arc.path),
    ];
    vectors.forEach((vector) => {
      expect(vector.toArray().every(Number.isFinite)).toBe(true);
    });
    expect(model.grid.every(Number.isFinite)).toBe(true);
    expect(model.arcs).toHaveLength(1);
  });

  it('极端有限值不会溢出数值比例或 Float32 几何', () => {
    const points = [
      point('min', 0, 0, -1e308),
      point('mid', 10, 10, 0),
      point('max', 20, 20, 1e308),
    ];
    const model = buildGlobeModel(points, [{ from: 'min', to: 'max' }]);
    expect(model.points.map((item) => item.ratio)).toEqual([0, 0.5, 1]);
    expect(model.grid.every(Number.isFinite)).toBe(true);
    model.arcs[0].path.forEach((position) => {
      expect(position.toArray().every(Number.isFinite)).toBe(true);
      expect(
        position
          .toArray()
          .every((value) => Math.abs(value) <= 3.4028234663852886e38),
      ).toBe(true);
    });

    const huge = buildGlobeModel(
      points,
      [{ from: 'min', to: 'max' }],
      1e308,
      1e308,
    );
    expect(huge.radius).toBe(120);
    expect(huge.arcs[0].path[24].length()).toBeCloseTo(162, 10);
  });

  it('非法半径与抬升比例回退默认值', () => {
    const model = buildGlobeModel(
      [point('a', 0, 0), point('b', 0, 90)],
      [{ from: 'a', to: 'b' }],
      Number.NaN,
      Number.POSITIVE_INFINITY,
    );
    expect(model.radius).toBe(120);
    expect(model.arcs[0].path[24].length()).toBeCloseTo(162, 10);
  });

  it('斐波那契点阵生成确定数量的有限球面点并处理异常参数', () => {
    const dots = buildSphereDots(100, 64);
    expect(dots).toHaveLength(64 * 3);
    expect(dots.every(Number.isFinite)).toBe(true);
    for (let i = 0; i < dots.length; i += 3) {
      expect(Math.hypot(dots[i], dots[i + 1], dots[i + 2])).toBeCloseTo(100, 8);
    }
    expect(buildSphereDots(100, 0)).toEqual([]);
    expect(buildSphereDots(Number.NaN, 4)).toHaveLength(12);
    expect(buildGlobeModel([]).dots.length).toBeGreaterThan(0);
  });

  it('sampleArcPosition 在端点、中点、越界及空路径下保持稳定', () => {
    const a = new THREE.Vector3(0, 0, 0);
    const b = new THREE.Vector3(10, 0, 0);
    const c = new THREE.Vector3(10, 10, 0);
    expectVectorClose(sampleArcPosition([a, b, c], 0), a);
    expectVectorClose(sampleArcPosition([a, b, c], 0.5), b);
    expectVectorClose(sampleArcPosition([a, b, c], 1), c);
    expectVectorClose(
      sampleArcPosition([a, b, c], 0.25),
      new THREE.Vector3(5, 0, 0),
    );
    expectVectorClose(sampleArcPosition([a, b, c], -2), a);
    expectVectorClose(sampleArcPosition([a, b, c], 3), c);
    expectVectorClose(sampleArcPosition([a], 0.5), a);
    expectVectorClose(sampleArcPosition([], 0.5), new THREE.Vector3(0, 0, 0));
  });

  it('buildArcTubes 生成有限闭合管道网格并安全跳过空路径', () => {
    const model = buildGlobeModel(
      [point('a', 0, 0, 10), point('b', 35, 120, 90)],
      [{ from: 'a', to: 'b', value: 50 }],
    );
    const tube = buildArcTubes(model.arcs, 1.2, 5);
    expect(tube.positions.length).toBe(49 * 5 * 3);
    expect(tube.normals.length).toBe(tube.positions.length);
    expect(tube.progress.length).toBe(49 * 5);
    expect(tube.indices.length).toBe(48 * 5 * 6);
    expect(tube.positions.every(Number.isFinite)).toBe(true);
    expect(tube.normals.every(Number.isFinite)).toBe(true);
    expect(tube.progress[0]).toBe(0);
    expect(tube.progress[tube.progress.length - 1]).toBe(1);

    const empty = buildArcTubes([], -1, 2);
    expect(empty.positions).toEqual([]);
    expect(empty.indices).toEqual([]);
  });
});
