import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Steps } from './index';

const StepsDemo = Steps as unknown as React.FC<any> & {
  Step: typeof Steps.Step;
};

describe('Steps', () => {
  // ===== 基础渲染 =====
  it('应该正确渲染 Steps 和 Steps.Step', () => {
    render(
      <StepsDemo current={0}>
        <StepsDemo.Step title="步骤一" />
        <StepsDemo.Step title="步骤二" />
        <StepsDemo.Step title="步骤三" />
      </StepsDemo>,
    );
    expect(screen.getByText('步骤一')).toBeDefined();
    expect(screen.getByText('步骤二')).toBeDefined();
    expect(screen.getByText('步骤三')).toBeDefined();
  });

  it('应该应用自定义 className 和 style', () => {
    const { container } = render(
      <StepsDemo className="custom-steps" style={{ maxWidth: 600 }}>
        <StepsDemo.Step title="步骤一" />
      </StepsDemo>,
    );
    const steps = container.firstChild as HTMLElement;
    expect(steps.classList.contains('custom-steps')).toBe(true);
    expect((steps as HTMLElement).style.maxWidth).toBe('600px');
  });

  it('应该渲染正确的变体 className', () => {
    const { container } = render(
      <StepsDemo variant="dot">
        <StepsDemo.Step title="步骤一" />
      </StepsDemo>,
    );
    const steps = container.firstChild as HTMLElement;
    expect(steps.classList.contains('aura-steps-dot')).toBe(true);
  });

  it('应该渲染正确的方向 className', () => {
    const { container } = render(
      <StepsDemo direction="vertical">
        <StepsDemo.Step title="步骤一" />
      </StepsDemo>,
    );
    const steps = container.firstChild as HTMLElement;
    expect(steps.classList.contains('aura-steps-vertical')).toBe(true);
  });

  it('应该渲染正确的尺寸 className', () => {
    const { container } = render(
      <StepsDemo size="sm">
        <StepsDemo.Step title="步骤一" />
      </StepsDemo>,
    );
    const steps = container.firstChild as HTMLElement;
    expect(steps.classList.contains('aura-steps-sm')).toBe(true);
  });

  // ===== 当前步骤高亮 =====
  it('当前步骤应该有 active 样式', () => {
    const { container } = render(
      <StepsDemo current={1}>
        <StepsDemo.Step title="步骤一" />
        <StepsDemo.Step title="步骤二" />
        <StepsDemo.Step title="步骤三" />
      </StepsDemo>,
    );
    const stepElements = container.querySelectorAll('.aura-steps-step');
    expect(stepElements[0].classList.contains('aura-steps-step-completed')).toBe(true);
    expect(stepElements[1].classList.contains('aura-steps-step-active')).toBe(true);
    expect(stepElements[2].classList.contains('aura-steps-step-active')).toBe(false);
    expect(stepElements[2].classList.contains('aura-steps-step-completed')).toBe(false);
  });

  // ===== 描述 =====
  it('应该渲染步骤描述', () => {
    render(
      <StepsDemo current={0}>
        <StepsDemo.Step title="步骤一" description="这是步骤一的描述" />
      </StepsDemo>,
    );
    expect(screen.getByText('这是步骤一的描述')).toBeDefined();
  });

  // ===== 点击切换 =====
  it('点击步骤应该触发 onChange', () => {
    const onChange = vi.fn();
    render(
      <StepsDemo current={0} onChange={onChange}>
        <StepsDemo.Step title="步骤一" />
        <StepsDemo.Step title="步骤二" />
        <StepsDemo.Step title="步骤三" />
      </StepsDemo>,
    );
    fireEvent.click(screen.getByText('步骤二'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  // ===== 禁用步骤 =====
  it('禁用步骤不可点击', () => {
    const onChange = vi.fn();
    render(
      <StepsDemo current={0} onChange={onChange}>
        <StepsDemo.Step title="步骤一" />
        <StepsDemo.Step title="步骤二" disabled />
      </StepsDemo>,
    );
    fireEvent.click(screen.getByText('步骤二'));
    expect(onChange).not.toHaveBeenCalled();
  });

  // ===== 连接线 =====
  it('应该渲染连接线', () => {
    const { container } = render(
      <StepsDemo current={0}>
        <StepsDemo.Step title="步骤一" />
        <StepsDemo.Step title="步骤二" />
        <StepsDemo.Step title="步骤三" />
      </StepsDemo>,
    );
    const tails = container.querySelectorAll('.aura-steps-tail');
    expect(tails.length).toBe(2);
  });

  it('已完成的步骤连接线应该有 completed 样式', () => {
    const { container } = render(
      <StepsDemo current={1}>
        <StepsDemo.Step title="步骤一" />
        <StepsDemo.Step title="步骤二" />
        <StepsDemo.Step title="步骤三" />
      </StepsDemo>,
    );
    const tails = container.querySelectorAll('.aura-steps-tail');
    expect(tails[0].classList.contains('aura-steps-tail-completed')).toBe(true);
    expect(tails[1].classList.contains('aura-steps-tail-pending')).toBe(true);
  });

  // ===== Dot 变体 =====
  it('dot 变体应该渲染圆点', () => {
    const { container } = render(
      <StepsDemo variant="dot" current={0}>
        <StepsDemo.Step title="步骤一" />
        <StepsDemo.Step title="步骤二" />
      </StepsDemo>,
    );
    const dots = container.querySelectorAll('.aura-steps-dot-icon');
    expect(dots.length).toBe(2);
  });

  // ===== Navigation 变体 =====
  it('navigation 变体应该渲染', () => {
    const { container } = render(
      <StepsDemo variant="navigation" current={0}>
        <StepsDemo.Step title="步骤一" />
        <StepsDemo.Step title="步骤二" />
      </StepsDemo>,
    );
    const steps = container.firstChild as HTMLElement;
    expect(steps.classList.contains('aura-steps-navigation')).toBe(true);
  });

  // ===== forwardRef =====
  it('应该支持 forwardRef', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <StepsDemo ref={ref}>
        <StepsDemo.Step title="步骤一" />
      </StepsDemo>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-steps')).toBe(true);
  });

  // ===== displayName =====
  it('应该有正确的 displayName', () => {
    expect(Steps.displayName).toBe('Steps');
    expect(Steps.Step.displayName).toBe('Steps.Step');
  });

  // ===== aria 属性 =====
  it('应该有正确的 aria 属性', () => {
    const { container } = render(
      <StepsDemo current={0}>
        <StepsDemo.Step title="步骤一" />
        <StepsDemo.Step title="步骤二" />
      </StepsDemo>,
    );
    const steps = container.firstChild as HTMLElement;
    expect(steps.getAttribute('role')).toBe('list');

    const stepElements = container.querySelectorAll('.aura-steps-step');
    expect(stepElements[0].getAttribute('role')).toBe('listitem');
    expect(stepElements[0].getAttribute('aria-current')).toBe('step');
    expect(stepElements[1].getAttribute('aria-current')).toBeNull();
  });

  it('禁用步骤应该有 aria-disabled', () => {
    const { container } = render(
      <StepsDemo current={0}>
        <StepsDemo.Step title="步骤一" />
        <StepsDemo.Step title="步骤二" disabled />
      </StepsDemo>,
    );
    const stepElements = container.querySelectorAll('.aura-steps-step');
    const header = stepElements[1].querySelector('.aura-steps-step-header');
    expect(header?.getAttribute('aria-disabled')).toBe('true');
  });

  // ===== status="error" =====
  it('status="error" 应渲染出错态样式', () => {
    const { container } = render(
      <StepsDemo current={1}>
        <StepsDemo.Step title="填写信息" />
        <StepsDemo.Step title="支付订单" status="error" />
        <StepsDemo.Step title="完成" />
      </StepsDemo>,
    );
    const errorStep = container.querySelectorAll('.aura-steps-step')[1];
    expect(errorStep.classList.contains('aura-steps-step-error')).toBe(true);
  });

  // ===== subTitle =====
  it('subTitle 应渲染在标题旁', () => {
    const { container, getByText } = render(
      <StepsDemo current={0}>
        <StepsDemo.Step title="支付订单" subTitle="副标题信息" />
      </StepsDemo>,
    );
    expect(getByText('副标题信息')).toBeDefined();
    expect(container.querySelector('.aura-steps-step-subtitle')).not.toBeNull();
  });

  // ===== defaultCurrent =====
  it('defaultCurrent 应支持非受控当前步', () => {
    const onChange = vi.fn();
    const { container } = render(
      <StepsDemo defaultCurrent={0} onChange={onChange}>
        <StepsDemo.Step title="一" />
        <StepsDemo.Step title="二" />
      </StepsDemo>,
    );
    const steps = container.querySelectorAll('.aura-steps-step');

    fireEvent.click(steps[1].querySelector('.aura-steps-step-header')!);
    expect(onChange).toHaveBeenCalledWith(1);
    // 非受控：组件自行前进
    expect(steps[1].classList.contains('aura-steps-step-active')).toBe(true);

    // 受控属性传入后接管
    const { container: container2 } = render(
      <StepsDemo current={0} onChange={onChange}>
        <StepsDemo.Step title="一" />
        <StepsDemo.Step title="二" />
      </StepsDemo>,
    );
    const steps2 = container2.querySelectorAll('.aura-steps-step');
    fireEvent.click(steps2[1].querySelector('.aura-steps-step-header')!);
    expect(steps2[1].classList.contains('aura-steps-step-active')).toBe(false);
  });
});
