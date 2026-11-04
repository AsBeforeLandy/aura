import React, { useMemo } from 'react';
import type { BaseChartProps, SeriesConfig } from '../../types';
import type { CurveType } from '../../core/shape';
import { CartesianChart } from '../../internal/CartesianChart';

export interface LineChartProps extends BaseChartProps {
  /** 曲线插值方式，默认 monotone（平滑但不越界） */
  curve?: CurveType;
  /** 是否平滑，等价于 curve="smooth"，保留是为了贴合直觉用法 */
  smooth?: boolean;
  /** 是否给折线填充面积 */
  area?: boolean;
  /** 是否显示数据点；不传时按点数自动决策（≤24 点时显示） */
  showSymbol?: boolean;
  /** 堆叠 */
  stack?: boolean;
}

/**
 * 折线图。
 *
 * 默认曲线为 monotone 而非普通样条：普通样条在极值处会「冲出」数据范围，
 * 折线图一旦画出超过真实最大值的高度，读者会基于错误信息做判断。
 */
export function LineChart({
  curve = 'monotone',
  smooth = false,
  area = false,
  showSymbol,
  stack = false,
  series,
  ...rest
}: LineChartProps) {
  const merged = useMemo<SeriesConfig[]>(
    () =>
      (series ?? []).map((item) => ({
        type: 'line',
        curve: smooth ? 'smooth' : curve,
        area,
        showSymbol,
        ...item,
      })),
    [series, smooth, curve, area, showSymbol],
  );

  return (
    <CartesianChart
      {...rest}
      series={merged}
      defaultType="line"
      stack={stack}
    />
  );
}
