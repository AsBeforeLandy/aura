import { describe, it, expect } from 'vitest';
import { getScenePresetConfig } from './Scene3D';

describe('getScenePresetConfig', () => {
  it('巡检模式开启自动旋转且转速更快', () => {
    const config = getScenePresetConfig('inspection');
    expect(config.autoRotate).toBe(true);
    expect(config.autoRotateSpeed).toBeGreaterThan(
      getScenePresetConfig('default').autoRotateSpeed,
    );
  });

  it('静态预设不自动旋转', () => {
    ['default', 'top', 'front'].forEach((preset) => {
      expect(getScenePresetConfig(preset as 'default').autoRotate).toBe(false);
    });
  });

  it('各预设的相机都不在地面以下', () => {
    (['default', 'inspection', 'top', 'front'] as const).forEach((preset) => {
      expect(getScenePresetConfig(preset).camera[1]).toBeGreaterThan(0);
    });
  });

  it('俯视预设几乎垂直向下（x/z 极小，y 极大）', () => {
    const [x, y, z] = getScenePresetConfig('top').camera;
    expect(y).toBeGreaterThan(400);
    expect(Math.abs(x)).toBeLessThan(1);
    expect(Math.abs(z)).toBeLessThan(1);
  });

  it('未知预设回退到 default 配置', () => {
    expect(getScenePresetConfig('unknown' as 'default')).toEqual(
      getScenePresetConfig('default'),
    );
  });
});
