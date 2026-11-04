import { describe, it, expect } from 'vitest';
import { buildExtensions } from './extensions';
import { resolveFeatures, type EditorFeatures } from './types';

/**
 * 展开组合扩展（StarterKit / TableKit 是「打包」扩展，
 * 自身的 name 只是 starterKit，真正的能力在 addExtensions() 里）。
 */
function flatten(list: ReturnType<typeof buildExtensions>): string[] {
  return list.flatMap((extension) => {
    // addExtensions 依赖实例上下文（内部读 this.options），必须绑定后调用
    const factory = extension.config.addExtensions as unknown as
      ((this: unknown) => ReturnType<typeof buildExtensions>) | undefined;
    const nested = typeof factory === 'function' ? factory.call(extension) : [];
    return [extension.name, ...flatten(nested)];
  });
}

function names(features: EditorFeatures = {}): string[] {
  return flatten(buildExtensions({ features: resolveFeatures(features) }));
}

describe('buildExtensions', () => {
  it('默认注册全部核心扩展', () => {
    const list = names();
    [
      'bold',
      'italic',
      'underline',
      'strike',
      'code',
      'highlight',
      'link',
      'image',
      'table',
      'taskList',
      'textAlign',
      'characterCount',
      'codeBlock',
      'placeholder',
    ].forEach((name) => expect(list).toContain(name));
  });

  // 关键约定：关闭功能必须**注销扩展**，否则快捷键与粘贴仍能触发该格式
  it('关闭的功能不再注册对应扩展', () => {
    const list = names({
      bold: false,
      table: false,
      highlight: false,
      image: false,
      taskList: false,
    });
    expect(list).not.toContain('bold');
    expect(list).not.toContain('table');
    expect(list).not.toContain('highlight');
    expect(list).not.toContain('image');
    expect(list).not.toContain('taskList');
  });

  it('关闭代码块时不注册 lowlight 版本', () => {
    expect(names({ codeBlock: false })).not.toContain('codeBlock');
  });

  it('关闭颜色 / 字号时不注册 textStyle（它们是 textStyle 的挂载点）', () => {
    const list = names({ color: false, fontSize: false, highlight: false });
    expect(list).not.toContain('textStyle');
  });

  // 边界：只保留颜色时仍需 textStyle
  it('仅开启颜色时保留 textStyle', () => {
    const list = names({ fontSize: false, highlight: false });
    expect(list).toContain('textStyle');
    expect(list).toContain('color');
  });

  it('自定义占位文案被写入配置', () => {
    const extensions = buildExtensions({
      features: resolveFeatures(),
      placeholder: '写点什么',
    });
    const placeholder = extensions.find(
      (extension) => extension.name === 'placeholder',
    );
    expect(placeholder).toBeTruthy();
    expect(JSON.stringify(placeholder?.options)).toContain('写点什么');
  });

  // 异常：全关时仍能构建出可用的最小集合（文档 + 段落 + 占位）
  it('全部功能关闭时仍返回可用扩展集合', () => {
    const allOff: EditorFeatures = {
      heading: false,
      bold: false,
      italic: false,
      underline: false,
      strike: false,
      inlineCode: false,
      highlight: false,
      color: false,
      fontSize: false,
      subscript: false,
      superscript: false,
      bulletList: false,
      orderedList: false,
      taskList: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      align: false,
      link: false,
      table: false,
      undoRedo: false,
      characterCount: false,
      image: false,
    };
    const list = buildExtensions({ features: resolveFeatures(allOff) });
    expect(list.length).toBeGreaterThan(0);
    expect(flatten(list)).toContain('paragraph');
  });
});
