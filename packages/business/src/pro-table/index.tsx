import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Card, Table } from 'antd';
import type { TableProps } from 'antd';
import { classNames, prefixCls } from '@aura/shared';
import { SearchForm } from '../search-form';
import type { SearchFormProps } from '../search-form';
import './index.less';

export interface ProTableParams {
  /** 当前页 */
  current: number;
  /** 每页条数 */
  pageSize: number;
  /** 查询表单收集的条件 */
  [key: string]: unknown;
}

export interface ProTableResult<T> {
  /** 当前页数据 */
  data: T[];
  /** 数据总数 */
  total: number;
  /** 是否成功（false 时不清空列表） */
  success?: boolean;
}

export interface ProTableProps<T extends Record<string, unknown>>
  extends Omit<
    TableProps<T>,
    'dataSource' | 'columns' | 'pagination' | 'loading' | 'title'
  > {
  /** 表格列定义 */
  columns: TableProps<T>['columns'];
  /** 数据请求函数，接收分页与查询条件 */
  request: (params: ProTableParams) => Promise<ProTableResult<T>>;
  /**
   * 查询表单配置，传 false 关闭查询区
   */
  search?: SearchFormProps | false;
  /** 卡片标题 */
  title?: React.ReactNode;
  /** 工具栏右侧内容 */
  toolbar?: React.ReactNode;
  /**
   * 每页条数
   * @default 10
   */
  defaultPageSize?: number;
  /** 请求失败回调 */
  onRequestError?: (error: unknown) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

function ProTableInner<T extends Record<string, unknown>>(
  props: ProTableProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const {
    columns,
    request,
    search,
    title,
    toolbar,
    defaultPageSize = 10,
    onRequestError,
    className,
    style,
    rowKey = 'id',
    ...restTableProps
  } = props;

  const prefix = prefixCls('pro-table');
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchValues, setSearchValues] = useState<Record<string, unknown>>({});

  // 用 ref 保存最新的 request / onRequestError，避免调用方每次渲染传入新函数导致重复请求
  const requestRef = useRef(request);
  requestRef.current = request;
  const onRequestErrorRef = useRef(onRequestError);
  onRequestErrorRef.current = onRequestError;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    requestRef
      .current({ current, pageSize, ...searchValues })
      .then((res) => {
        if (cancelled) return;
        if (res.success === false) return;
        setData(res.data);
        setTotal(res.total);
      })
      .catch((error: unknown) => {
        if (!cancelled) onRequestErrorRef.current?.(error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [current, pageSize, searchValues]);

  const handleSearch = (values: Record<string, unknown>) => {
    setSearchValues(values);
    setCurrent(1);
  };

  const handleReset = () => {
    setSearchValues({});
    setCurrent(1);
  };

  return (
    <div ref={ref} className={classNames(prefix, className)} style={style}>
      {search !== false && (
        <SearchForm
          {...(search || { fields: [] })}
          loading={loading}
          className={`${prefix}-search`}
          onSearch={handleSearch}
          onReset={handleReset}
        />
      )}

      <Card
        className={`${prefix}-card`}
        title={title}
        extra={toolbar}
        styles={{ body: { padding: 0 } }}
      >
        <Table<T>
          {...restTableProps}
          rowKey={rowKey}
          columns={columns}
          dataSource={data}
          loading={loading}
          className={`${prefix}-table`}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size);
            },
          }}
        />
      </Card>
    </div>
  );
}

export const ProTable = forwardRef(ProTableInner) as <
  T extends Record<string, unknown>,
>(
  props: ProTableProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
