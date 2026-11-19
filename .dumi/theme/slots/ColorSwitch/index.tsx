import { usePrefersColor } from 'dumi';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';

/**
 * 文档站主题选择器 —— 覆盖 dumi 内置 ColorSwitch slot。
 *
 * 主题 = 色板(data-palette: violet|ocean|sunset) × 模式(data-mode: light|dark) 双轴：
 * - 模式走 dumi 原生 usePrefersColor（含跟随系统），壳层 data-prefers-color 自动联动；
 * - 色板写入 <html data-palette> 并持久化到 localStorage，组件令牌随 tokens.css 的
 *   [data-palette] / [data-mode][data-palette] 选择器切换。
 */

const PALETTE_KEY = 'aura-docs-palette';

const PALETTES = [
  { value: 'violet', label: '紫罗兰', light: '#7c3aed', dark: '#a78bfa' },
  { value: 'ocean', label: '海洋蓝', light: '#2563eb', dark: '#60a5fa' },
  { value: 'sunset', label: '落日橙', light: '#ea580c', dark: '#fb923c' },
] as const;

const MODES = [
  { value: 'light', label: '亮色模式' },
  { value: 'dark', label: '暗色模式' },
  { value: 'auto', label: '跟随系统' },
] as const;

type PaletteValue = (typeof PALETTES)[number]['value'];
type ModeValue = (typeof MODES)[number]['value'];

function readInitialPalette(): PaletteValue {
  if (typeof window === 'undefined') return 'violet';
  const saved = window.localStorage.getItem(PALETTE_KEY);
  return PALETTES.some((p) => p.value === saved) ? (saved as PaletteValue) : 'violet';
}

const IconCaret = () => (
  <svg viewBox="0 0 16 16" className="doc-theme-caret" aria-hidden="true">
    <path
      d="M4.2 6.2a.9.9 0 0 1 1.27 0L8 8.73l2.53-2.53a.9.9 0 1 1 1.27 1.27l-3.16 3.17a.9.9 0 0 1-1.27 0L4.2 7.47a.9.9 0 0 1 0-1.27Z"
      fill="currentColor"
    />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 16 16" className="doc-theme-check" aria-hidden="true">
    <path
      d="M13.78 3.97a.75.75 0 0 1 0 1.06l-6.5 6.5a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l2.47 2.47 5.97-5.97a.75.75 0 0 1 1.06 0Z"
      fill="currentColor"
    />
  </svg>
);

const IconLight = () => (
  <svg viewBox="0 0 16 16" className="doc-theme-icon" aria-hidden="true">
    <path d="M8 13a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM8 3a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm7 4a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM3 8a1 1 0 0 1-1 1H1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm9.95 3.536.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 1.414-1.414Zm-9.9-7.072-.707-.707a1 1 0 0 1 1.414-1.414l.707.707A1 1 0 0 1 3.05 4.464Zm9.9 0a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414l-.707.707Zm-9.9 7.072a1 1 0 0 1 1.414 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707ZM8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

const IconDark = () => (
  <svg viewBox="0 0 16 16" className="doc-theme-icon" aria-hidden="true">
    <path d="M8.218 1.455c3.527.109 6.327 3.018 6.327 6.545 0 3.6-2.945 6.545-6.545 6.545a6.562 6.562 0 0 1-6.036-4h.218c3.6 0 6.545-2.945 6.545-6.545 0-.91-.182-1.745-.509-2.545m0-1.455c-.473 0-.909.218-1.2.618-.29.4-.327.946-.145 1.382.254.655.4 1.31.4 2 0 2.8-2.291 5.09-5.091 5.09h-.218c-.473 0-.91.22-1.2.62-.291.4-.328.945-.146 1.38C1.891 14.074 4.764 16 8 16c4.4 0 8-3.6 8-8a7.972 7.972 0 0 0-7.745-8h-.037Z" />
  </svg>
);

const IconAuto = () => (
  <svg viewBox="0 0 16 16" className="doc-theme-icon" aria-hidden="true">
    <path d="M14.595 8a6.595 6.595 0 1 1-13.19 0 6.595 6.595 0 0 1 13.19 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 2.014v11.972A5.986 5.986 0 0 0 8 2.014Z" />
  </svg>
);

const MODE_ICONS: Record<ModeValue, React.FC> = {
  light: IconLight,
  dark: IconDark,
  auto: IconAuto,
};

const ColorSwitch: React.FC = () => {
  const [color, prefersColor, setPrefersColor] = usePrefersColor();
  // prefersColor 未设置时回落 dumi 配置的默认值；此处统一按 light 处理展示态
  const mode: ModeValue = (prefersColor || 'light') as ModeValue;
  const [palette, setPalette] = useState<PaletteValue>(readInitialPalette);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  // 色板写入 <html> 并持久化
  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.setAttribute('data-palette', palette);
    window.localStorage.setItem(PALETTE_KEY, palette);
  }, [palette]);

  // 点击外部 / Esc 关闭面板
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const swatchOf = (value: PaletteValue) => {
    const item = PALETTES.find((p) => p.value === value);
    if (!item) return '#7c3aed';
    return color === 'dark' ? item.dark : item.light;
  };

  return (
    <span
      className={`doc-theme-switch${open ? ' open' : ''}`}
      ref={rootRef}
      data-dumi-tooltip="主题"
      data-dumi-tooltip-bottom
    >
      <button
        type="button"
        className="doc-theme-switch-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="选择主题"
        onClick={() => setOpen((v) => !v)}
      >
        <i className="doc-theme-swatch" style={{ background: swatchOf(palette) }} />
        <IconCaret />
      </button>
      {open && (
        <div className="doc-theme-panel" role="listbox" aria-label="主题选择">
          <div className="doc-theme-group-title">色板</div>
          {PALETTES.map((p) => (
            <button
              key={p.value}
              type="button"
              role="option"
              aria-selected={palette === p.value}
              className={`doc-theme-option${palette === p.value ? ' active' : ''}`}
              onClick={() => setPalette(p.value)}
            >
              <i className="doc-theme-swatch" style={{ background: swatchOf(p.value) }} />
              {p.label}
              {palette === p.value && <IconCheck />}
            </button>
          ))}
          <div className="doc-theme-group-title">模式</div>
          {MODES.map((m) => {
            const Icon = MODE_ICONS[m.value];
            return (
              <button
                key={m.value}
                type="button"
                role="option"
                aria-selected={mode === m.value}
                className={`doc-theme-option${mode === m.value ? ' active' : ''}`}
                onClick={() => setPrefersColor(m.value)}
              >
                <Icon />
                {m.label}
                {mode === m.value && <IconCheck />}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
};

export default ColorSwitch;
