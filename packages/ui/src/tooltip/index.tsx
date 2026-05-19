import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface TooltipProps {
  /** 提示内容 */
  content: React.ReactNode;
  /** 弹出方位
   *  @default 'top'
   */
  placement?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight';
  /** 触发方式
   *  @default 'hover'
   */
  trigger?: 'hover' | 'click' | 'focus';
  /** 延迟显示（毫秒）
   *  @default 0
   */
  delay?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 目标元素（仅接受单个 ReactElement） */
  children: React.ReactElement;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      placement = 'top',
      trigger = 'hover',
      delay = 0,
      disabled = false,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 清除延迟定时器
    const clearDelayTimer = useCallback(() => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    }, []);

    // 显示 tooltip
    const show = useCallback(() => {
      if (disabled) return;
      clearDelayTimer();
      if (delay > 0) {
        delayTimerRef.current = setTimeout(() => {
          setAnimating(true);
          setVisible(true);
        }, delay);
      } else {
        setAnimating(true);
        setVisible(true);
      }
    }, [disabled, delay, clearDelayTimer]);

    // 隐藏 tooltip
    const hide = useCallback(() => {
      clearDelayTimer();
      setAnimating(false);
      // 等动画结束后再卸载
      setTimeout(() => setVisible(false), 200);
    }, [clearDelayTimer]);

    // 切换 tooltip
    const toggle = useCallback(() => {
      if (disabled) return;
      if (visible) {
        hide();
      } else {
        show();
      }
    }, [disabled, visible, show, hide]);

    // 组件卸载时清理定时器
    useEffect(() => {
      return () => clearDelayTimer();
    }, [clearDelayTimer]);

    // 构建子元素的 props
    const childProps: Record<string, unknown> = {};
    const childOwnProps = children.props as Record<string, unknown>;

    if (trigger === 'hover') {
      childProps.onMouseEnter = (e: React.MouseEvent) => {
        show();
        (childOwnProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(e);
      };
      childProps.onMouseLeave = (e: React.MouseEvent) => {
        hide();
        (childOwnProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e);
      };
    } else if (trigger === 'click') {
      childProps.onClick = (e: React.MouseEvent) => {
        toggle();
        (childOwnProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
      };
    } else if (trigger === 'focus') {
      childProps.onFocus = (e: React.FocusEvent) => {
        show();
        (childOwnProps.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(e);
      };
      childProps.onBlur = (e: React.FocusEvent) => {
        hide();
        (childOwnProps.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(e);
      };
    }

    const wrapperCls = classNames(
      prefixCls('tooltip-wrapper'),
      className,
    );

    const tooltipCls = classNames(
      prefixCls('tooltip'),
      prefixCls(`tooltip-${placement}`),
      animating && prefixCls('tooltip-visible'),
    );

    return (
      <div ref={ref} className={wrapperCls} style={style}>
        {React.cloneElement(children, childProps)}
        {visible && content && (
          <div className={tooltipCls} role="tooltip">
            <div className={prefixCls('tooltip-content')}>{content}</div>
            <div className={prefixCls('tooltip-arrow')} />
          </div>
        )}
      </div>
    );
  },
);

Tooltip.displayName = 'Tooltip';
