import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface AvatarProps {
  /** 头像尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | number;
  /** 头像形状
   *  @default 'circle'
   */
  shape?: 'circle' | 'square';
  /** 图片地址 */
  src?: string;
  /** 图片 alt 文本 */
  alt?: string;
  /** 头像变体
   *  @default 'default'
   */
  variant?: 'default' | 'primary';
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素（图片加载失败或无 src 时显示） */
  children?: React.ReactNode;
}

/** 获取首字母 */
function getInitial(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children.charAt(0).toUpperCase();
  }
  if (typeof children === 'number') {
    return String(children).charAt(0);
  }
  return '?';
}

/** 尺寸映射 */
const sizeMap: Record<string, number> = {
  sm: 24,
  md: 32,
  lg: 40,
};

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      size = 'md',
      shape = 'circle',
      src,
      alt,
      variant = 'default',
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [imgFailed, setImgFailed] = useState(false);
    const prevSrcRef = useRef(src);

    // src 变化时重置失败状态
    if (prevSrcRef.current !== src) {
      setImgFailed(false);
      prevSrcRef.current = src;
    }

    const handleError = useCallback(() => {
      setImgFailed(true);
    }, []);

    const pixelSize = typeof size === 'number' ? size : sizeMap[size] ?? 32;

    const customStyle: React.CSSProperties = {
      width: pixelSize,
      height: pixelSize,
      fontSize: Math.max(Math.round(pixelSize * 0.4), 12),
      lineHeight: `${pixelSize}px`,
      ...style,
    };

    const showImage = src && !imgFailed;

    const cls = classNames(
      prefixCls('avatar'),
      prefixCls(`avatar-${shape}`),
      variant !== 'default' && prefixCls(`avatar-${variant}`),
      imgFailed && prefixCls('avatar-img-failed'),
      className,
    );

    return (
      <span
        ref={ref}
        className={cls}
        style={customStyle}
        role={showImage ? 'img' : undefined}
        aria-label={alt || (typeof children === 'string' ? children : undefined)}
      >
        {showImage ? (
          <img
            className={prefixCls('avatar-img')}
            src={src}
            alt={alt || ''}
            onError={handleError}
          />
        ) : (
          <span className={prefixCls('avatar-text')}>
            {children ?? getInitial(children)}
          </span>
        )}
      </span>
    );
  },
);

Avatar.displayName = 'Avatar';

/* ===== Avatar.Group（头像组） ===== */

export interface AvatarGroupProps {
  /** 最大显示数量，超出以 +N 显示 */
  maxCount?: number;
  /** 头像组尺寸 */
  size?: 'sm' | 'md' | 'lg' | number;
  /** 头像组形状 */
  shape?: 'circle' | 'square';
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  maxCount,
  size,
  shape,
  className,
  style,
  children,
}) => {
  const cls = classNames(prefixCls('avatar-group'), className);

  const childArray = React.Children.toArray(children);
  const displayChildren = maxCount
    ? childArray.slice(0, maxCount)
    : childArray;
  const remainingCount = maxCount
    ? Math.max(childArray.length - maxCount, 0)
    : 0;

  /** 尺寸映射（用于溢出指示器的字体大小） */
  const pixelSize = typeof size === 'number' ? size : sizeMap[size ?? 'md'] ?? 32;

  return (
    <div className={cls} style={style}>
      {displayChildren.map((child, index) => {
        if (React.isValidElement<AvatarProps>(child)) {
          return React.cloneElement(child, {
            size: child.props.size ?? size,
            shape: child.props.shape ?? shape,
            style: {
              ...child.props.style,
              zIndex: displayChildren.length - index,
            },
          });
        }
        return child;
      })}
      {remainingCount > 0 && (
        <span
          className={classNames(
            prefixCls('avatar'),
            prefixCls('avatar-circle'),
            prefixCls('avatar-group-overflow'),
          )}
          style={{
            width: pixelSize,
            height: pixelSize,
            fontSize: Math.max(Math.round(pixelSize * 0.35), 12),
            lineHeight: `${pixelSize}px`,
          }}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

AvatarGroup.displayName = 'AvatarGroup';
