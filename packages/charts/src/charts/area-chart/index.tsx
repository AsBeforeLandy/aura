import React, { useMemo } from 'react';
import type { BaseChartProps, SeriesConfig } from '../../types';
import type { CurveType } from '../../core/shape';
import { CartesianChart } from '../../internal/CartesianChart';

export interface AreaChartProps extends BaseChartProps {
  curve?: CurveType;
  smooth?: boolean;
  /** 堆叠面积图 */
  stack?: boolean;
  /** 填充不透明度，默认取主题值 */
  areaOpacity?: number;
}

/**
 * 面积图。
 *
 * 单系列面积图用来强调「量级」，多系列时**必须**开 stack，
 * 否则后画的系列会遮住前面的 —— 这是面积图最常见的误用。
 */
export function AreaChart({
  curve = 'monotone',
  smooth = false,
  stack = false,
  areaOpacity,
  series,
  ...rest
}: AreaChartProps) {
  const merged = useMemo<SeriesConfig[]>(
    () =>
      (series ?? []).map((item) => ({
        type: 'area',
        curve: smooth ? 'smooth' : curve,
        areaOpacity,
        ...item,
      })),
    [series, smooth, curve, areaOpacity],
  );

  return (
    <CartesianChart
      {...rest}
      series={merged}
      defaultType="area"
      stack={stack}
    />
  );
}
