'use client';

/**
 * 拖拽排序：转发引擎 Reorder 并提供扁平命名的 Group / Item，
 * 便于在 dumi demo 等场景以简单标识符 JSX 使用（<ReorderGroup>/<ReorderItem>）。
 * 跨容器排序属 M3 增强。
 */

import { Reorder } from 'motion/react';

export { Reorder };
export const ReorderGroup: typeof Reorder.Group = Reorder.Group;
export const ReorderItem: typeof Reorder.Item = Reorder.Item;
