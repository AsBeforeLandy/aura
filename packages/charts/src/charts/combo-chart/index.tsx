import React from 'react';
import type { BaseChartProps } from '../../types';
import { CartesianChart } from '../../internal/CartesianChart';

export interface ComboChartProps extends BaseChartProps {
  stack?: boolean;
}

/**
 * 折柱混合图。
 *
 * 没有独立实现：直接复用直角坐标系内核，由每个 series 的 type 决定画法。
 * 之所以单独导出，是因为「收入用柱、转化率用线」这类双轴需求在业务里极常见，
 * 给个语义化的名字比让使用者记 defaultType 更友好。
 *
 * 双轴：给系列加 `yAxisIndex: 1`，并开启 `yAxisRight`，即可让该系列读右侧轴。
 * 仍是那句话——双轴只在量纲差一个数量级以上时使用，且两根轴都要写标题。
 */
export function ComboChart({
  stack = false,
  series,
  ...rest
}: ComboChartProps) {
  return (
    <CartesianChart {...rest} series={series} defaultType="bar" stack={stack} />
  );
}
