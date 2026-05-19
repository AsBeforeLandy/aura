import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, useTheme } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('should render children', () => {
    const { getByText } = render(
      <ThemeProvider theme="light">
        <div>Hello</div>
      </ThemeProvider>,
    );
    expect(getByText('Hello')).toBeDefined();
  });

  it('should set data-theme="dark" on document root when theme="dark"', () => {
    render(
      <ThemeProvider theme="dark">
        <div>Dark</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should set data-theme="light" when theme="light"', () => {
    render(
      <ThemeProvider theme="light">
        <div>Light</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
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
  });
});
