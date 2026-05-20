# Aura 语义化结构文档

## Button
DOM:
```html
<button class="aura-btn aura-btn-{variant} aura-btn-{size}[ aura-btn-loading]">
  [<span class="aura-btn-loading-icon"></span>]
  {children}
</button>
```
CSS 变体类: aura-btn-default, aura-btn-primary, aura-btn-dashed, aura-btn-text, aura-btn-link
CSS 尺寸类: aura-btn-sm, aura-btn-md, aura-btn-lg
CSS 状态类: aura-btn-loading, [disabled]

## Typography
### Title
DOM:
```html
<h{level} class="aura-typography-title aura-typography-title-{level}">
  {children}
</h{level}>
```
level=1..5

### Text
DOM:
```html
<span class="aura-typography-text[ aura-typography-text-{variant}][ aura-typography-text-strong]">
  {children}
</span>
```

### Paragraph
DOM:
```html
<p class="aura-typography-paragraph[ aura-typography-paragraph-ellipsis]">
  {children}
</p>
```

## Space
DOM:
```html
<div class="aura-space aura-space-{direction}" style="gap: {size}px; flex-wrap: {wrap}">
  <div class="aura-space-item">{child}</div>
  ...
</div>
```

## Divider
DOM:
```html
<div class="aura-divider aura-divider-{direction}[ aura-divider-{variant}][ aura-divider-with-text aura-divider-with-text-{orientation}]">
  {children && <span class="aura-divider-text">{children}</span>}
</div>
```

## Input
DOM:
```html
<div class="aura-input-wrapper aura-input-{variant} aura-input-{size}[ aura-input-disabled][ aura-input-status-{status}]">
  {prefix && <span class="aura-input-prefix">{prefix}</span>}
  <input class="aura-input" />
  {suffix && <span class="aura-input-suffix">{suffix}</span>}
  {allowClear && <span class="aura-input-clear"></span>}
</div>
```
### Input.Password
DOM 同 Input，额外包含可见切换按钮

### Input.Search
DOM 同 Input，额外包含搜索按钮

### Input.Group
DOM:
```html
<div class="aura-input-group[ aura-input-group-compact]">
  {children}
</div>
```

## Textarea
DOM:
```html
<div class="aura-textarea-wrapper aura-textarea-{variant} aura-textarea-{size}[ aura-textarea-status-{status}]">
  <textarea class="aura-textarea" />
  {showCount && <div class="aura-textarea-count">{count}/{maxLength}</div>}
</div>
```

## Select
DOM:
```html
<div class="aura-select aura-select-{variant} aura-select-{size}[ aura-select-disabled][ aura-select-open][ aura-select-multiple]">
  <div class="aura-select-selector">
    [<span class="aura-select-selection-item">{selectedLabel}</span>]
    [<input class="aura-select-search" />]
    <span class="aura-select-arrow"></span>
    {clearable && <span class="aura-select-clear"></span>}
  </div>
  <div class="aura-select-dropdown">
    {options.map(opt => <div class="aura-select-option[ aura-select-option-selected][ aura-select-option-disabled]">{opt.label}</div>)}
  </div>
</div>
```

## Checkbox
DOM:
```html
<label class="aura-checkbox aura-checkbox-{size}[ aura-checkbox-checked][ aura-checkbox-indeterminate][ aura-checkbox-disabled]">
  <input type="checkbox" class="aura-checkbox-input" />
  <span class="aura-checkbox-inner"></span>
  <span class="aura-checkbox-label">{children}</span>
</label>
```
### Checkbox.Group
DOM:
```html
<div class="aura-checkbox-group aura-checkbox-group-{direction}">
  {checkboxes}
</div>
```

## Radio
DOM:
```html
<label class="aura-radio aura-radio-{size}[ aura-radio-checked][ aura-radio-disabled]">
  <input type="radio" class="aura-radio-input" />
  <span class="aura-radio-inner"></span>
  <span class="aura-radio-label">{children}</span>
</label>
```
### Radio.Group
DOM:
```html
<div class="aura-radio-group aura-radio-group-{direction}">
  {radios}
</div>
```

## Switch
DOM:
```html
<button class="aura-switch aura-switch-{size}[ aura-switch-checked][ aura-switch-disabled][ aura-switch-loading]" role="switch">
  <span class="aura-switch-handle"></span>
  [<span class="aura-switch-inner">{checkedChildren / unCheckedChildren}</span>]
</button>
```

