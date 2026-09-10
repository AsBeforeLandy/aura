import React, { useState } from 'react';
import { Form, Modal } from 'antd';
import type { FormInstance } from 'antd';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface ModalFormProps {
  /** 是否打开弹窗 */
  open: boolean;
  /** 弹窗标题 */
  title?: React.ReactNode;
  /** 打开状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /**
   * 提交回调（经校验后触发）
   * 返回 Promise 时自动接管确定按钮的 loading
   */
  onFinish?: (values: Record<string, unknown>) => void | Promise<void>;
  /** 表单初始值 */
  initialValues?: Record<string, unknown>;
  /** 确定按钮文案 */
  okText?: React.ReactNode;
  /** 取消按钮文案 */
  cancelText?: React.ReactNode;
  /**
   * 弹窗宽度
   * @default 520
   */
  width?: number | string;
  /**
   * 关闭后是否重置表单
   * @default true
   */
  resetOnClose?: boolean;
  /**
   * 点击蒙层是否可关闭
   * @default false
   */
  maskClosable?: boolean;
  /** 外部受控的表单实例 */
  form?: FormInstance;
  /**
   * 关闭后是否销毁表单内容
   * @default true
   */
  destroyOnHidden?: boolean;
  children?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * ModalForm — 弹窗表单
 *
 * 将 antd 的 Modal 与 Form 组合，内置「校验 → 提交 → 关闭」流程：
 * 校验失败时保持弹窗打开；`onFinish` 返回 Promise 时自动接管确定按钮 loading。
 */
export const ModalForm: React.FC<ModalFormProps> = ({
  open,
  title,
  onOpenChange,
  onFinish,
  initialValues,
  okText = '确定',
  cancelText = '取消',
  width = 520,
  resetOnClose = true,
  maskClosable = false,
  form: formProp,
  destroyOnHidden = true,
  children,
  className,
  style,
}) => {
  const prefix = prefixCls('modal-form');
  const [innerForm] = Form.useForm();
  const form = formProp ?? innerForm;
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    let values: Record<string, unknown>;
    try {
      values = await form.validateFields();
    } catch {
      // 校验未通过，保持弹窗打开
      return;
    }
    try {
      setSubmitting(true);
      await onFinish?.(values);
      onOpenChange?.(false);
    } catch {
      // 提交失败保持打开，错误提示交由调用方处理
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange?.(false);
    if (resetOnClose) form.resetFields();
  };

  return (
    // antd v6：maskClosable 已废弃，改用 mask.closable
    <Modal
      open={open}
      title={title}
      width={width}
      mask={{ closable: maskClosable }}
      confirmLoading={submitting}
      okText={okText}
      cancelText={cancelText}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnHidden={destroyOnHidden}
      className={classNames(prefix, className)}
      style={style}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        className={`${prefix}-form`}
      >
        {children}
      </Form>
    </Modal>
  );
};

ModalForm.displayName = 'ModalForm';
