'use client';

/**
 * 打字机：AI 流式回复的补位方案（无流式接口时模拟逐字输出）。
 * reduced-motion 下直接呈现全文；文本变化时重放。
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface TypewriterProps {
  text: string;
  /** 每个字符的间隔（毫秒） */
  speed?: number;
  /** 起始延时（毫秒） */
  delay?: number;
  /** 是否显示闪烁光标 */
  caret?: boolean;
  /** 全部输出完成时回调 */
  onComplete?: () => void;
  className?: string;
}

export function Typewriter({
  text,
  speed = 32,
  delay = 0,
  caret = true,
  onComplete,
  className,
}: TypewriterProps) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    doneRef.current = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const startTimer = setTimeout(() => {
      timer = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            clearInterval(timer);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(startTimer);
      clearInterval(timer);
    };
  }, [text, speed, delay, reduced]);

  useEffect(() => {
    if (count >= text.length && text.length > 0 && !doneRef.current) {
      doneRef.current = true;
      onComplete?.();
    }
  }, [count, text, onComplete]);

  const done = count >= text.length;

  return (
    <span className={className}>
      {text.slice(0, count)}
      {caret && !done && (
        <motion.span
          aria-hidden
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
        >
          ▍
        </motion.span>
      )}
      <span aria-live="polite" style={{ position: 'absolute', left: -9999 }}>
        {done ? text : ''}
      </span>
    </span>
  );
}
