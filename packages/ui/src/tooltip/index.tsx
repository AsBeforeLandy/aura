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
    | 'bottomRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom';
  /** 触发方式
   *  @default 'hover'
   */
  trigger?: 'hover' | 'click' | 'focus';
  /** 显示延迟（毫秒）；`mouseEnterDelay` 的简写形式
   *  @default 0
   */
  delay?: number;
  /** 鼠标移入后延迟显示（毫秒）
   *  @default 0
   */
  mouseEnterDelay?: number;
  /** 鼠标移出后延迟隐藏（毫秒）
   *  @default 0
   */
  mouseLeaveDelay?: number;
  /** 受控显示状态；传入后组件显隐完全由该值驱动 */
  open?: boolean;
  /** 显示状态变化回调（受控 / 非受控均会触发） */
  onOpenChange?: (open: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 目标元素（仅接受单个 ReactElement） */
  children: React.ReactElement;
}

/** 退场动画时长（与 index.less 的过渡时间保持一致） */
const LEAVE_DURATION = 200;

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      placement = 'top',
      trigger = 'hover',
      delay = 0,
      mouseEnterDelay,
      mouseLeaveDelay = 0,
      open: controlledOpen,
      onOpenChange,
      disabled = false,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const isControlled = controlledOpen !== undefined;
    const enterDelay = mouseEnterDelay ?? delay;

    const [internalOpen, setInternalOpen] = useState(false);
    // mounted：DOM 是否挂载（含退场动画期）；animating：是否处于显示动画态
    const [mounted, setMounted] = useState(false);
    const [animating, setAnimating] = useState(false);

    const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = useCallback(() => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      enterTimerRef.current = null;
      leaveTimerRef.current = null;
    }, []);

    const currentOpen = isControlled ? controlledOpen : internalOpen;

    // 受控模式：跟随 open prop 驱动动画与挂载
    useEffect(() => {
      if (!isControlled) return;
      if (controlledOpen) {
        setMounted(true);
        setAnimating(true);
      } else {
        setAnimating(false);
        const timer = setTimeout(() => setMounted(false), LEAVE_DURATION);
        return () => clearTimeout(timer);
      }
    }, [isControlled, controlledOpen]);

    // 显示（enterDelay 为 0 时同步执行，与既有行为一致）
    const show = useCallback(() => {
      if (disabled) return;
      clearTimers();
      const triggerShow = () => {
        if (!isControlled) {
          setMounted(true);
          setAnimating(true);
          setInternalOpen(true);
        }
        onOpenChange?.(true);
      };
      if (enterDelay > 0) {
        enterTimerRef.current = setTimeout(triggerShow, enterDelay);
      } else {
        triggerShow();
      }
    }, [disabled, clearTimers, isControlled, onOpenChange, enterDelay]);

    // 隐藏（退场动画结束后卸载 DOM；leaveDelay 为 0 时同步执行）
    const hide = useCallback(() => {
      if (disabled) return;
      clearTimers();
      const triggerHide = () => {
        onOpenChange?.(false);
        if (isControlled) return;
        setAnimating(false);
        setInternalOpen(false);
        unmountTimerRef.current = setTimeout(
          () => setMounted(false),
          LEAVE_DURATION,
        );
      };
      if (mouseLeaveDelay > 0) {
        leaveTimerRef.current = setTimeout(triggerHide, mouseLeaveDelay);
      } else {
        triggerHide();
      }
    }, [disabled, clearTimers, isControlled, onOpenChange, mouseLeaveDelay]);

    // 切换（click 触发）
    const toggle = useCallback(() => {
      if (disabled) return;
      if (currentOpen) {
        hide();
      } else {
        show();
      }
    }, [disabled, currentOpen, show, hide]);

    // 组件卸载时清理定时器
    useEffect(() => {
      return () => clearTimers();
    }, [clearTimers]);

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
        {mounted && content && (
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
