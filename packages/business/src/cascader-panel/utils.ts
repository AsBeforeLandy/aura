/**
 * CascaderPanel 的纯函数工具层：级联树的勾选展开、聚合与状态重算。
 *
 * 与 React 渲染完全解耦，便于独立单测；组件本体只负责交互与视图。
 */

/** 级联选项（支持任意扩展字段，回调时原样回传） */
export interface CascaderOption {
  label: string;
  value: string;
  /** 选项提示文案（悬停显示） */
  tooltips?: string;
  children?: CascaderOption[];
  // 索引签名用于承载调用方的自定义字段并在回调中原样回传。
  // 收窄为 unknown 会让所有读取端被迫逐个断言，属对外 API 破坏性变更，故保留 any。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 见上
  [key: string]: any;
}

/** 树节点勾选状态的聚合结果 */
export interface TreeCheckState {
  /** 选中值集合 */
  values: Set<string>;
  /** 半选值集合 */
  indeterminate: Set<string>;
}

/** 收集选中值对应的所有子孙值（勾选父级即视为勾选整棵子树） */
export function expandWithDescendants(
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
export function collectSubtree(node: CascaderOption, into: Set<string>) {
  into.add(node.value);
  node.children?.forEach((child) => collectSubtree(child, into));
}

/** 由选中集合反推「最大粒度」选项：整树选中时由父级代表子孙 */
export function pickTopSelected(
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
export function refreshTreeStates(
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
