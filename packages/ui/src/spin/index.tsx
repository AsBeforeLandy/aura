import React, { forwardRef, useEffect, useState, useMemo } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface SpinProps {
  /**
   * 加载指示器尺寸
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * 是否加载中
   * @default true
   */
  spinning?: boolean;
  /**
   * 延迟显示加载指示器（ms），避免快速加载时闪烁
   * @default 0
   */
  delay?: number;
  /**
   * 加载动画样式
   * @default 'default'
   */
  variant?: 'default' | 'dot';
  /**
   * 加载提示文字
   */
  tip?: React.ReactNode;
  /**
   * 自定义加载图标
   */
  indicator?: React.ReactNode;
  /**
   * 包裹的内容（加载时半透明）
   */
  children?: React.ReactNode;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/** 尺寸 → 像素映射 */
const SIZE_MAP: Record<string, number> = { sm: 16, md: 24, lg: 36 };

/**
 * 内联 Spinner SVG：底层半透明轨道圆 + 顶层追逐弧线
 * 使用纯 CSS 旋转动画，避免 JS 动画开销
 */
const SpinnerSvg: React.FC<{
  pixelSize: number;
  className?: string;
}> = ({ pixelSize, className }) => {
  // 根据尺寸动态计算 stroke 宽度，小尺寸相对更粗以保持可见性
  const strokeWidth = pixelSize <= 16 ? 2.5 : pixelSize <= 24 ? 2.5 : 3;
  const center = pixelSize / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  // 弧线占圆周的 75%，剩余 25% 为缺口
  const arcLength = circumference * 0.75;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${pixelSize} ${pixelSize}`}
      width={pixelSize}
      height={pixelSize}
      aria-hidden="true"
      fill="none"
    >
      {/* 底层轨道圆 — 半透明，提供静止参照 */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        opacity={0.18}
      />
      {/* 顶层追逐弧线 — 旋转动画产生 spinner 效果 */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${circumference}`}
      />
    </svg>
  );
};

/**
 * 点状加载动画 — 三个弹跳圆点
 */
const DotIndicator: React.FC<{ className?: string }> = ({ className }) => (
  <span className={className} aria-hidden="true">
    <span className={prefixCls('spin-dot-item')} />
    <span className={prefixCls('spin-dot-item')} />
    <span className={prefixCls('spin-dot-item')} />
  </span>
);

export const Spin = forwardRef<HTMLDivElement, SpinProps>(
  (
    {
      size = 'md',
      spinning: spinningProp = true,
      delay = 0,
      variant = 'default',
      tip,
      indicator,
      children,
      className,
      style,
    },
    ref,
  ) => {
    const pixelSize = SIZE_MAP[size] ?? 24;

    // delay 逻辑：避免快速加载闪烁
    const [showSpinner, setShowSpinner] = useState(delay === 0);
    useEffect(() => {
      if (delay <= 0) {
        setShowSpinner(true);
        return;
      }
      setShowSpinner(false);
      const timer = setTimeout(() => setShowSpinner(true), delay);
      return () => clearTimeout(timer);
    }, [delay]);

    // 合并 spinning 状态：外部 spinning + 内部 delay
    const effectiveSpinning = spinningProp && (delay === 0 || showSpinner);

    // 构建默认指示器
    const defaultIndicator = useMemo(() => {
      if (indicator) return indicator;
      if (variant === 'dot') {
        return <DotIndicator className={prefixCls('spin-dot')} />;
      }
      return (
        <SpinnerSvg
          pixelSize={pixelSize}
          className={prefixCls('spin-svg')}
        />
      );
    }, [indicator, variant, pixelSize]);

    // 核心 spin 元素
    const spinElement = (
      <div className={prefixCls('spin-indicator')}>
        {defaultIndicator}
        {tip && <span className={prefixCls('spin-tip')}>{tip}</span>}
      </div>
    );

    // 无 children：独立显示
    if (!children) {
      const cls = classNames(
        prefixCls('spin'),
        prefixCls(`spin-${size}`),
        !effectiveSpinning && prefixCls('spin-hidden'),
        className,
      );
      return (
        <div ref={ref} className={cls} style={style} role="status" aria-label={typeof tip === 'string' ? tip : '加载中'}>
          {effectiveSpinning && spinElement}
        </div>
      );
    }

    // 有 children：包裹模式
    const containerCls = classNames(
      prefixCls('spin-container'),
      effectiveSpinning && prefixCls('spin-spinning'),
      className,
    );

    return (
      <div ref={ref} className={containerCls} style={style}>
        {effectiveSpinning && (
          <div className={prefixCls('spin-overlay')} role="status" aria-label={typeof tip === 'string' ? tip : '加载中'}>
            {spinElement}
          </div>
        )}
        <div
          className={classNames(
            prefixCls('spin-content'),
            effectiveSpinning && prefixCls('spin-content-blur'),
          )}
          aria-busy={effectiveSpinning}
        >
          {children}
        </div>
      </div>
    );
  },
);

Spin.displayName = 'Spin';
