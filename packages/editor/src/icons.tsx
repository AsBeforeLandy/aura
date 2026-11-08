import React from 'react';

/**
 * 工具栏图标。
 *
 * 为什么不用 @aura-react-comp/icons：该包面向业务场景（操作/文件/状态），
 * 没有排版类图标。为避免为 18 个图标往图标库塞入编辑器专用语义，
 * 这里内联一套 16px 线性图标 —— 体积极小，且 stroke 跟随 currentColor。
 */

type IconProps = { size?: number };

const wrap = (children: React.ReactNode, size = 16) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

export const BoldIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M4 2.5h4.2a2.8 2.8 0 0 1 0 5.6H4z" />
      <path d="M4 8.1h4.8a2.9 2.9 0 0 1 0 5.8H4z" />
    </>,
    size,
  );

export const ItalicIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M6.5 2.5h6M3.5 13.5h6M9.5 2.5l-3 11" />
    </>,
    size,
  );

export const UnderlineIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5" />
      <path d="M3 14h10" />
    </>,
    size,
  );

export const StrikeIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M3 8h10" />
      <path d="M10.5 4.2A3 3 0 0 0 8 3C6.3 3 5 3.9 5 5.2c0 1 .8 1.8 2 2.3" />
      <path d="M5.5 11.6A3.2 3.2 0 0 0 8.2 13c1.8 0 3-.9 3-2.2 0-.9-.6-1.6-1.6-2.1" />
    </>,
    size,
  );

export const CodeIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M5.5 5L2.5 8l3 3M10.5 5l3 3-3 3" />
    </>,
    size,
  );

export const HighlightIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M4 11.5L9.8 5.7a1.6 1.6 0 0 1 2.3 0l.2.2a1.6 1.6 0 0 1 0 2.3L6.5 14H4z" />
      <path d="M3 15h10" />
    </>,
    size,
  );

export const PaletteIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M8 1.8a6.2 6.2 0 0 0 0 12.4c.9 0 1.4-.6 1.4-1.3 0-.8-.7-1.1-.7-1.9 0-.7.5-1.2 1.3-1.2h1.2A3.1 3.1 0 0 0 14.2 7C14.2 4 11.4 1.8 8 1.8z" />
      <circle cx="5.4" cy="6" r=".8" fill="currentColor" stroke="none" />
      <circle cx="8" cy="4.6" r=".8" fill="currentColor" stroke="none" />
      <circle cx="10.6" cy="6" r=".8" fill="currentColor" stroke="none" />
    </>,
    size,
  );

export const AlignLeftIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M2.5 4h11M2.5 8h7M2.5 12h9" />
    </>,
    size,
  );

export const AlignCenterIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M2.5 4h11M4.5 8h7M3.5 12h9" />
    </>,
    size,
  );

/** 垂直对齐：横轴线 + 竖线内容块，是水平对齐图标的镜像 */
export const AlignTopVIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M3 2.5h10M5.5 6v6.5M10.5 6v4.5" />
    </>,
    size,
  );

export const AlignMiddleVIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M3 8h10M5.5 3v3.5M10.5 3v4M5.5 9.5v3.5M10.5 9v3.5" />
    </>,
    size,
  );

export const AlignBottomVIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M3 13.5h10M5.5 3.5V10M10.5 5.5V10" />
    </>,
    size,
  );

export const AlignRightIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M2.5 4h11M6.5 8h7M4.5 12h9" />
    </>,
    size,
  );

export const ListBulletIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M6 4h7.5M6 8h7.5M6 12h7.5" />
      <circle cx="3" cy="4" r=".9" fill="currentColor" stroke="none" />
      <circle cx="3" cy="8" r=".9" fill="currentColor" stroke="none" />
      <circle cx="3" cy="12" r=".9" fill="currentColor" stroke="none" />
    </>,
    size,
  );

export const ListOrderedIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M6.5 4h7M6.5 8h7M6.5 12h7" />
      <path d="M2.2 2.8h.9V5M2 5h1.6" />
      <path d="M2 9.2a.9.9 0 0 1 1.6.5c0 .7-1.6 1.3-1.6 2.1h1.7" />
    </>,
    size,
  );

export const ListTaskIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M6.5 4h7M6.5 8h7M6.5 12h7" />
      <path d="M2 4l1 1 1.6-1.8M2 11.5l1 1L4.9 10" />
    </>,
    size,
  );

export const QuoteIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M3 4.5h2.5v3.2H3zM9.5 4.5H12v3.2H9.5z" />
      <path d="M3 7.7c0 2.3-.4 3.4-1.2 4.3M9.5 7.7c0 2.3-.4 3.4-1.2 4.3" />
    </>,
    size,
  );

export const CodeBlockIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <rect x="1.8" y="3" width="12.4" height="10" rx="1.5" />
      <path d="M6 7L4.6 8.5 6 10M10 7l1.4 1.5L10 10" />
    </>,
    size,
  );

export const DividerIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M2 8h12M5 4.5h6M5 11.5h6" />
    </>,
    size,
  );

export const LinkIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M6.8 9.2a2.8 2.8 0 0 0 4 0l1.9-1.9a2.8 2.8 0 0 0-4-4l-1 1" />
      <path d="M9.2 6.8a2.8 2.8 0 0 0-4 0L3.3 8.7a2.8 2.8 0 0 0 4 4l1-1" />
    </>,
    size,
  );

export const ImageIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <circle cx="5.6" cy="6.4" r="1.1" />
      <path d="M2.6 12l3.4-3.4L9 11.5l1.8-1.9 2.6 2.4" />
    </>,
    size,
  );

export const TableIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.2" />
      <path d="M2 6.3h12M2 9.7h12M6.3 3v10M10 3v10" />
    </>,
    size,
  );

export const UndoIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M3 7.5h6.5A3.5 3.5 0 0 1 13 11v0" />
      <path d="M5.5 4.5L3 7.5l2.5 3" />
    </>,
    size,
  );

export const RedoIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M13 7.5H6.5A3.5 3.5 0 0 0 3 11v0" />
      <path d="M10.5 4.5L13 7.5l-2.5 3" />
    </>,
    size,
  );

export const SubscriptIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M3 4l5 6M8 4L3 10" />
      <path d="M11 8.5h2.5l-2.5 3h2.5" />
    </>,
    size,
  );

export const SuperscriptIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M3 5.5l5 6M8 5.5l-5 6" />
      <path d="M11 3h2.5L11 6h2.5" />
    </>,
    size,
  );

export const ClearIcon = ({ size }: IconProps) =>
  wrap(
    <>
      <path d="M8 2.5l5.5 5.5L9 12.5H6L2.5 9z" />
      <path d="M6 12.5h7.5" />
    </>,
    size,
  );

export const CheckIcon = ({ size }: IconProps) =>
  wrap(<path d="M3 8.5l3.2 3L13 4.5" />, size);
