// @ts-nocheck - demo 文件由 dumi 编译，跨包引用不受 father rootDir 限制
import React, { useState, useMemo } from 'react';
import * as Icons from '@aura/icons';
import { Tabs, TabItem, Input, Flex } from '@aura/ui';
import './icon-list.less';

const iconCategories: { title: string; icons: string[] }[] = [
  {
    title: '方向性图标',
    icons: [
      'ChevronLeft', 'ChevronRight', 'ChevronDown', 'ChevronUp',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'DoubleLeft', 'DoubleRight',
    ],
  },
  {
    title: '提示建议性',
    icons: [
      'CheckCircleOutline', 'CheckCircleFilled', 'CheckCircleTwoTone',
      'CloseCircleOutline', 'CloseCircleFilled', 'CloseCircleTwoTone',
      'WarningTriangleOutline', 'WarningTriangleFilled', 'WarningTriangleTwoTone',
      'InfoCircleOutline', 'InfoCircleFilled', 'InfoCircleTwoTone',
      'QuestionCircleOutline', 'QuestionCircleTwoTone',
    ],
  },
  {
    title: '编辑类',
    icons: [
      'Edit', 'Delete', 'Copy', 'Plus', 'Minus', 'Close',
      'Search', 'Filter', 'Refresh', 'Download',
      'Upload', 'CloudUpload', 'Uploading',
      'EyeOpen', 'EyeClosed',
    ],
  },
  {
    title: '数据类',
    icons: [
      'File', 'Folder', 'FolderOpen', 'PicturePlaceholder',
    ],
  },
  {
    title: '品牌和标识',
    icons: [
      'StarFilled', 'StarEmpty', 'StarHalf',
    ],
  },
  {
    title: '网站通用',
    icons: [
      'Home', 'User', 'Settings', 'Mail', 'Phone',
      'Calendar', 'Clock', 'Bell', 'BellOff',
      'Lock', 'Link', 'Menu',
      'MoreHorizontal', 'MoreVertical', 'CheckOutline',
      'Loading', 'SpinIcon',
    ],
  },
];

const styleOptions = [
  { label: '全部', value: 'all' },
  { label: '线框', value: 'outline' },
  { label: '实底', value: 'filled' },
  { label: '双色', value: 'twotone' },
];

function getStyleType(name: string): string {
  if (name.endsWith('TwoTone')) return 'twotone';
  if (name.endsWith('Filled') || name === 'StarFilled') return 'filled';
  if (name.endsWith('Outline')) return 'outline';
  return 'outline';
}



export default function IconList() {
  const [search, setSearch] = useState('');
  const [style, setStyle] = useState('all');
  const [copied, setCopied] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    return iconCategories
      .map((cat) => {
        const filtered = cat.icons.filter((name) => {
          const matchSearch =
            !search ||
            name.toLowerCase().includes(search.toLowerCase());
          const matchStyle =
            style === 'all' || getStyleType(name) === style;
          return matchSearch && matchStyle;
        });
        return { ...cat, icons: filtered };
      })
      .filter((cat) => cat.icons.length > 0);
  }, [search, style]);

  const handleCopy = (name: string) => {
    const code = `import { ${name} } from '@aura/icons';`;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(name);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const renderIcon = (name: string) => {
    const IconComp = (Icons as Record<string, React.ComponentType<{ size?: number }>>)[name];
    if (!IconComp) return null;
    return <IconComp size={24} />;
  };

  const totalCount = filteredCategories.reduce((sum, c) => sum + c.icons.length, 0);

  return (
    <div>
      <div className="aura-icon-toolbar">
        <Tabs activeKey={style} onChange={setStyle} variant="pill">
        {styleOptions.map((opt) => (
            <TabItem key={opt.value} tabKey={opt.value} title={opt.label} />
        ))}
        </Tabs>
        <div className="aura-icon-search-wrapper">
          <Input
            placeholder="在此搜索图标，点击图标可复制代码"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            size="sm"
            allowClear
          />
        </div>
      </div>

      {filteredCategories.map((cat) => (
        <div key={cat.title}>
          <div className="aura-icon-category-title">{cat.title}</div>
          <Flex wrap="wrap" gap={8}>
            {cat.icons.map((name) => (
              <div
                key={name}
                className="aura-icon-card"
                onClick={() => handleCopy(name)}
                title={`点击复制: import { ${name} } from '@aura/icons';`}
              >
                <span className={`copied-tip${copied === name ? ' show' : ''}`}>
                  已复制
                </span>
                {renderIcon(name)}
                <span className="icon-name">{name}</span>
              </div>
            ))}
          </Flex>
        </div>
      ))}

      {filteredCategories.length === 0 && (
        <div className="aura-icon-empty">未找到匹配的图标</div>
      )}
    </div>
  );
}
