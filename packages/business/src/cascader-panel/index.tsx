import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox, Tooltip } from 'antd';
import { classNames, prefixCls } from '@aura/shared';
import {
  collectSubtree,
  expandWithDescendants,
  pickTopSelected,
  refreshTreeStates,
} from './utils';
import type { CascaderOption } from './utils';
import './index.less';

// 公开类型原先由本文件声明，现移至 utils.ts；此处保持导出不变
export type { CascaderOption } from './utils';

export interface CascaderPanelProps {
  /** 级联选项数据 */
  options: CascaderOption[];
  /** 首列标题 */
  title?: string;
  /** 受控选中值（勾选父级时自动包含其全部子孙） */
  value?: string[];
  /** 选中值变化回调（每次交互只触发一次） */
  onChange?: (
    selectedValues: string[],
    selectedOptions: CascaderOption[],
  ) => void;
  /** 点击选项（展开下级）回调 */
  onCurrentClick?: (value: CascaderOption) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * CascaderPanel — 级联多选面板
 *
 * 以横向多列的形式呈现多级选项：点击选项展开下级，勾选后级联作用于整棵子树，
 * 逐列提供「全选」，父级自动呈现全选 / 半选状态。
 *
 * 与 antd Cascader（下拉形态、单选路径）不同，本组件为平铺面板的**多选**形态，
 * 适用于组织架构、类目树等需要批量圈选子级场景。
 */
export const CascaderPanel = forwardRef<HTMLDivElement, CascaderPanelProps>(
  (
    {
      options,
      title = '',
      value,
      onChange,
      onCurrentClick,
      className,
      style,
    },
    ref,
  ) => {
    const prefix = prefixCls('cascader-panel');
    const scrollRef = useRef<HTMLDivElement>(null);

    /** 展开路径：每一级当前点开的选项 */
    const [selectedPaths, setSelectedPaths] = useState<CascaderOption[]>([]);
    /** 选中值（含级联子孙） */
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    /** 半选值（父级的部分子级被选中） */
    const [indeterminateValues, setIndeterminateValues] = useState<string[]>(
      [],
    );

    /**
     * 同步受控 value
     *
     * 依赖直接用 options / value 本身，不再对整棵树做 JSON.stringify 生成签名：
     * 序列化成本随节点数线性增长，且发生在每次渲染中，是大数据量下的热点。
     */
    useEffect(() => {
      if (value) {
        setSelectedValues([...expandWithDescendants(options, new Set(value))]);
      }
    }, [options, value]);

    /** 提交一次状态变更：重算树状态并只触发一次 onChange */
    const commit = useCallback(
      (values: Iterable<string>, indeterminate: Iterable<string>) => {
        setSelectedValues([...values]);
        setIndeterminateValues([...indeterminate]);
        const selected = new Set(values);
        const result = pickTopSelected(options, selected);
        onChange?.(result.selectedValues, result.selectedOptions);
      },
      [options, onChange],
    );

    /** 选中态的 Set 视图：把逐项 includes 的 O(n) 查找降为 O(1) */
    const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

    const isChecked = useCallback(
      (val: string) => selectedSet.has(val),
      [selectedSet],
    );

    const someSelectedFn = useCallback(
      (opts: CascaderOption[]): boolean =>
        opts.some(
          (opt) =>
            selectedSet.has(opt.value) ||
            (opt.children?.length ? someSelectedFn(opt.children) : false),
        ),
      [selectedSet],
    );

    /** 点开某一级：截断展开路径并自动向右滚动 */
    const handleSelect = useCallback(
      (level: number, option: CascaderOption) => {
        scrollRef.current?.scrollBy({
          left: level * 212,
          behavior: 'smooth',
        });
        setSelectedPaths((prev) => {
          const paths = prev.slice(0, level);
          paths[level] = option;
          return paths;
        });
        onCurrentClick?.(option);
      },
      [onCurrentClick],
    );

    /** 勾选 / 取消勾选：级联作用于整棵子树，全树重算状态，单次 onChange */
    const handleCheck = useCallback(
      (
        checked: boolean,
        option: CascaderOption,
        level: number,
        alsoExpand?: boolean,
      ) => {
        if (alsoExpand) handleSelect(level, option);

        const values = new Set(selectedValues);
        const subtree = new Set<string>();
        collectSubtree(option, subtree);

        if (checked) {
          subtree.forEach((val) => values.add(val));
        } else {
          subtree.forEach((val) => values.delete(val));
        }

        const state = refreshTreeStates(
          options,
          values,
          new Set(indeterminateValues),
        );
        commit(state.values, state.indeterminate);
      },
      [
        selectedValues,
        indeterminateValues,
        options,
        handleSelect,
        commit,
      ],
    );

    /** 整列全选 / 取消全选（含全部子孙） */
    const handleCheckLevelAll = useCallback(
      (checked: boolean, opts: CascaderOption[]) => {
        const values = new Set(selectedValues);
        const subtree = new Set<string>();
        opts.forEach((opt) => collectSubtree(opt, subtree));

        if (checked) {
          subtree.forEach((val) => values.add(val));
        } else {
          subtree.forEach((val) => values.delete(val));
        }

        const state = refreshTreeStates(
          options,
          values,
          new Set(indeterminateValues),
        );
        commit(state.values, state.indeterminate);
      },
      [selectedValues, indeterminateValues, options, commit],
    );

    const renderColumn = (opts: CascaderOption[], level: number) => {
      if (!opts?.length) return null;

      const allSelected = opts.every((opt) => isChecked(opt.value));
      const someSelected = someSelectedFn(opts);
      const columnTitle = level === 0 ? title : selectedPaths[level - 1]?.label;

      return (
        <div className={`${prefix}-column`} key={level}>
          {columnTitle && (
            <div className={`${prefix}-column-title`}>{columnTitle}</div>
          )}

          <Checkbox
            className={`${prefix}-check-all`}
            indeterminate={someSelected && !allSelected}
            checked={allSelected}
            onChange={(e) => handleCheckLevelAll(e.target.checked, opts)}
          >
            全选
          </Checkbox>

          <div className={`${prefix}-column-list`}>
            {opts.map((option) => {
              const isSelected = isChecked(option.value);
              const isIndeterminate = someSelectedFn(option.children ?? []);
              const hasChildren = !!option.children?.length;
              const expanded = selectedPaths[level]?.value === option.value;

              return (
                <div
                  key={option.value}
                  className={classNames(
                    `${prefix}-option`,
                    expanded && `${prefix}-option-active`,
                  )}
                  onClick={() => handleSelect(level, option)}
                >
                  <div className={`${prefix}-option-main`}>
                    <Checkbox
                      checked={isSelected}
                      indeterminate={isIndeterminate && !isSelected}
                      onChange={(e) =>
                        handleCheck(e.target.checked, option, level, true)
                      }
                    />
                    <Tooltip title={option.tooltips} mouseEnterDelay={0.5}>
                      <span className={`${prefix}-option-label`}>
                        {option.label}
                      </span>
                    </Tooltip>
                  </div>
                  {hasChildren && (
                    <span className={`${prefix}-option-arrow`}>›</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /** 沿展开路径渲染每一列 */
    const renderColumns = () => {
      const columns: React.ReactNode[] = [];
      let current = options;

      for (let level = 0; level <= selectedPaths.length; level += 1) {
        columns.push(renderColumn(current, level));
        const next = selectedPaths[level];
        if (next?.children) current = next.children;
        else break;
      }
      return columns;
    };

    return (
      <div ref={ref} className={classNames(prefix, className)} style={style}>
        {renderColumns()}
      </div>
    );
  },
);

CascaderPanel.displayName = 'CascaderPanel';
