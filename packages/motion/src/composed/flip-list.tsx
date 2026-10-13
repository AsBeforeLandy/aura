'use client';

/**
 * 列表增删 / 排序的自动重排（FLIP）。
 * items 变化时：新增项淡入、删除项淡出、存量项平滑移动到新位置。
 */

import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';
import { motionDurations, motionEases } from '../tokens';

export interface FlipListItem<T extends string = string> {
  /** 稳定唯一键（同时也是 AnimatePresence 的 key） */
  id: T;
  node: React.ReactNode;
}

export interface FlipListProps<T extends string = string>
  extends Omit<HTMLMotionProps<'ul'>, 'children'> {
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
  const transition = { duration: motionDurations[duration], ease: motionEases.standard };

  return (
    <ListTag style={{ listStyle: 'none', margin: 0, padding: 0, ...style }} {...rest}>
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
