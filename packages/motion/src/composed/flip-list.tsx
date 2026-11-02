'use client';

/**
 * 列表增删 / 排序的自动重排（FLIP）。
 * items 变化时：新增项淡入、删除项淡出、存量项平滑移动到新位置。
 */

import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';
import { motionDurations, motionEases, motionSprings } from '../tokens';

export interface FlipListItem<T extends string = string> {
  /** 稳定唯一键（同时也是 AnimatePresence 的 key） */
  id: T;
  node: React.ReactNode;
}

export interface FlipListProps<T extends string = string> extends Omit<
  HTMLMotionProps<'ul'>,
  'children'
> {
  items: FlipListItem<T>[];
  /** 渲染为哪种列表标签 */
  as?: 'ul' | 'ol';
  duration?: 'fast' | 'normal' | 'slow';
  /** 100+ 行时建议配合虚拟列表；开启后关闭离场动画以避免布局抖动叠加 */
  virtualized?: boolean;
}

export function FlipList<T extends string = string>({
  items,
  as: Tag = 'ul',
  duration = 'normal',
  virtualized = false,
  style,
  ...rest
}: FlipListProps<T>) {
  const ListTag = motion[Tag] as typeof motion.ul;
  // 分层过渡（Motion 的 per-value transition）：位置重排走弹簧（跟手、无拖影），
  // 进出场的透明度 / 位移 / 缩放仍走时长（节奏可预测，便于与列表其它动画对齐）。
  const fade = {
    duration: motionDurations[duration],
    ease: motionEases.standard,
  };
  const transition = {
    layout: motionSprings.spring,
    opacity: fade,
    y: fade,
    scale: fade,
  };

  return (
    <ListTag
      style={{ listStyle: 'none', margin: 0, padding: 0, ...style }}
      {...rest}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={virtualized ? undefined : { opacity: 0, scale: 0.96 }}
            transition={transition}
          >
            {item.node}
          </motion.li>
        ))}
      </AnimatePresence>
    </ListTag>
  );
}