## Alert
DOM:
```html
<div class="aura-alert aura-alert-{variant}[ aura-alert-closable]" role="alert">
  {showIcon && <span class="aura-alert-icon">{icon}</span>}
  <div class="aura-alert-content">
    {title && <div class="aura-alert-title">{title}</div>}
    <div class="aura-alert-description">{children}</div>
  </div>
  {closable && <button class="aura-alert-close"></button>}
</div>
```

## Spin
DOM:
```html
<div class="aura-spin aura-spin-{size}[ aura-spin-spinning]">
  <div class="aura-spin-indicator">{indicator}</div>
  {tip && <div class="aura-spin-tip">{tip}</div>}
  {children && <div class="aura-spin-container[ aura-spin-blur]">{children}</div>}
</div>
```

## Tag
DOM:
```html
<span class="aura-tag aura-tag-{variant} aura-tag-{size}[ aura-tag-closable]">
  {children}
  {closable && <span class="aura-tag-close"></span>}
</span>
```
### Tag.Checkable
DOM:
```html
<span class="aura-tag-checkable[ aura-tag-checkable-checked]">
  {children}
</span>
```
### Tag.Group
DOM:
```html
<div class="aura-tag-group">
  {tagCheckables}
</div>
```

## Badge
DOM:
```html
<span class="aura-badge">
  {children}
  {dot ? <span class="aura-badge-dot aura-badge-dot-{variant}" /> : <span class="aura-badge-count aura-badge-count-{variant}">{count > overflowCount ? overflowCount+'+' : count}</span>}
</span>
```

## Avatar
DOM:
```html
<span class="aura-avatar aura-avatar-{size} aura-avatar-{shape}[ aura-avatar-{variant}][ aura-avatar-image]">
  {src ? <img src={src} alt={alt} /> : children || initial}
</span>
```
### Avatar.Group
DOM:
```html
<div class="aura-avatar-group">
  {avatars.slice(0, maxCount)}
  {overflow && <span class="aura-avatar aura-avatar-overflow">+{overflow}</span>}
</div>
```

## Tooltip
DOM:
```html
<div class="aura-tooltip-wrapper">
  {children}
</div>
<div class="aura-tooltip aura-tooltip-{placement}[ aura-tooltip-visible]">
  <div class="aura-tooltip-content">{content}</div>
  <div class="aura-tooltip-arrow"></div>
</div>
```

## Card
DOM:
```html
<div class="aura-card aura-card-{variant} aura-card-{size}[ aura-card-hoverable][ aura-card-loading]">
  {loading ? <skeleton /> : children}
</div>
```
### Card.Header
DOM: `<div class="aura-card-header">{children}</div>`
### Card.Title
DOM: `<div class="aura-card-title">{children}</div>`
### Card.Body
DOM: `<div class="aura-card-body">{children}</div>`
### Card.Actions
DOM: `<div class="aura-card-actions">{children}</div>`
### Card.Footer
DOM: `<div class="aura-card-footer">{children}</div>`
### Card.Cover
DOM: `<div class="aura-card-cover">{children}</div>`

## Collapse
DOM:
```html
<div class="aura-collapse">
  {items}
</div>
```
### Collapse.Item
DOM:
```html
<div class="aura-collapse-item[ aura-collapse-item-active][ aura-collapse-item-disabled]">
  <div class="aura-collapse-header" role="button" aria-expanded={isActive}>
    <span class="aura-collapse-header-text">{title}</span>
    <span class="aura-collapse-arrow[ aura-collapse-arrow-active]">▼</span>
  </div>
  <div class="aura-collapse-content[ aura-collapse-content-active]" style="maxHeight: ...">
    <div class="aura-collapse-content-inner">{children}</div>
  </div>
</div>
```

## Tabs
DOM:
```html
<div class="aura-tabs aura-tabs-{variant} aura-tabs-{size}">
  <div class="aura-tabs-nav" role="tablist">
    <button class="aura-tabs-tab[ aura-tabs-tab-active][ aura-tabs-tab-disabled]" role="tab" aria-selected={isActive}>
      {title}
    </button>
    ...
    {variant === 'default' && <span class="aura-tabs-indicator" style={indicatorStyle} />}
  </div>
  <div class="aura-tabs-content" role="tabpanel">
    <div class="aura-tabs-panel">{activeContent}</div>
  </div>
</div>
```

