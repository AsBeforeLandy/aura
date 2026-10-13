import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AnimatePresence } from 'motion/react';
import { Keyframes, KEYFRAMES_ALLOWED_PROPS } from './keyframes';
import { Slide, Fade, Zoom, Collapse } from './transition';
import { SplitText } from './split-text';
import { NumberTicker } from './number-ticker';
import { Typewriter } from './typewriter';

describe('进出场四件套', () => {
  it('渲染 children 且暴露意图状态机', () => {
    const { rerender } = render(
      <Slide visible={false} direction="up">
        内容
      </Slide>,
    );
    const el = screen.getByText('内容');
    expect(el.getAttribute('data-motion-state')).toBe('exited');

    rerender(
      <Slide visible direction="up">
        内容
      </Slide>,
    );
    expect(el.getAttribute('data-motion-state')).toBe('entered');
  });

  it('Fade / Zoom 同样暴露意图状态机', () => {
    const { unmount } = render(<Fade visible>内容</Fade>);
    expect(screen.getByText('内容').getAttribute('data-motion-state')).toBe('entered');
    unmount();

    render(<Zoom visible={false}>卡片</Zoom>);
    expect(screen.getByText('卡片').getAttribute('data-motion-state')).toBe('exited');
  });

  it('卸载式：配合 AnimatePresence 挂载/卸载', async () => {
    const { queryByText, rerender } = render(
      <AnimatePresence>
        {true && (
          <Slide key="s" direction="left">
            弹层
          </Slide>
        )}
      </AnimatePresence>,
    );
    expect(queryByText('弹层')).not.toBeNull();

    rerender(
      <AnimatePresence>
        {false && (
          <Slide key="s" direction="left">
            弹层
          </Slide>
        )}
      </AnimatePresence>,
    );
    // 退场动画完成（motion 经 rAF 驱动）后 AnimatePresence 才移除 DOM
    await waitFor(() => expect(queryByText('弹层')).toBeNull());
  });

  it('Collapse：open=false 时也渲染（高度 0 由动画控制）', () => {
    render(
      <Collapse open={false}>
        <div>折叠内容</div>
      </Collapse>,
    );
    expect(screen.getByText('折叠内容')).toBeTruthy();
  });
});

describe('SplitText', () => {
  it('按字拆分：每个字符一个 span，容器带 aria-label', () => {
    render(<SplitText text="Aura" granularity="char" />);
    expect(screen.getByLabelText('Aura')).toBeTruthy();
  });

  it('默认行为：char 拆分产生 4 个片段', () => {
    const { container } = render(<SplitText text="Aura" granularity="char" />);
    const pieces = container.querySelectorAll('span[aria-hidden]');
    expect(pieces.length).toBe(4);
  });

  it('word 粒度按空白分词', () => {
    const { container } = render(<SplitText text="Hello Aura Motion" granularity="word" />);
    const pieces = container.querySelectorAll('span[aria-hidden]');
    expect(pieces.length).toBe(3);
  });
});

describe('NumberTicker / Typewriter', () => {
  it('NumberTicker 渲染格式化后的值', () => {
    render(<NumberTicker value={128940} />);
    expect(screen.getByText('128,940')).toBeTruthy();
  });

  it('NumberTicker 尊重自定义 format', () => {
    render(<NumberTicker value={0.85} format={(n) => `${Math.round(n * 100)}%`} />);
    expect(screen.getByText('85%')).toBeTruthy();
  });

  it('Typewriter 初始输出为空（逐字进行中）', () => {
    render(<Typewriter text="你好" caret={false} />);
    expect(screen.getByText('', { selector: 'span > span' })).toBeTruthy();
  });
});

describe('Keyframes 白名单', () => {
  it('开发环境对非合成器友好属性告警', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Keyframes animate={{ width: [0, 100] }} repeat={Infinity} data-testid="kf" />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('width'));
    warn.mockRestore();
  });

  it('白名单属性不告警', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Keyframes
        animate={{ scale: [1, 1.08, 1], opacity: [1, 0.6, 1] }}
        data-testid="kf-ok"
      />,
    );
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('导出的白名单集合覆盖九个合成器友好属性', () => {
    expect(KEYFRAMES_ALLOWED_PROPS.has('transform')).toBe(false);
    expect(KEYFRAMES_ALLOWED_PROPS.has('opacity')).toBe(true);
    expect(KEYFRAMES_ALLOWED_PROPS.has('scale')).toBe(true);
    expect(KEYFRAMES_ALLOWED_PROPS.size).toBe(9);
  });
});
