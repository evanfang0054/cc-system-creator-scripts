/**
 * 进度条工具
 *
 * 提供进度条功能:
 * - 单进度条
 * - 多进度条
 * - 批处理进度
 *
 * 自动适配 CI 环境
 */

// @ts-ignore - cli-progress 类型定义问题
import * as cliProgress from 'cli-progress';
import { isCI } from './utils.js';

/**
 * 单进度条类
 */
export class ProgressBar {
  private bar: cliProgress.SingleBar | null = null;

  /**
   * 创建进度条
   */
  start(total: number, message: string = '处理中'): void {
    // CI 环境不显示进度条
    if (isCI()) {
      console.log(`${message} (0/${total})`);
      return;
    }

    this.bar = new cliProgress.SingleBar({
      format: `${message} [{bar}] {percentage}% | {value}/{total}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    this.bar.start(total, 0);
  }

  /**
   * 更新进度
   */
  update(value: number): void {
    if (isCI()) {
      console.log(`进度: ${value}`);
      return;
    }

    this.bar?.update(value);
  }

  /**
   * 增加进度
   */
  increment(value: number = 1): void {
    if (isCI()) {
      console.log(`进度: +${value}`);
      return;
    }

    this.bar?.increment(value);
  }

  /**
   * 停止进度条
   */
  stop(): void {
    if (isCI()) {
      console.log('完成');
      return;
    }

    this.bar?.stop();
    this.bar = null;
  }
}

/**
 * 多进度条管理器
 */
export class MultiProgress {
  private bars: cliProgress.MultiBar | null = null;
  private streams: Map<string, cliProgress.SingleBar> = new Map();

  /**
   * 创建多进度条管理器
   */
  create(): void {
    if (isCI()) {
      return;
    }

    this.bars = new cliProgress.MultiBar({
      clearOnComplete: false,
      hideCursor: true,
    });
  }

  /**
   * 添加进度条
   */
  addBar(id: string, total: number, message: string): void {
    if (isCI()) {
      console.log(`${message} (0/${total})`);
      return;
    }

    if (!this.bars) {
      this.create();
    }

    const bar = this.bars!.create(total, 0, {
      message,
    });

    this.streams.set(id, bar);
  }

  /**
   * 更新进度条
   */
  updateBar(id: string, value: number): void {
    if (isCI()) {
      console.log(`${id}: ${value}`);
      return;
    }

    const bar = this.streams.get(id);
    if (bar) {
      bar.update(value);
    }
  }

  /**
   * 停止所有进度条
   */
  stopAll(): void {
    if (isCI()) {
      console.log('全部完成');
      return;
    }

    this.bars?.stop();
    this.streams.clear();
    this.bars = null;
  }
}

/**
 * 使用进度条处理数组
 *
 * @param items 要处理的数组
 * @param processor 处理函数
 * @param message 进度消息
 * @returns 处理结果数组
 */
export async function processArrayWithProgress<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  message: string = '处理中',
): Promise<R[]> {
  const results: R[] = [];
  const bar = new ProgressBar();

  bar.start(items.length, message);

  for (let i = 0; i < items.length; i++) {
    const result = await processor(items[i], i);
    results.push(result);
    bar.increment();
  }

  bar.stop();

  return results;
}

/**
 * 使用进度条处理批量操作
 *
 * @param total 总数
 * @param processor 处理函数 (接收当前进度)
 * @param message 进度消息
 */
export async function processWithProgress<T>(
  total: number,
  processor: (current: number) => Promise<T>,
  message: string = '处理中',
): Promise<T[]> {
  const results: T[] = [];
  const bar = new ProgressBar();

  bar.start(total, message);

  for (let i = 0; i < total; i++) {
    const result = await processor(i);
    results.push(result);
    bar.increment();
  }

  bar.stop();

  return results;
}

/**
 * 创建进度条 (工厂函数)
 */
export function createProgressBar(): ProgressBar {
  return new ProgressBar();
}

/**
 * 创建多进度条管理器 (工厂函数)
 */
export function createMultiProgress(): MultiProgress {
  return new MultiProgress();
}