## Empty
DOM:
```html
<div class="aura-empty">
  <div class="aura-empty-image">{image || defaultSvg}</div>
  <div class="aura-empty-description">{description}</div>
  {children}
</div>
```

## Message
DOM（动态挂载到 body）:
```html
<div class="aura-message-container">
  <div class="aura-message aura-message-{variant}[ aura-message-entering][ aura-message-leaving]">
    <span class="aura-message-icon">{icon}</span>
    <span class="aura-message-content">{content}</span>
  </div>
</div>
```

## Notification
DOM（动态挂载到 body）:
```html
<div class="aura-notification-container aura-notification-{placement}">
  <div class="aura-notification aura-notification-{variant}[ aura-notification-entering][ aura-notification-leaving]">
    <span class="aura-notification-icon">{icon}</span>
    <div class="aura-notification-content">
      {title && <div class="aura-notification-title">{title}</div>}
      <div class="aura-notification-description">{content}</div>
    </div>
    <button class="aura-notification-close"></button>
  </div>
</div>
```

## Menu
DOM:
```html
<div class="aura-menu aura-menu-{mode}" role="menu" aria-orientation={orientation}>
  {children}
</div>
```
### Menu.Item
DOM:
```html
<div class="aura-menu-item[ aura-menu-item-selected][ aura-menu-item-disabled]" role="menuitem" aria-selected={isSelected}>
  {icon && <span class="aura-menu-item-icon">{icon}</span>}
  <span class="aura-menu-item-text">{children}</span>
</div>
```
### Menu.SubMenu
DOM:
```html
<div class="aura-menu-submenu[ aura-menu-submenu-open]">
  <div class="aura-menu-submenu-title" aria-expanded={open}>
    {icon && <span class="aura-menu-item-icon">{icon}</span>}
    <span class="aura-menu-item-text">{title}</span>
    <span class="aura-menu-submenu-arrow[ aura-menu-submenu-arrow-open]">▼</span>
  </div>
  <div class="aura-menu-submenu-content[ aura-menu-submenu-content-open]" style="maxHeight: ...">
    <div class="aura-menu-submenu-inner">{children}</div>
  </div>
</div>
```
### Menu.Group
DOM:
```html
<div class="aura-menu-group" role="group">
  {title && <div class="aura-menu-group-title">{title}</div>}
  {children}
</div>
```

## Breadcrumb
DOM:
```html
<nav class="aura-breadcrumb">
  <ol class="aura-breadcrumb-list">
    <li class="aura-breadcrumb-item-wrapper">
      <a class="aura-breadcrumb-item" href={href}>{children}</a>
      <span class="aura-breadcrumb-separator">{separator}</span>
    </li>
    ...
  </ol>
</nav>
```

## Pagination
DOM:
```html
<div class="aura-pagination aura-pagination-{size}">
  <button class="aura-pagination-prev[ aura-pagination-disabled]">‹</button>
  <button class="aura-pagination-item[ aura-pagination-item-active]">{page}</button>
  ...
  <button class="aura-pagination-next[ aura-pagination-disabled]">›</button>
  {showSizeChanger && <select class="aura-pagination-size-changer">...</select>}
  {showQuickJumper && <div class="aura-pagination-quick-jumper">跳至 <input /> 页</div>}
</div>
```

## Steps
DOM:
```html
<div class="aura-steps aura-steps-{variant} aura-steps-{size} aura-steps-{direction}">
  <div class="aura-step[ aura-step-finished|aura-step-active|aura-step-waiting]">
    <div class="aura-step-icon">{icon || number}</div>
    <div class="aura-step-content">
      <div class="aura-step-title">{title}</div>
      {description && <div class="aura-step-description">{description}</div>}
    </div>
  </div>
  ...
</div>
```

## Dropdown
DOM:
```html
<div class="aura-dropdown">
  {children}
</div>
<div class="aura-dropdown-menu aura-dropdown-{placement}[ aura-dropdown-visible]">
  {menu.map(item => <div class="aura-dropdown-menu-item[ aura-dropdown-menu-item-disabled][ aura-dropdown-menu-item-danger]">{item.label}</div>)}
</div>
```

