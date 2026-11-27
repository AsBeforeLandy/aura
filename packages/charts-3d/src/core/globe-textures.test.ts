import { describe, expect, it, vi } from 'vitest';
import {
  createProceduralEarthTextures,
  isSafeTextureUrl,
} from './globe-textures';

describe('isSafeTextureUrl', () => {
  it.each([
    '/aura/textures/earth/earth_atmos_2048.jpg',
    './earth.jpg',
    '../textures/earth.png',
    'https://example.com/earth.jpg?v=1',
    'http://localhost:8000/earth.jpg',
    'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000',
    'data:image/png;base64,iVBORw0KGgo=',
  ])('允许合法贴图地址 %s', (url) => {
    expect(isSafeTextureUrl(url)).toBe(true);
  });

  it.each([
    undefined,
    '',
    '   ',
    'javascript:alert(1)',
    'file:///etc/passwd',
    'ftp://example.com/earth.jpg',
    'https://',
    'https://example.com/a\nb.jpg',
  ])('拦截空值、畸形或不安全协议 %s', (url) => {
    expect(isSafeTextureUrl(url)).toBe(false);
  });
});

describe('createProceduralEarthTextures', () => {
  it('Canvas 2D 上下文可用时生成地表、高光与云层纹理并支持完整 dispose', () => {
    const gradient = { addColorStop: vi.fn() };
    const mockCtx = {
      createLinearGradient: vi.fn(() => gradient),
      createRadialGradient: vi.fn(() => gradient),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      arc: vi.fn(),
      fillStyle: '',
      shadowColor: '',
      shadowBlur: 0,
    };
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);

    const textures = createProceduralEarthTextures(128, 64);
    expect(textures).not.toBeNull();
    expect(textures?.map).toBeDefined();
    expect(textures?.specularMap).toBeDefined();
    expect(textures?.cloudsMap).toBeDefined();
    expect(mockCtx.fill).toHaveBeenCalled();

    const mapDispose = vi.spyOn(textures!.map, 'dispose');
    const specDispose = vi.spyOn(textures!.specularMap, 'dispose');
    const cloudDispose = vi.spyOn(textures!.cloudsMap, 'dispose');
    textures!.dispose();
    expect(mapDispose).toHaveBeenCalledTimes(1);
    expect(specDispose).toHaveBeenCalledTimes(1);
    expect(cloudDispose).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  it('Canvas 2D 不可用时安全返回 null', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null);
    expect(createProceduralEarthTextures(64, 32)).toBeNull();
    spy.mockRestore();
  });
});
