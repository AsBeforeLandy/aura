import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, useTheme } from './ThemeProvider';

function resetRootAttrs() {
  const root = document.documentElement;
  ['data-mode', 'data-theme', 'data-palette'].forEach((a) =>
    root.removeAttribute(a),
  );
}

describe('ThemeProvider', () => {
  it('should render children', () => {
    const { getByText } = render(
      <ThemeProvider theme="light">
        <div>Hello</div>
      </ThemeProvider>,
    );
    expect(getByText('Hello')).toBeDefined();
    resetRootAttrs();
  });

  it('should set data-theme="dark" on document root when theme="dark"', () => {
    render(
      <ThemeProvider theme="dark">
        <div>Dark</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    resetRootAttrs();
  });

  it('should set data-theme="light" when theme="light"', () => {
    render(
      <ThemeProvider theme="light">
        <div>Light</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    resetRootAttrs();
  });

  // ---- 双轴新 API ----
  it('mode prop writes data-mode / data-theme / data-palette together', () => {
    render(
      <ThemeProvider mode="dark" palette="ocean">
        <div>Dual axis</div>
      </ThemeProvider>,
    );
    const root = document.documentElement;
    expect(root.getAttribute('data-mode')).toBe('dark');
    // data-theme 与 data-mode 同步写，兼容旧选择器
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.getAttribute('data-palette')).toBe('ocean');
    resetRootAttrs();
  });

  it('mode takes precedence over legacy theme when both are passed', () => {
    render(
      <ThemeProvider mode="dark" theme="light">
        <div>Precedence</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
    resetRootAttrs();
  });

  it('palette defaults to violet when not specified', () => {
    render(
      <ThemeProvider mode="light">
        <div>Default palette</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-palette')).toBe(
      'violet',
    );
    resetRootAttrs();
  });

  it('controlled palette updates data-palette', () => {
    const { rerender } = render(
      <ThemeProvider mode="light" palette="violet">
        <div>A</div>
      </ThemeProvider>,
    );
    rerender(
      <ThemeProvider mode="light" palette="sunset">
        <div>A</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-palette')).toBe(
      'sunset',
    );
    resetRootAttrs();
  });

  it('defaultPalette seeds the uncontrolled palette', () => {
    render(
      <ThemeProvider defaultPalette="ocean">
        <div>Seed</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-palette')).toBe('ocean');
    resetRootAttrs();
  });
});

describe('useTheme', () => {
  it('should return current theme', () => {
    let currentTheme: string | undefined;
    const Consumer = () => {
      const { theme } = useTheme();
      currentTheme = theme;
      return null;
    };

    render(
      <ThemeProvider theme="dark">
        <Consumer />
      </ThemeProvider>,
    );
    expect(currentTheme).toBe('dark');
    resetRootAttrs();
  });

  it('should expose mode and palette via the dual-axis context', () => {
    let result: ReturnType<typeof useTheme>;
    const Consumer = () => {
      result = useTheme();
      return null;
    };

    render(
      <ThemeProvider mode="dark" palette="sunset">
        <Consumer />
      </ThemeProvider>,
    );
    expect(result!.mode).toBe('dark');
    expect(result!.palette).toBe('sunset');
    // 旧字段与新字段同源
    expect(result!.theme).toBe('dark');
    resetRootAttrs();
  });

  it('setPalette updates the palette axis in uncontrolled mode', () => {
    let result: ReturnType<typeof useTheme>;
    const Consumer = () => {
      result = useTheme();
      return null;
    };

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-palette')).toBe(
      'violet',
    );

    act(() => {
      result!.setPalette('ocean');
    });
    expect(document.documentElement.getAttribute('data-palette')).toBe('ocean');
    resetRootAttrs();
  });

  it('setMode updates the mode axis and mirrors data-theme', () => {
    let result: ReturnType<typeof useTheme>;
    const Consumer = () => {
      result = useTheme();
      return null;
    };

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    act(() => {
      result!.setMode('dark');
    });
    const root = document.documentElement;
    expect(root.getAttribute('data-mode')).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
    resetRootAttrs();
  });

  it('should toggle theme in uncontrolled mode', () => {
    let result: ReturnType<typeof useTheme>;
    const Consumer = () => {
      result = useTheme();
      return null;
    };

    render(
      <ThemeProvider defaultTheme="light">
        <Consumer />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    act(() => {
      result!.toggleTheme();
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    // toggleTheme 与 toggleMode 是同一动作
    expect(result!.mode).toBe('dark');
    resetRootAttrs();
  });
});