## Slider
DOM:
```html
<div class="aura-slider[ aura-slider-disabled][ aura-slider-range]">
  <div class="aura-slider-track">
    <div class="aura-slider-fill" style="width: ..." />
    <div class="aura-slider-handle" style="left: ..." />
    [<div class="aura-slider-handle" style="left: ..." />]
  </div>
  {marks && <div class="aura-slider-marks">...</div>}
</div>
```

## Rate
DOM:
```html
<div class="aura-rate aura-rate-{size}[ aura-rate-disabled]">
  <span class="aura-rate-star[ aura-rate-star-full|aura-rate-star-half|aura-rate-star-zero]">★</span>
  ...
</div>
```

## Upload
DOM:
```html
<div class="aura-upload aura-upload-{listType}">
  <div class="aura-upload-trigger">
    {children || <button>点击上传</button>}
  </div>
  <div class="aura-upload-list">
    <div class="aura-upload-list-item aura-upload-list-item-{status}">
      <span class="aura-upload-list-item-name">{file.name}</span>
      <span class="aura-upload-list-item-actions">...</span>
    </div>
  </div>
</div>
```
### Upload.Dragger
DOM:
```html
<div class="aura-upload-dragger[ aura-upload-dragger-hover]">
  {children}
</div>
```

## Form
DOM:
```html
<form class="aura-form aura-form-{layout}" noValidate>
  {children}
</form>
```
### Form.Item
DOM:
```html
<div class="aura-form-item aura-form-item-{layout}[ aura-form-item-error][ aura-form-item-required]">
  {label && <label class="aura-form-item-label" htmlFor={name}>[*]{label}</label>}
  <div class="aura-form-item-control">
    <div class="aura-form-item-input">{children}</div>
    {errors && <div class="aura-form-item-errors" role="alert">
      <div class="aura-form-item-error-text">{error}</div>
    </div>}
  </div>
</div>
```

## Result
DOM:
```html
<div class="aura-result aura-result-{variant}">
  <div class="aura-result-icon">{icon}</div>
  <div class="aura-result-title">{title}</div>
  {subtitle && <div class="aura-result-subtitle">{subtitle}</div>}
  {extra && <div class="aura-result-extra">{extra}</div>}
</div>
```

## Popconfirm
DOM:
```html
<div class="aura-popconfirm-wrapper">{children}</div>
<div class="aura-popconfirm aura-popconfirm-{placement}[ aura-popconfirm-visible]">
  <div class="aura-popconfirm-content">
    <div class="aura-popconfirm-title">{title}</div>
    {description && <div class="aura-popconfirm-description">{description}</div>}
  </div>
  <div class="aura-popconfirm-buttons">
    <button class="aura-popconfirm-cancel">{cancelText}</button>
    <button class="aura-popconfirm-confirm aura-popconfirm-confirm-{variant}">{okText}</button>
  </div>
</div>
```

## Layout
DOM:
```html
<section class="aura-layout[ aura-layout-has-sider]" role="region">
  {children}
</section>
```
### Layout.Header
DOM: `<header class="aura-layout-header" role="banner">{children}</header>`
### Layout.Body
DOM: `<main class="aura-layout-body" role="main">{children}</main>`
### Layout.Sider
DOM:
```html
<aside class="aura-layout-sider[ aura-layout-sider-collapsed]" style="width: ...">
  <div class="aura-layout-sider-content">{children}</div>
  {collapsible && <div class="aura-layout-sider-trigger">...</div>}
</aside>
```
### Layout.Footer
DOM: `<footer class="aura-layout-footer">{children}</footer>`

## Flex
DOM:
```html
<div class="aura-flex" style="display: flex; flex-direction: {direction}; justify-content: {justify}; align-items: {align}; flex-wrap: {wrap}; gap: {gap}px;">
  {children}
</div>
```

## Scrollbar
DOM:
```html
<div class="aura-scrollbar[ aura-scrollbar-always]" style="max-height: ...">
  <div class="aura-scrollbar-content">
    {children}
  </div>
  <div class="aura-scrollbar-track">
    <div class="aura-scrollbar-thumb" style="height: ..." />
  </div>
</div>
```
