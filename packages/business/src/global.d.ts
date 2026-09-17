declare module '*.css';
declare module '*.less';

/**
 * pdf.js 的 worker 模块未随包提供独立类型声明（类型只暴露在主入口）。
 *
 * 本项目只在主线程模式下把该模块整体挂到 `globalThis.pdfjsWorker`，
 * 由 pdf.js 自行读取其中的 `WorkerMessageHandler`，因此此处声明为宽类型即可。
 */
declare module 'pdfjs-dist/build/pdf.worker.min.mjs' {
  export const WorkerMessageHandler: unknown;
}
