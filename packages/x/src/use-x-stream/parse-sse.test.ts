import { describe, expect, it } from 'vitest';
import { parseSSEStream, type XStreamChunk } from './parse-sse';

/** 把文本转成字节流；strings 支持多段模拟分片到达 */
function byteStream(...strings: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const text of strings) controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<XStreamChunk[]> {
  const chunks: XStreamChunk[] = [];
  for await (const chunk of parseSSEStream(stream)) chunks.push(chunk);
  return chunks;
}

describe('parseSSEStream', () => {
  it('正常：解析单条 data 消息，event 缺省为 message', async () => {
    const chunks = await collect(byteStream('data: hello\n\n'));

    expect(chunks).toEqual([{ data: 'hello', event: 'message' }]);
  });

  it('正常：多帧按序产出，event / id 字段生效', async () => {
    const text = 'event: delta\ndata: 你好\nid: 1\n\ndata: 世界\nid: 2\n\n';
    const chunks = await collect(byteStream(text));

    expect(chunks).toEqual([
      { data: '你好', event: 'delta', id: '1' },
      { data: '世界', event: 'message', id: '2' },
    ]);
  });

  it('边界：多行 data 以 \\n 拼接为一条消息', async () => {
    const chunks = await collect(byteStream('data: first\ndata: second\n\n'));

    expect(chunks).toEqual([{ data: 'first\nsecond', event: 'message' }]);
  });

  it('边界：CRLF 分隔与无空格的 data: 均可解析', async () => {
    const chunks = await collect(byteStream('data:a\r\n\r\ndata:b\r\n\r\n'));

    expect(chunks).toEqual([
      { data: 'a', event: 'message' },
      { data: 'b', event: 'message' },
    ]);
  });

  it('异常：注释行与无 data 的心跳帧不产出消息', async () => {
    const text = ': ping\ndata: keep\n\n: keep-alive only\n\n';
    const chunks = await collect(byteStream(text));

    expect(chunks).toEqual([{ data: 'keep', event: 'message' }]);
  });

  it('边界：分片跨帧到达（一条消息被拆进两个 chunk）也能解析', async () => {
    const chunks = await collect(byteStream('data: hel', 'lo\n\ndata: wor', 'ld\n\n'));

    expect(chunks.map((c) => c.data)).toEqual(['hello', 'world']);
  });

  it('边界：流结束但最后一条帧未以空行收尾，宽容产出', async () => {
    const chunks = await collect(byteStream('data: tail'));

    expect(chunks).toEqual([{ data: 'tail', event: 'message' }]);
  });

  it('异常：[DONE] 哨兵原样透传，由消费方过滤（解析器保持协议无关）', async () => {
    const chunks = await collect(byteStream('data: part\n\ndata: [DONE]\n\n'));

    expect(chunks.map((c) => c.data)).toEqual(['part', '[DONE]']);
  });
});
