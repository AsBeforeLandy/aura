import React, {
  forwardRef,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { CheckOutline } from '@aura/icons';
import './index.less';

/* ===== Context ===== */
interface StepsContextValue {
  current: number;
  variant: 'default' | 'dot' | 'navigation';
  size: 'sm' | 'md';
  direction: 'horizontal' | 'vertical';
  onChange: (current: number) => void;
  totalSteps: number;
}

const StepsContext = createContext<StepsContextValue | null>(null);

function useStepsContext() {
  const ctx = useContext(StepsContext);
  if (!ctx) throw new Error('Steps.Step 必须在 Steps 内部使用');
  return ctx;
}

/* ===== Steps.Step ===== */
export interface StepProps {
  /** 步骤标题 */
  title: React.ReactNode;
  /** 步骤描述 */
  description?: React.ReactNode;
  /** 自定义图标 */
  icon?: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const Step = forwardRef<HTMLDivElement, StepProps>(
  ({ title, description, icon, disabled = false, className, style }, ref) => {
    const { current, variant, size, onChange, totalSteps } = useStepsContext();
    const index = useContext(StepIndexContext);
    const isCompleted = index < current;
    const isCurrent = index === current;

    const handleClick = () => {
      if (disabled) return;
      onChange(index);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    const stepCls = classNames(
      prefixCls('steps-step'),
      isCompleted && prefixCls('steps-step-completed'),
      isCurrent && prefixCls('steps-step-active'),
      disabled && prefixCls('steps-step-disabled'),
      className,
    );

    /* --- 渲染图标区域 --- */
    const renderIcon = () => {
      if (icon) return icon;

      if (variant === 'dot') {
        return <span className={prefixCls('steps-dot-icon')} />;
      }

      // default / navigation variant
      if (isCompleted) {
        return (
          <span className={prefixCls('steps-check')}>
            <CheckOutline size={14} />
          </span>
        );
      }

      return <span className={prefixCls('steps-number')}>{index + 1}</span>;
    };

    return (
      <div
        ref={ref}
        className={stepCls}
        style={style}
        role="listitem"
        aria-current={isCurrent ? 'step' : undefined}
      >
        <div
          className={prefixCls('steps-step-header')}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
        >
          <div
            className={classNames(
              prefixCls('steps-icon'),
              isCompleted && prefixCls('steps-icon-completed'),
              isCurrent && prefixCls('steps-icon-active'),
            )}
          >
            {renderIcon()}
          </div>
          <div className={prefixCls('steps-step-content')}>
            <div className={prefixCls('steps-step-title')}>{title}</div>
            {description && (
              <div className={prefixCls('steps-step-description')}>
                {description}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Step.displayName = 'Steps.Step';

/* ===== StepIndexContext — 用于 Step 获取自己的 index ===== */
const StepIndexContext = React.createContext<number>(0);

/* ===== Steps（主组件） ===== */
export interface StepsProps {
  /** 当前步骤索引（从 0 开始）
   *  @default 0
   */
  current?: number;
  /** 变体
   *  @default 'default'
   */
  variant?: 'default' | 'dot' | 'navigation';
  /** 尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md';
  /** 方向
   *  @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';
  /** 步骤切换回调 */
  onChange?: (current: number) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

const StepsBase = forwardRef<HTMLDivElement, StepsProps>(
  (
    {
      current = 0,
      variant = 'default',
      size = 'md',
      direction = 'horizontal',
      onChange,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const handleChange = useCallback(
      (next: number) => {
        onChange?.(next);
      },
      [onChange],
    );

    const childArray = React.Children.toArray(children);
    const totalSteps = childArray.length;

    const ctxValue: StepsContextValue = {
      current,
      variant,
      size,
      direction,
      onChange: handleChange,
      totalSteps,
    };

    const wrapperCls = classNames(
      prefixCls('steps'),
      prefixCls(`steps-${variant}`),
      prefixCls(`steps-${size}`),
      prefixCls(`steps-${direction}`),
      className,
    );

    return (
      <StepsContext.Provider value={ctxValue}>
        <div
          ref={ref}
          className={wrapperCls}
          style={style}
          role="list"
          aria-label="步骤条"
        >
          {childArray.map((child, index) => (
            <StepIndexContext.Provider key={index} value={index}>
              <div className={prefixCls('steps-step-container')}>
                {child}
                {/* 连接线 */}
                {index < totalSteps - 1 && (
                  <div
                    className={classNames(
                      prefixCls('steps-tail'),
                      index < current
                        ? prefixCls('steps-tail-completed')
                        : prefixCls('steps-tail-pending'),
                    )}
                  />
                )}
              </div>
            </StepIndexContext.Provider>
          ))}
        </div>
      </StepsContext.Provider>
    );
  },
);

StepsBase.displayName = 'Steps';

/* ===== 复合组件导出 ===== */
interface StepsComponent
  extends React.ForwardRefExoticComponent<
    StepsProps & React.RefAttributes<HTMLDivElement>
  > {
  Step: typeof Step;
}

const Steps = StepsBase as unknown as StepsComponent;
Steps.Step = Step;

export { Steps };
