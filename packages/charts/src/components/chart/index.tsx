import React, { useMemo } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { ChartDataRow, SeriesConfig } from '../../types';
import type { ChartThemeInput } from '../../theme';
import { LineChart } from '../../charts/line-chart';
import { BarChart } from '../../charts/bar-chart';
import { AreaChart } from '../../charts/area-chart';
import { PieChart } from '../../charts/pie-chart';
import { ComboChart } from '../../charts/combo-chart';

/** ECharts 风格的系列配置（支持子集） */
export interface ChartOptionSeries {
  type?: 'line' | 'bar' | 'scatter' | 'area' | 'pie';
  name?: string;
  data?: (number | null)[];
  /** 堆叠分组名 */
  stack?: string;
  /** 折线平滑 */
  smooth?: boolean;
  /** 面积填充（折线图用） */
  areaStyle?: Record<string, unknown> | boolean;
  /** 单系列颜色 */
  itemStyle?: { color?: string };
}

export interface ChartOption {
  xAxis?: {
    data?: (string | number)[];
    name?: string;
    type?: 'category' | 'value';
  };
  yAxis?: {
    name?: string;
    min?: number;
    max?: number;
  };
  series?: ChartOptionSeries[];
  /** 色板，等价于 palette */
  color?: string[];
  legend?: { show?: boolean; top?: number | string };
  tooltip?: { show?: boolean; trigger?: 'axis' | 'item' };
  grid?: { show?: boolean };
  title?: { text?: string; subtext?: string };
}

export interface ChartProps {
  option: ChartOption;
  width?: number | string;
  height?: number;
  theme?: ChartThemeInput;
  palette?: string[];
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const X_KEY = '__aura_x__';

/**
 * 配置式图表（兼容 ECharts 风格的 option）。
 *
 * 存在意义有两个：
 *   1. 迁移成本 —— 已有 ECharts 配置的项目可以低成本试用；
 *   2. **AI 友好** —— 让模型生成 JSON 配置比生成 JSX 组合可靠得多，
 *      尤其在需要动态拼装系列时。
 *
 * 明确只支持常用子集（直角坐标系的 line / bar / area / scatter 与 pie）。
 * 不做「假装全支持」：未识别的系列类型会被跳过，而不是静默画错。
 */
export function Chart({
  option,
  width = '100%',
  height = 320,
  theme,
  palette,
  animation = true,
  className,
  style,
}: ChartProps) {
  const xValues = useMemo(
    () => (option.xAxis?.data ?? []).map((item) => String(item)),
    [option.xAxis],
  );

  const paletteOrOption = palette ?? option.color;

  const { rows, seriesConfig, primaryType } = useMemo(() => {
    const list = option.series ?? [];
    const nextRows: ChartDataRow[] = xValues.map((value, index) => {
      const row: ChartDataRow = { [X_KEY]: value };
      list.forEach((item, seriesIndex) => {
        row[`s${seriesIndex}`] = item.data?.[index] ?? null;
      });
      return row;
    });

    const configs: SeriesConfig[] = list.map((item, index) => ({
      key: `s${index}`,
      name: item.name ?? `系列 ${index + 1}`,
      color: item.itemStyle?.color,
      type:
        item.type === 'area'
          ? 'area'
          : item.type === 'bar'
            ? 'bar'
            : item.type === 'scatter'
              ? 'scatter'
              : 'line',
      stack: item.stack,
      curve: item.smooth ? 'smooth' : 'monotone',
      area: item.areaStyle !== undefined && item.areaStyle !== false,
    }));

    const first = list[0]?.type ?? 'line';
    const primary =
      first === 'bar'
        ? 'bar'
        : first === 'pie'
          ? 'pie'
          : first === 'area'
            ? 'area'
            : 'line';

    return { rows: nextRows, seriesConfig: configs, primaryType: primary };
  }, [option.series, xValues]);

  const isPie = primaryType === 'pie';
  const legendVisible = option.legend?.show !== false;
  const tooltipVisible = option.tooltip?.show !== false;
  const gridVisible = option.grid?.show !== false;

  const titleNode = option.title?.text ? (
    <div className={prefixCls('chart__title')}>
      <div className={prefixCls('chart__title-main')}>{option.title.text}</div>
      {option.title.subtext ? (
        <div className={prefixCls('chart__title-sub')}>
          {option.title.subtext}
        </div>
      ) : null}
    </div>
  ) : null;

  if (isPie) {
    const pieData = (option.series?.[0]?.data ?? []).map((value, index) => ({
      name: xValues[index] ?? `项 ${index + 1}`,
      value: Number(value ?? 0),
    }));
    return (
      <div className={classNames(className)} style={style}>
        {titleNode}
        <PieChart
          data={pieData}
          width={width}
          height={height}
          theme={theme}
          palette={paletteOrOption}
          legend={legendVisible}
          tooltip={tooltipVisible}
          animation={animation}
        />
      </div>
    );
  }

  const common = {
    data: rows,
    xKey: X_KEY,
    series: seriesConfig,
    width,
    height,
    theme,
    palette: paletteOrOption,
    legend: legendVisible,
    tooltip: tooltipVisible
      ? ({ trigger: option.tooltip?.trigger ?? 'axis' } as const)
      : (false as const),
    grid: gridVisible,
    animation,
    yAxis: {
      title: option.yAxis?.name,
      min: option.yAxis?.min,
      max: option.yAxis?.max,
    },
    xAxis: { title: option.xAxis?.name },
  };

  const hasMixed = seriesConfig.some(
    (item) => item.type !== seriesConfig[0].type,
  );

  const chart =
    primaryType === 'bar' && !hasMixed ? (
      <BarChart {...common} />
    ) : primaryType === 'area' ? (
      <AreaChart {...common} />
    ) : primaryType === 'line' && !hasMixed ? (
      <LineChart {...common} />
    ) : (
      <ComboChart {...common} />
    );

  return (
    <div className={classNames(className)} style={style}>
      {titleNode}
      {chart}
    </div>
  );
}
