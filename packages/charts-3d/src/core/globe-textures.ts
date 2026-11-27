import * as THREE from 'three';

const SAFE_TEXTURE_BASE = 'https://aura.invalid/';
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'blob:', 'data:']);

/**
 * 校验地球贴图地址：允许相对路径与 http(s) / blob / data URL，拦截不安全协议与控制字符。
 */
export function isSafeTextureUrl(url: string | undefined): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed, SAFE_TEXTURE_BASE);
    return ALLOWED_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * 极简自然大陆示意轮廓（纯自然地貌，无政治国界与行政边界），
 * 仅在未传入外部卫星贴图或贴图加载中时作为程序化自然地球兜底纹理使用。
 * 坐标格式：[经度, 纬度][]
 */
const CONTINENT_SILHOUETTES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  // 北美
  [
    [-168, 66],
    [-142, 70],
    [-110, 70],
    [-82, 62],
    [-64, 52],
    [-55, 48],
    [-70, 42],
    [-76, 35],
    [-81, 25],
    [-90, 29],
    [-98, 25],
    [-95, 18],
    [-84, 10],
    [-88, 14],
    [-105, 20],
    [-115, 30],
    [-124, 40],
    [-130, 54],
    [-152, 60],
  ],
  // 格陵兰
  [
    [-52, 60],
    [-42, 60],
    [-20, 72],
    [-28, 82],
    [-56, 81],
    [-60, 70],
  ],
  // 南美
  [
    [-80, 10],
    [-64, 11],
    [-50, 1],
    [-35, -6],
    [-39, -18],
    [-48, -26],
    [-58, -38],
    [-68, -54],
    [-74, -46],
    [-72, -20],
    [-81, -5],
  ],
  // 欧亚大陆
  [
    [-9, 37],
    [-8, 43],
    [2, 51],
    [10, 56],
    [18, 68],
    [42, 68],
    [76, 72],
    [118, 73],
    [168, 66],
    [160, 55],
    [140, 52],
    [134, 42],
    [122, 39],
    [121, 30],
    [114, 22],
    [106, 20],
    [104, 10],
    [100, 14],
    [94, 21],
    [80, 8],
    [70, 23],
    [56, 26],
    [44, 13],
    [35, 30],
    [26, 38],
    [14, 42],
    [4, 42],
  ],
  // 非洲
  [
    [-16, 15],
    [-6, 35],
    [10, 37],
    [32, 31],
    [42, 12],
    [51, 11],
    [41, -3],
    [35, -24],
    [20, -35],
    [14, -22],
    [10, 2],
    [-8, 5],
  ],
  // 澳洲
  [
    [114, -22],
    [130, -12],
    [143, -11],
    [153, -27],
    [148, -38],
    [136, -35],
    [115, -34],
  ],
  // 日本 / 马来群岛 / 英国 / 马达加斯加等主要岛屿示意
  [
    [130, 31],
    [141, 38],
    [145, 44],
    [140, 42],
    [131, 34],
  ],
  [
    [100, 2],
    [118, 5],
    [126, -6],
    [106, -8],
  ],
  [
    [-6, 50],
    [1, 51],
    [-1, 58],
    [-6, 56],
  ],
  [
    [44, -25],
    [50, -13],
    [49, -19],
    [45, -25],
  ],
];

function lngLatToCanvas(
  lng: number,
  lat: number,
  width: number,
  height: number,
): [number, number] {
  return [((lng + 180) / 360) * width, ((90 - lat) / 180) * height];
}

