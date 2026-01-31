/**
 * 并发处理工具
 *
 * 提供并发限制的处理功能:
 * - 限制并发数量
 * - 批量处理
 * - 进度跟踪
 */

import pLimit from 'p-limit';
import { ProgressBar } from './progress.js';

/**
 * 并发处理选项
 */
export interface ConcurrentOptions {
  concurrency?: number;
  progressMessage?: string;
}

/**
 * 使用并发限制处理数组
 *
 * @param items 要处理的数组
 * @param processor 处理函数
 * @param options 选项
 * @returns 处理结果数组
 */
export async function processConcurrently<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: ConcurrentOptions = {},
): Promise<R[]> {
  const { concurrency = 3, progressMessage } = options;

  // 创建并发限制器
  const limit = pLimit(concurrency);

  // 创建进度条
  const bar = progressMessage ? new ProgressBar() : null;
  if (bar) {
    bar.start(items.length, progressMessage);
  }

  // 并发处理所有项目
  const tasks = items.map((item, index) =>
    limit(async () => {
      const result = await processor(item, index);
      if (bar) {
        bar.increment();
      }
      return result;
    }),
  );

  const results = await Promise.all(tasks);

  if (bar) {
    bar.stop();
  }

  return results;
}

/**
 * 批量处理 (分组处理)
 *
 * @param items 要处理的数组
 * @param processor 处理函数 (接收一批项目)
 * @param batchSize 批次大小
 * @returns 处理结果数组
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (batch: T[], batchIndex: number) => Promise<R[]>,
  batchSize: number = 10,
): Promise<R[]> {
  const results: R[] = [];
  const totalBatches = Math.ceil(items.length / batchSize);

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchIndex = Math.floor(i / batchSize);

    const batchResults = await processor(batch, batchIndex);
    results.push(...batchResults);
  }

  return results;
}

/**
 * 并发批量处理
 *
 * @param items 要处理的数组
 * @param processor 处理函数
 * @param options 选项
 * @returns 处理结果数组
 */
export async function processBatchConcurrently<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: ConcurrentOptions = {},
): Promise<R[]> {
  const { concurrency = 3 } = options;

  // 分批
  const batchSize = concurrency * 2; // 每批处理 concurrency * 2 个
  const batches: T[][] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  // 并发处理每批
  const batchResults = await processConcurrently(
    batches,
    async (batch, batchIndex) => {
      // 在批次内顺序处理
      const results: R[] = [];
      for (let i = 0; i < batch.length; i++) {
        const result = await processor(
          batch[i],
          batchIndex * batchSize + i,
        );
        results.push(result);
      }
      return results;
    },
    { concurrency: 1 }, // 批次间并发为 1,批次内并发由 processor 控制
  );

  // 展平结果
  return batchResults.flat();
}

/**
 * 使用映射的并发处理
 *
 * @param items 要处理的数组
 * @param processor 处理函数
 * @param options 选项
 * @returns 处理结果 Map
 */
export async function processConcurrentlyMap<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: ConcurrentOptions = {},
): Promise<Map<T, R>> {
  const results = await processConcurrently(items, processor, options);

  const map = new Map<T, R>();
  items.forEach((item, index) => {
    map.set(item, results[index]);
  });

  return map;
}

/**
 * 并发处理 (带错误收集)
 *
 * @param items 要处理的数组
 * @param processor 处理函数
 * @param options 选项
 * @returns 处理结果和错误
 */
export async function processConcurrentlyWithErrors<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: ConcurrentOptions = {},
): Promise<{
  results: Array<R>;
  errors: Array<{ item: T; error: unknown }>;
}> {
  const { concurrency = 3, progressMessage } = options;

  const limit = pLimit(concurrency);
  const results: Array<R> = new Array(items.length);
  const errors: Array<{ item: T; error: unknown }> = [];

  const bar = progressMessage ? new ProgressBar() : null;
  if (bar) {
    bar.start(items.length, progressMessage);
  }

  const tasks = items.map((item, index) =>
    limit(async () => {
      try {
        const result = await processor(item, index);
        results[index] = result;
      } catch (error) {
        errors.push({ item, error });
      } finally {
        if (bar) {
          bar.increment();
        }
      }
    }),
  );

  await Promise.all(tasks);

  if (bar) {
    bar.stop();
  }

  return { results, errors };
}

/**
 * 创建并发池
 */
export class ConcurrentPool<T, R> {
  private limit: ReturnType<typeof pLimit>;
  private bar: ProgressBar | null = null;

  constructor(concurrency: number = 3, progressMessage?: string) {
    this.limit = pLimit(concurrency);

    if (progressMessage) {
      this.bar = new ProgressBar();
    }
  }

  /**
   * 添加任务
   */
  add(item: T, processor: (item: T) => Promise<R>): Promise<R> {
    return this.limit(async () => {
      const result = await processor(item);
      if (this.bar) {
        this.bar.increment();
      }
      return result;
    });
  }

  /**
   * 开始处理
   */
  async start(items: T[], processor: (item: T) => Promise<R>): Promise<R[]> {
    if (this.bar) {
      this.bar.start(items.length, '处理中');
    }

    const tasks = items.map((item) => this.add(item, processor));
    const results = await Promise.all(tasks);

    if (this.bar) {
      this.bar.stop();
    }

    return results;
  }
}
