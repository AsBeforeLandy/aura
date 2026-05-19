import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface PopconfirmProps {
  /** 确认标题 */
  title: React.ReactNode;
  /** 确认描述 */
  description?: React.ReactNode;
  /** 确认回调 */
  onConfirm?: () => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 确认按钮文字
   *  @default '确定'
   */
  okText?: string;
  /** 取消按钮文字
   *  @default '取消'
   */
  cancelText?: string;
  /** 变体样式
   *  @default 'default'
   */
  variant?: 'default' | 'warning' | 'error';
  /** 弹出方位
   *  @default 'top'
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 目标元素（仅接受单个 ReactElement） */
  children: React.ReactElement;
}

export const PopconfirmBase = forwardRef<HTMLDivElement, PopconfirmProps>(
  (
    {
      title,
      description,
      onConfirm,
      onCancel,
      okText = '确定',
      cancelText = '取消',
      variant = 'default',
      placement = 'top',
      disabled = false,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const onCancelRef = useRef(onCancel);
    onCancelRef.current = onCancel;

    // 隐藏气泡
    const hide = () => {
      setAnimating(false);
      setTimeout(() => setVisible(false), 200);
    };

    // 点击外部关闭
    useEffect(() => {
      if (!visible) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(e.target as Node)
        ) {
          onCancelRef.current?.();
          hide();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [visible]);

    // 显示气泡
    const show = () => {
      if (disabled) return;
      setAnimating(true);
      setVisible(true);
    };

    // 确认操作
    const handleConfirm = () => {
      onConfirm?.();
      hide();
    };

    // 取消操作
    const handleCancel = () => {
      onCancel?.();
      hide();
    };

    // 构建子元素的 props
    const childProps: Record<string, unknown> = {};
    const childOwnProps = children.props as Record<string, unknown>;

    childProps.onClick = (e: React.MouseEvent) => {
      if (!disabled) {
        show();
      }
      (childOwnProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
    };

    const wrapperCls = classNames(
      prefixCls('popconfirm-wrapper'),
      className,
    );

    const popCls = classNames(
      prefixCls('popconfirm'),
      prefixCls(`popconfirm-${placement}`),
      variant !== 'default' && prefixCls(`popconfirm-${variant}`),
      animating && prefixCls('popconfirm-visible'),
    );

    return (
      <div ref={(node) => {
        (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }} className={wrapperCls} style={style}>
        {React.cloneElement(children, childProps)}
        {visible && (
          <div className={popCls} role="dialog" aria-label={typeof title === 'string' ? title : undefined}>
            <div className={prefixCls('popconfirm-content')}>
              <div className={prefixCls('popconfirm-title')}>{title}</div>
              {description && (
                <div className={prefixCls('popconfirm-description')}>{description}</div>
              )}
              <div className={prefixCls('popconfirm-buttons')}>
                <button
                  className={classNames(prefixCls('popconfirm-btn'), prefixCls('popconfirm-btn-cancel'))}
                  onClick={handleCancel}
                >
                  {cancelText}
                </button>
                <button
                  className={classNames(prefixCls('popconfirm-btn'), prefixCls(`popconfirm-btn-${variant === 'default' ? 'primary' : variant}`))}
                  onClick={handleConfirm}
                >
                  {okText}
                </button>
              </div>
            </div>
            <div className={prefixCls('popconfirm-arrow')} />
          </div>
        )}
      </div>
    );
  },
);

PopconfirmBase.displayName = 'Popconfirm';

export const Popconfirm = PopconfirmBase;
