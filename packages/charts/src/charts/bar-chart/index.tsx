import React, { useMemo } from 'react';
import type { BaseChartProps, SeriesConfig } from '../../types';
import { CartesianChart } from '../../internal/CartesianChart';

export interface BarChartProps extends BaseChartProps {
  /** 堆叠：同一 x 下的系列累加 */
  stack?: boolean;
  /** 柱子最大宽度，默认 48 */
  barMaxWidth?: number;
}

/**
 * 柱状图。
 *
 * y 轴默认从 0 起（startFromZero），这是柱状图的硬性要求：
 * 柱子用「长度」编码数值，基线不在 0 会让长度比例失真。
 */
export function BarChart({
  stack = false,
  barMaxWidth,
  series,
  ...rest
}: BarChartProps) {
  const merged = useMemo<SeriesConfig[]>(
    () =>
      (series ?? []).map((item) => ({
        type: 'bar',
        barMaxWidth,
        ...item,
      })),
    [series, barMaxWidth],
  );

  return (
    <CartesianChart {...rest} series={merged} defaultType="bar" stack={stack} />
  );
}