function drawContinentPaths(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  for (const poly of CONTINENT_SILHOUETTES) {
    ctx.beginPath();
    poly.forEach(([lng, lat], index) => {
      const [x, y] = lngLatToCanvas(lng, lat, width, height);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  }
}

export interface ProceduralEarthTextures {
  map: THREE.CanvasTexture;
  specularMap: THREE.CanvasTexture;
  cloudsMap: THREE.CanvasTexture;
  dispose: () => void;
}

/**
 * 零外部依赖的程序化自然地球纹理集合（地表 + 海洋高光 + 漂移云层）。
 * 在未传入 textureUrl 或外部卫星贴图尚在加载期间提供逼真的蓝海绿陆底图。
 */
export function createProceduralEarthTextures(
  width = 1024,
  height = 512,
): ProceduralEarthTextures | null {
  if (typeof document === 'undefined') return null;

  // 1) 自然地表贴图：深海渐变 + 自然植被/沙漠/极地冰盖
  const surfaceCanvas = document.createElement('canvas');
  surfaceCanvas.width = width;
  surfaceCanvas.height = height;
  const ctx = surfaceCanvas.getContext('2d');
  if (!ctx) return null;

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0f2c59');
  oceanGrad.addColorStop(0.22, '#0c4a8a');
  oceanGrad.addColorStop(0.5, '#0b5ca8');
  oceanGrad.addColorStop(0.78, '#0c4a8a');
  oceanGrad.addColorStop(1, '#0d264d');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // 陆地自然梯度：高纬针叶林 → 中纬温带绿 → 副热带沙土 → 赤道雨林
  const landGrad = ctx.createLinearGradient(0, 0, 0, height);
  landGrad.addColorStop(0, '#dbeafe');
  landGrad.addColorStop(0.14, '#5a8a62');
  landGrad.addColorStop(0.28, '#4f8c55');
  landGrad.addColorStop(0.4, '#b8a56f');
  landGrad.addColorStop(0.5, '#2f7d44');
  landGrad.addColorStop(0.64, '#a69663');
  landGrad.addColorStop(0.78, '#4e8455');
  landGrad.addColorStop(1, '#e2e8f0');

  // 浅海大陆架柔和光晕
  ctx.save();
  ctx.shadowColor = '#1d84c9';
  ctx.shadowBlur = 12;
  ctx.fillStyle = landGrad;
  drawContinentPaths(ctx, width, height);
  ctx.restore();

  // 南北极冰盖
  const iceTop = ctx.createLinearGradient(0, 0, 0, height * 0.13);
  iceTop.addColorStop(0, 'rgba(241, 245, 249, 0.96)');
  iceTop.addColorStop(0.65, 'rgba(226, 232, 240, 0.5)');
  iceTop.addColorStop(1, 'rgba(226, 232, 240, 0)');
  ctx.fillStyle = iceTop;
  ctx.fillRect(0, 0, width, height * 0.13);

  const iceBottom = ctx.createLinearGradient(0, height * 0.85, 0, height);
  iceBottom.addColorStop(0, 'rgba(241, 245, 249, 0)');
  iceBottom.addColorStop(0.35, 'rgba(241, 245, 249, 0.85)');
  iceBottom.addColorStop(1, 'rgba(248, 250, 252, 0.98)');
  ctx.fillStyle = iceBottom;
  ctx.fillRect(0, height * 0.85, width, height * 0.15);

  // 2) 海洋高光贴图：海洋亮（反光）、陆地暗（哑光）
  const specCanvas = document.createElement('canvas');
  specCanvas.width = width;
  specCanvas.height = height;
  const specCtx = specCanvas.getContext('2d');
  if (!specCtx) return null;
  specCtx.fillStyle = '#d4d4d4';
  specCtx.fillRect(0, 0, width, height);
  specCtx.fillStyle = '#121212';
  drawContinentPaths(specCtx, width, height);
  specCtx.fillRect(0, height * 0.87, width, height * 0.13);

  // 3) 柔和气旋云层贴图（确定性伪随机分布，无 SSR/重渲染抖动）
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = width / 2;
  cloudCanvas.height = height / 2;
  const cloudCtx = cloudCanvas.getContext('2d');
  if (!cloudCtx) return null;
  const cw = cloudCanvas.width;
  const ch = cloudCanvas.height;
  for (let i = 0; i < 95; i += 1) {
    const s1 = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    const s2 = Math.sin(i * 269.5 + 183.3) * 43758.5453;
    const s3 = Math.sin(i * 419.2 + 97.1) * 43758.5453;
    const cx = (s1 - Math.floor(s1)) * cw;
    const cy = (0.08 + (s2 - Math.floor(s2)) * 0.84) * ch;
    const rx = 20 + (s3 - Math.floor(s3)) * 56;
    const ry = rx * (0.28 + (i % 4) * 0.08);
    const grad = cloudCtx.createRadialGradient(cx, cy, 1, cx, cy, rx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.16)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    cloudCtx.save();
    cloudCtx.translate(cx, cy);
    cloudCtx.scale(1, ry / rx);
    cloudCtx.fillStyle = grad;
    cloudCtx.beginPath();
    cloudCtx.arc(0, 0, rx, 0, Math.PI * 2);
    cloudCtx.fill();
    cloudCtx.restore();
  }

  const map = new THREE.CanvasTexture(surfaceCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  const specularMap = new THREE.CanvasTexture(specCanvas);
  specularMap.needsUpdate = true;

  const cloudsMap = new THREE.CanvasTexture(cloudCanvas);
  cloudsMap.colorSpace = THREE.SRGBColorSpace;
  cloudsMap.needsUpdate = true;

  return {
    map,
    specularMap,
    cloudsMap,
    dispose: () => {
      map.dispose();
      specularMap.dispose();
      cloudsMap.dispose();
    },
  };
}
