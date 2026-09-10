import React, { useMemo, useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from 'antd';
import type { FormInstance } from 'antd';
import {
  DownOutlined,
  ReloadOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

const { RangePicker } = DatePicker;

export type SearchFieldType =
  | 'input'
  | 'select'
  | 'number'
  | 'date'
  | 'dateRange'
  | 'custom';

export interface SearchFieldOption {
  label: React.ReactNode;
  value: string | number | boolean;
}

export interface SearchField {
  /** 字段名（对应表单值 key） */
  name: string;
  /** 字段标签 */
  label: React.ReactNode;
  /** 控件类型 */
  type: SearchFieldType;
  /** select 的选项 */
  options?: SearchFieldOption[];
  /** 占位符（dateRange 请在 fieldProps 中传 [string, string]） */
  placeholder?: string;
  /**
   * 栅格占比（24 栅格制）
   * @default 8
   */
  span?: number;
  /** 透传给控件的额外属性（类型交由使用者保证，与 antd 生态惯例一致） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fieldProps?: Record<string, any>;
  /** type 为 custom 时的自定义渲染 */
  render?: () => React.ReactNode;
}

export interface SearchFormProps {
  /** 查询字段配置 */
  fields: SearchField[];
  /** 提交按钮 loading */
  loading?: boolean;
  /** 点击查询回调 */
  onSearch?: (values: Record<string, unknown>) => void;
  /** 点击重置回调 */
  onReset?: () => void;
  /**
   * 是否默认折叠
   * @default true
   */
  defaultCollapsed?: boolean;
  /**
   * 超过多少个字段后启用折叠
   * @default 3
   */
  collapseAfter?: number;
  /** 查询按钮文案 */
  submitText?: React.ReactNode;
  /** 重置按钮文案 */
  resetText?: React.ReactNode;
  /** 表单初始值 */
  initialValues?: Record<string, unknown>;
  /** 外部受控的表单实例 */
  form?: FormInstance;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * SearchForm — 查询表单
 *
 * 中后台列表页的高级查询区：按配置生成字段、自动栅格布局、支持折叠展开。
 * 查询与重置按钮内置，值经 antd Form 校验后回调。
 */
export const SearchForm: React.FC<SearchFormProps> = ({
  fields,
  loading = false,
  onSearch,
  onReset,
  defaultCollapsed = true,
  collapseAfter = 3,
  submitText = '查询',
  resetText = '重置',
  initialValues,
  form: formProp,
  className,
  style,
}) => {
  const prefix = prefixCls('search-form');
  const [innerForm] = Form.useForm();
  const form = formProp ?? innerForm;
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const collapsible = fields.length > collapseAfter;
  const visibleFields = useMemo(
    () => (collapsed && collapsible ? fields.slice(0, collapseAfter) : fields),
    [collapsed, collapsible, fields, collapseAfter],
  );

  const handleFinish = (values: Record<string, unknown>) => {
    onSearch?.(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  const renderControl = (field: SearchField): React.ReactNode => {
    if (field.type === 'custom') {
      return field.render?.();
    }
    const { placeholder, options, fieldProps } = field;
    switch (field.type) {
      case 'select':
        return (
          <Select
            allowClear
            options={options}
            placeholder={placeholder}
            {...fieldProps}
          />
        );
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            placeholder={placeholder}
            {...fieldProps}
          />
        );
      case 'date':
        return (
          <DatePicker
            style={{ width: '100%' }}
            placeholder={placeholder}
            {...fieldProps}
          />
        );
      case 'dateRange':
        // RangePicker 的 placeholder 需为 [string, string]，由 fieldProps 传入
        return <RangePicker style={{ width: '100%' }} {...fieldProps} />;
      case 'input':
      default:
        return <Input allowClear placeholder={placeholder} {...fieldProps} />;
    }
  };

  return (
    <Form
      form={form}
      className={classNames(prefix, className)}
      style={style}
      initialValues={initialValues}
      onFinish={handleFinish}
      labelCol={{ flex: '0 0 auto' }}
      wrapperCol={{ flex: '1 1 auto' }}
    >
      <Row gutter={[16, 0]} align="middle">
        {visibleFields.map((field) => (
          <Col key={field.name} xs={24} sm={12} md={field.span ?? 8}>
            <Form.Item
              name={field.name}
              label={field.label}
              className={`${prefix}-field`}
            >
              {renderControl(field)}
            </Form.Item>
          </Col>
        ))}

        <Col flex="auto" className={`${prefix}-actions`}>
          <Space size="small">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SearchOutlined />}
            >
              {submitText}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              {resetText}
            </Button>
            {collapsible && (
              <Button
                type="link"
                onClick={() => setCollapsed((prev) => !prev)}
                icon={collapsed ? <DownOutlined /> : <UpOutlined />}
                iconPlacement="end"
              >
                {collapsed ? '展开' : '收起'}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </Form>
  );
};

SearchForm.displayName = 'SearchForm';
