import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

/** 明暗轴 */
export type ThemeMode = 'light' | 'dark';
/** 色板轴（tokens.css 的 data-palette 选择器） */
export type ThemePalette = 'violet' | 'ocean' | 'sunset';

/** @deprecated 语义同 ThemeMode，保留旧引用兼容 */
export type Theme = ThemeMode;

interface ThemeContextValue {
  /** 明暗（= theme 的新名字） */
  mode: ThemeMode;
  /** 色板 */
  palette: ThemePalette;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
  toggleMode: () => void;
  /** @deprecated 语义同 mode */
  theme: ThemeMode;
  /** @deprecated 语义同 setMode */
  setTheme: (theme: ThemeMode) => void;
  /** @deprecated 语义同 toggleMode */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  palette: 'violet',
  setMode: () => {},
  setPalette: () => {},
  toggleMode: () => {},
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export interface ThemeProviderProps {
  /** 受控明暗。与 theme 是同一轴的两个名字，同时传入时 mode 优先 */
  mode?: ThemeMode;
  /** 受控色板；缺省走非受控 internal 状态 */
  palette?: ThemePalette;
  /** 非受控色板初始值 */
  defaultPalette?: ThemePalette;
  /** @deprecated 等价于 mode，保留兼容 */
  theme?: ThemeMode;
  /** @deprecated 等价于 defaultMode，保留兼容 */
  defaultTheme?: ThemeMode;
  children: React.ReactNode;
}

export function ThemeProvider({
  mode: controlledMode,
  palette: controlledPalette,
  defaultPalette = 'violet',
  theme: legacyTheme,
  defaultTheme = 'light',
  children,
}: ThemeProviderProps) {
  // mode / theme 是同一轴：mode 优先，theme 为兼容别名
  const [internalMode, setInternalMode] = useState<ThemeMode>(defaultTheme);
  const [internalPalette, setInternalPalette] =
    useState<ThemePalette>(defaultPalette);

  const mode = controlledMode ?? legacyTheme ?? internalMode;
  const palette = controlledPalette ?? internalPalette;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', mode);
    // data-theme 保留：兼容尚未迁移到 [data-mode] 选择器的自定义样式
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-palette', palette);
  }, [mode, palette]);

  const toggleMode = useCallback(() => {
    setInternalMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      palette,
      setMode: setInternalMode,
      setPalette: setInternalPalette,
      toggleMode,
      theme: mode,
      setTheme: setInternalMode,
      toggleTheme: toggleMode,
    }),
    [mode, palette, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
