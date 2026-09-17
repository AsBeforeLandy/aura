// SSE（text/event-stream）字节流 → 消息对象的解析器。
//
// 纯函数、UI 无关：输入 ReadableStream，输出异步生成器，便于单测（可用
// ReadableStream 造任意帧序列）与复用（useXStream 之外的场景也能用）。

/** SSE 解析出的单条消息 */
export interface XStreamChunk {
  /** data 字段内容；多行 data 以 \n 拼接 */
  data: string;
  /** event 字段，缺省为 "message" */
  event: string;
  /** id 字段（可选） */
  id?: string;
}

/** 找到下一个帧分隔符（空行）的位置；分隔符兼容 \n\n 与 \r\n\r\n */
function findFrameEnd(buffer: string): number {
  const lf = buffer.indexOf('\n\n');
  const crlf = buffer.indexOf('\r\n\r\n');
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}

/** 分隔符长度取决于命中的是 LF 还是 CRLF 形式 */
function frameEndLength(buffer: string, index: number): number {
  return buffer.startsWith('\r\n\r\n', index) ? 4 : 2;
}

/** 解析单个 SSE 帧；无 data 内容的帧（注释 / 心跳）返回 null */
function parseFrame(frame: string): XStreamChunk | null {
  let event = 'message';
  let id: string | undefined;
  const dataLines: string[] = [];

  for (const rawLine of frame.split(/\r?\n/)) {
    // 空行与注释行（以冒号开头，如 ": ping"）按规范忽略
    if (!rawLine || rawLine.startsWith(':')) continue;

    const colon = rawLine.indexOf(':');
    const field = colon === -1 ? rawLine : rawLine.slice(0, colon);
    let value = colon === -1 ? '' : rawLine.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);

    if (field === 'data') dataLines.push(value);
    else if (field === 'event') event = value;
    else if (field === 'id') id = value;
    // retry 等其余字段第一版不消费
  }

  const data = dataLines.join('\n');
  if (!data) return null;
  return id !== undefined ? { data, event, id } : { data, event };
}

/**
 * 把字节流解析为 SSE 消息的异步生成器。
 *
 * 兼容性处理：BOM、CRLF / LF 混用、多行 data（以 \n 拼接）、注释行与心跳帧
 * （无 data，不产出消息）、流结束时未以空行收尾的最后一条帧（宽容产出）。
 *
 * `data: [DONE]` 等「结束哨兵」不做特殊处理，原样产出，由消费方过滤——
 * 解析器保持协议无关。
 */
export async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<XStreamChunk, void, unknown> {
  const decoder = new TextDecoder('utf-8');
  const reader = stream.getReader();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/^\uFEFF/, '');

      let index = findFrameEnd(buffer);
      while (index !== -1) {
        const frame = buffer.slice(0, index);
        buffer = buffer.slice(index + frameEndLength(buffer, index));

        const chunk = parseFrame(frame);
        if (chunk) yield chunk;

        index = findFrameEnd(buffer);
      }
    }

    // 流结束但缓冲区还有内容：宽容地把最后一条未以空行收尾的帧产出
    if (buffer.trim()) {
      const chunk = parseFrame(buffer);
      if (chunk) yield chunk;
    }
  } finally {
    reader.releaseLock();
  }
}
