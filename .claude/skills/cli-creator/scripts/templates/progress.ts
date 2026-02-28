/**
 * 进度条工具
 *
 * 用于显示确定性的进度 (已知总数)
 * 适用于文件操作、下载、批处理等场景
 */

import cliProgress from 'cli-progress';
import { isCI } from './utils.js';

/**
 * 单进度条类
 */
export class ProgressBar {
  private bar: cliProgress.SingleBar;

  /**
   * 创建进度条
   *
   * @param total - 总数
   * @param message - 初始消息
   */
  constructor(total: number, message = '处理中') {
    // CI 环境下不显示进度条
    if (isCI()) {
      this.bar = null as any;
      return;
    }

    this.bar = new cliProgress.SingleBar({
      format: '{bar} | {percentage}% | {value}/{total} | {message}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    });

    this.bar.start(total, 0, { message });
  }

  /**
   * 更新进度
   *
   * @param current - 当前进度
   * @param message - 可选的新消息
   */
  update(current: number, message?: string): void {
    if (!this.bar) return;

    if (message !== undefined) {
      this.bar.update(current, { message });
    } else {
      this.bar.update(current);
    }
  }

  /**
   * 增加进度
   *
   * @param step - 增加的步数 (默认: 1)
   * @param message - 可选的新消息
   */
  increment(step = 1, message?: string): void {
    if (!this.bar) return;

    if (message !== undefined) {
      this.bar.increment(step, { message });
    } else {
      this.bar.increment(step);
    }
  }

  /**
   * 停止进度条
   */
  stop(): void {
    if (!this.bar) return;
    this.bar.stop();
  }

  /**
   * 完成进度条
   *
   * @param message - 完成消息
   */
  done(message = '完成'): void {
    if (!this.bar) {
      console.log(`✓ ${message}`);
      return;
    }

    this.bar.update(this.bar.getTotal(), { message });
    this.bar.stop();
  }

  /**
   * 失败
   *
   * @param message - 失败消息
   */
  fail(message = '失败'): void {
    if (!this.bar) {
      console.error(`✗ ${message}`);
      return;
    }

    this.bar.stop();
    console.error(`✗ ${message}`);
  }
}

/**
 * 多进度条类 (并行任务)
 */
export class MultiProgress {
  private multibar: cliProgress.MultiBar;

  /**
   * 创建多进度条管理器
   */
  constructor() {
    // CI 环境下不显示进度条
    if (isCI()) {
      this.multibar = null as any;
      return;
    }

    this.multibar = new cliProgress.MultiBar({
      format: '{bar} | {percentage}% | {task} | {value}/{total}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      clearOnComplete: false,
    });
  }

  /**
   * 创建新的进度条
   *
   * @param total - 总数
   * @param task - 任务名称
   * @returns 进度条对象
   */
  create(total: number, task: string): cliProgress.SingleBar {
    if (!this.multibar) {
      return null as any;
    }

    return this.multibar.create(total, 0, { task });
  }

  /**
   * 停止所有进度条
   */
  stop(): void {
    if (!this.multibar) return;
    this.multibar.stop();
  }
}

/**
 * 简化的进度条创建函数
 *
 * @param total - 总数
 * @param options - 选项
 * @returns 进度条对象
 */
export function createProgressBar(
  total: number,
  options?: {
    message?: string;
    format?: string;
  }
): ProgressBar {
  return new ProgressBar(total, options?.message);
}

/**
 * 简化的多进度条创建函数
 *
 * @returns 多进度条管理器
 */
export function createMultiProgress(): MultiProgress {
  return new MultiProgress();
}

/**
 * 进度条装饰器
 *
 * 用于异步函数的进度显示
 */
export function withProgress<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    total?: number;
    message?: string;
  }
): T {
  return (async (...args: any[]) => {
    const progressBar = new ProgressBar(options?.total || 100, options?.message);

    try {
      const result = await fn(...args);
      progressBar.done();
      return result;
    } catch (error) {
      progressBar.fail();
      throw error;
    }
  }) as T;
}

/**
 * 批处理进度条
 *
 * 用于处理数组时显示进度
 */
export async function processArrayWithProgress<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options?: {
    message?: string;
    chunkSize?: number;
  }
): Promise<R[]> {
  const total = items.length;
  const bar = new ProgressBar(total, options?.message || '处理中');
  const results: R[] = [];

  for (let i = 0; i < items.length; i++) {
    const result = await processor(items[i], i);
    results.push(result);
    bar.increment();
  }

  bar.done();
  return results;
}

/**
 * 文件操作进度条
 *
 * 专门用于文件复制、移动等操作
 */
export class FileProgress {
  private bar: ProgressBar;

  constructor(fileCount: number) {
    this.bar = new ProgressBar(fileCount, '处理文件');
  }

  /**
   * 更新文件处理进度
   *
   * @param fileName - 当前处理的文件名
   */
  updateFile(fileName: string): void {
    this.bar.increment(null, fileName);
  }

  /**
   * 完成
   */
  done(): void {
    this.bar.done('文件处理完成');
  }

  /**
   * 失败
   */
  fail(fileName: string): void {
    this.bar.fail(`处理文件失败: ${fileName}`);
  }
}

/**
 * 下载进度条
 *
 * 专门用于下载操作的进度显示
 */
export class DownloadProgress {
  private bar: ProgressBar;
  private startTime: number;

  constructor(totalBytes: number) {
    this.bar = new ProgressBar(totalBytes, '下载中');
    this.startTime = Date.now();
  }

  /**
   * 更新下载进度
   *
   * @param downloadedBytes - 已下载字节数
   */
  update(downloadedBytes: number): void {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const speed = Math.floor(downloadedBytes / elapsed);
    const speedStr = formatBytes(speed) + '/s';

    this.bar.update(downloadedBytes, {
      message: `下载中 (${speedStr})`,
    });
  }

  /**
   * 完成
   */
  done(): void {
    const elapsed = (Date.now() - this.startTime) / 1000;
    this.bar.done(`下载完成 (${elapsed.toFixed(1)}s)`);
  }

  /**
   * 失败
   */
  fail(): void {
    this.bar.fail('下载失败');
  }
}

/**
 * 格式化字节数
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
