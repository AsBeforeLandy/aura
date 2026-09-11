import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox, Tooltip } from 'antd';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

/** 级联选项（支持任意扩展字段，回调时原样回传） */
export interface CascaderOption {
  label: string;
  value: string;
  /** 选项提示文案（悬停显示） */
  tooltips?: string;
  children?: CascaderOption[];
  [key: string]: any;
}

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

/** 树节点勾选状态的聚合结果 */
interface TreeCheckState {
  /** 选中值集合 */
  values: Set<string>;
  /** 半选值集合 */
  indeterminate: Set<string>;
}

/** 收集选中值对应的所有子孙值（勾选父级即视为勾选整棵子树） */
function expandWithDescendants(
  options: CascaderOption[],
  selected: ReadonlySet<string>,
): Set<string> {
  const result = new Set(selected);
  const walk = (opts: CascaderOption[]) => {
    for (const opt of opts) {
      if (result.has(opt.value)) {
        const collect = (children: CascaderOption[]) => {
          for (const child of children) {
            result.add(child.value);
            if (child.children?.length) collect(child.children);
          }
        };
        if (opt.children?.length) collect(opt.children);
      }
      if (opt.children?.length) walk(opt.children);
    }
  };
  walk(options);
  return result;
}

/** 收集一棵子树的全部值 */
function collectSubtree(node: CascaderOption, into: Set<string>) {
  into.add(node.value);
  node.children?.forEach((child) => collectSubtree(child, into));
}

/** 由选中集合反推「最大粒度」选项：整树选中时由父级代表子孙 */
function pickTopSelected(
  options: CascaderOption[],
  selected: ReadonlySet<string>,
): { selectedOptions: CascaderOption[]; selectedValues: string[] } {
  const outOptions: CascaderOption[] = [];
  const outValues: string[] = [];

  const find = (opts: CascaderOption[], parentSelected = false) => {
    opts.forEach((opt) => {
      const isSelected = selected.has(opt.value);
      const childrenAllSelected =
        opt.children?.every((child) => selected.has(child.value)) ?? false;

      if (isSelected && childrenAllSelected) {
        outOptions.push(opt);
        outValues.push(opt.value);
      } else if (opt.children) {
        find(opt.children, isSelected);
      } else if (isSelected && !parentSelected) {
        outOptions.push(opt);
        outValues.push(opt.value);
      }
    });
  };

  find(options);
  return { selectedOptions: outOptions, selectedValues: outValues };
}

/**
 * 全树重算每个父级的全选 / 半选状态
 *
 * 相比沿展开路径逐层回溯，全树重算不会漏判未展开子树的变化。
 */
function refreshTreeStates(
  options: CascaderOption[],
  values: ReadonlySet<string>,
  indeterminate: ReadonlySet<string>,
): TreeCheckState {
  const nextValues = new Set(values);
  const nextIndeterminate = new Set(indeterminate);

  const walk = (opts: CascaderOption[]): { all: boolean; some: boolean } => {
    let all = true;
    let some = false;

    for (const opt of opts) {
      if (opt.children?.length) {
        const child = walk(opt.children);
        if (child.all) {
          nextValues.add(opt.value);
          nextIndeterminate.delete(opt.value);
        } else if (child.some) {
          nextIndeterminate.add(opt.value);
          nextValues.delete(opt.value);
        } else {
          nextValues.delete(opt.value);
          nextIndeterminate.delete(opt.value);
        }
        all = all && child.all;
        some = some || child.some || child.all;
      } else {
        const checked = nextValues.has(opt.value);
        all = all && checked;
        some = some || checked;
      }
    }
    return { all, some };
  };

  walk(options);
  return { values: nextValues, indeterminate: nextIndeterminate };
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

    /** options / value 的序列化签名，作为同步 effect 的稳定依赖 */
    const signature = `${JSON.stringify(options)}|${JSON.stringify(value)}`;

    useEffect(() => {
      if (value) {
        setSelectedValues([
          ...expandWithDescendants(options, new Set(value)),
        ]);
      }
    }, [signature]);

    /** 提交一次状态变更：重算树状态并只触发一次 onChange */
    const commit = (
      values: Iterable<string>,
      indeterminate: Iterable<string>,
    ) => {
      setSelectedValues([...values]);
      setIndeterminateValues([...indeterminate]);
      const selected = new Set(values);
      const result = pickTopSelected(options, selected);
      onChange?.(result.selectedValues, result.selectedOptions);
    };

    const isChecked = useCallback(
      (val: string) => selectedValues.includes(val),
      [selectedValues],
    );

    const someSelectedFn = useCallback(
      (opts: CascaderOption[]): boolean =>
        opts.some(
          (opt) =>
            selectedValues.includes(opt.value) ||
            (opt.children?.length ? someSelectedFn(opt.children) : false),
        ),
      [selectedValues],
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

        const state = refreshTreeStates(options, values, indeterminateValues);
        commit(state.values, state.indeterminate);
      },
      [
        selectedValues,
        indeterminateValues,
        options,
        handleSelect,
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

        const state = refreshTreeStates(options, values, indeterminateValues);
        commit(state.values, state.indeterminate);
      },
      [selectedValues, indeterminateValues, options],
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
