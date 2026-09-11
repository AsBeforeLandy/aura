import React, { forwardRef, useEffect, useRef, useState } from 'react';
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
  /** 选中值变化回调 */
  onChange?: (selectedValues: string[], selectedOptions: CascaderOption[]) => void;
  /** 点击选项（展开下级）回调 */
  onCurrentClick?: (value: CascaderOption) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 收集选中值对应的所有子孙值（勾选父级即视为勾选整棵子树）
 */
function getValuesWithChildren(options: CascaderOption[], value: string[]): string[] {
  const result: string[] = [];
  const traverse = (opts: CascaderOption[]) => {
    for (const opt of opts) {
      if (value.includes(opt.value)) {
        result.push(opt.value);
        const collectChildren = (children: CascaderOption[]) => {
          for (const child of children) {
            result.push(child.value);
            if (child.children?.length) collectChildren(child.children);
          }
        };
        if (opt.children?.length) collectChildren(opt.children);
      }
      if (opt.children?.length) traverse(opt.children);
    }
  };
  traverse(options);
  return result;
}

/**
 * 由「选中值集合」反推「选中的最大粒度选项」：
 * 父级与其全部子级都被选中时只保留父级，否则保留叶子
 */
function getSelectedOptions(
  options: CascaderOption[],
  selectedValues: string[],
): { selectedOptions: CascaderOption[]; selectedValues: string[] } {
  const outOptions: CascaderOption[] = [];
  const outValues: string[] = [];

  const find = (opts: CascaderOption[], parentSelected = false) => {
    opts.forEach((opt) => {
      const isSelected = selectedValues.includes(opt.value);
      const childrenAllSelected =
        opt.children?.every((child) => selectedValues.includes(child.value)) ?? false;

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
 * CascaderPanel — 级联多选面板
 *
 * 以横向多列的形式呈现多级选项：点击选项展开下级，勾选后级联作用于整棵子树，
 * 逐列提供「全选」，父级自动呈现全选 / 半选状态。
 *
 * 与 antd Cascader（下拉形态、单选路径）不同，本组件为平铺面板的**多选**形态，
 * 适用于组织架构、类目树等需要批量圈选子级场景。
 */
export const CascaderPanel = forwardRef<HTMLDivElement, CascaderPanelProps>(
  ({ options, title = '', value, onChange, onCurrentClick, className, style }, ref) => {
    const prefix = prefixCls('cascader-panel');
    const scrollRef = useRef<HTMLDivElement>(null);

    /** 展开路径：每一级当前点开的选项 */
    const [selectedPaths, setSelectedPaths] = useState<CascaderOption[]>([]);
    /** 选中值（含级联子孙） */
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    /** 半选值（父级的部分子级被选中） */
    const [indeterminateValues, setIndeterminateValues] = useState<string[]>([]);

    useEffect(() => {
      if (value) {
        setSelectedValues(getValuesWithChildren(options, value));
      }
      // 依赖序列化以对齐原实现的比较粒度
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(value), JSON.stringify(options)]);

    const isChecked = (val: string) => selectedValues.includes(val);

    const someSelectedFn = (opts: CascaderOption[]): boolean =>
      opts.some((opt) => isChecked(opt.value) || (opt.children?.length ? someSelectedFn(opt.children) : false));

    /** 点开某一级：截断展开路径并自动向右滚动 */
    const handleSelect = (level: number, option: CascaderOption) => {
      scrollRef.current?.scrollBy({ left: level * 212, behavior: 'smooth' });
      const paths = selectedPaths.slice(0, level);
      paths[level] = option;
      setSelectedPaths(paths);
      onCurrentClick?.(option);
    };

    /**
     * 勾选 / 取消勾选：级联作用于整棵子树
     *
     * 注：沿用原实现的原地更新方式 —— 紧随其后的 updateParentState
     * 需要读到同一 tick 内的最新选中集合
     */
    const updateSelection = (opt: CascaderOption, isSelected: boolean) => {
      const updateValues = (opts: CascaderOption[]) => {
        opts.forEach((o) => {
          if (isSelected) {
            if (!selectedValues.includes(o.value)) selectedValues.push(o.value);
          } else {
            const idx = selectedValues.indexOf(o.value);
            if (idx > -1) selectedValues.splice(idx, 1);
          }
          if (o.children) updateValues(o.children);
        });
      };
      updateValues([opt]);
      setSelectedValues([...selectedValues]);
      const result = getSelectedOptions(options, [...selectedValues]);
      onChange?.(result.selectedValues, result.selectedOptions);
    };

    /** 自下而上刷新父级的全选 / 半选状态（同样原地更新后整体触发渲染） */
    const updateParentState = (level: number) => {
      if (level < 0) return;
      const parent = selectedPaths[level - 1];
      if (!parent) return;

      const allSelected = parent.children?.every((c) => isChecked(c.value)) ?? false;
      const someSelected = someSelectedFn(parent.children ?? []);

      if (allSelected) {
        if (!selectedValues.includes(parent.value)) selectedValues.push(parent.value);
        const idx = indeterminateValues.indexOf(parent.value);
        if (idx > -1) indeterminateValues.splice(idx, 1);
      } else if (someSelected) {
        if (!indeterminateValues.includes(parent.value)) indeterminateValues.push(parent.value);
        const idx = selectedValues.indexOf(parent.value);
        if (idx > -1) selectedValues.splice(idx, 1);
      } else {
        const idx = selectedValues.indexOf(parent.value);
        if (idx > -1) selectedValues.splice(idx, 1);
        const ind = indeterminateValues.indexOf(parent.value);
        if (ind > -1) indeterminateValues.splice(ind, 1);
      }

      setSelectedValues([...selectedValues]);
      const result = getSelectedOptions(options, [...selectedValues]);
      onChange?.(result.selectedValues, result.selectedOptions);
      setIndeterminateValues([...indeterminateValues]);
      updateParentState(level - 1);
    };

    const handleCheck = (
      checked: boolean,
      option: CascaderOption,
      level: number,
      alsoExpand?: boolean,
    ) => {
      if (alsoExpand) handleSelect(level, option);
      updateSelection(option, checked);
      updateParentState(level);
    };

    /** 整列全选 / 取消全选（含全部子孙） */
    const handleCheckLevelAll = (checked: boolean, opts: CascaderOption[]) => {
      const values = new Set<string>();
      const gather = (list: CascaderOption[]) => {
        list.forEach((o) => {
          values.add(o.value);
          if (o.children?.length) gather(o.children);
        });
      };
      gather(opts);

      const nextSelected = new Set(selectedValues);
      const nextIndeterminate = new Set(indeterminateValues);
      values.forEach((val) => {
        if (checked) {
          nextSelected.add(val);
          nextIndeterminate.delete(val);
        } else {
          nextSelected.delete(val);
          nextIndeterminate.delete(val);
        }
      });

      setSelectedValues([...nextSelected]);
      setIndeterminateValues([...nextIndeterminate]);
      const result = getSelectedOptions(options, [...nextSelected]);
      onChange?.(result.selectedValues, result.selectedOptions);
    };

    const renderColumn = (opts: CascaderOption[], level: number) => {
      if (!opts?.length) return null;

      const allSelected = opts.every((opt) => isChecked(opt.value));
      const someSelected = someSelectedFn(opts);
      const columnTitle = level === 0 ? title : selectedPaths[level - 1]?.label;

      return (
        <div className={`${prefix}-column`} key={level}>
          {columnTitle && <div className={`${prefix}-column-title`}>{columnTitle}</div>}

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
                  className={classNames(`${prefix}-option`, expanded && `${prefix}-option-active`)}
                  onClick={() => handleSelect(level, option)}
                >
                  <div className={`${prefix}-option-main`}>
                    <Checkbox
                      checked={isSelected}
                      indeterminate={isIndeterminate && !isSelected}
                      onChange={(e) => handleCheck(e.target.checked, option, level, true)}
                    />
                    <Tooltip title={option.tooltips} mouseEnterDelay={0.5}>
                      <span className={`${prefix}-option-label`}>{option.label}</span>
                    </Tooltip>
                  </div>
                  {hasChildren && <span className={`${prefix}-option-arrow`}>›</span>}
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
