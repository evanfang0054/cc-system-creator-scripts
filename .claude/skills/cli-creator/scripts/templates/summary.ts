/**
 * 操作摘要
 *
 * 显示操作完成后的详细摘要信息
 */

import chalk from 'chalk';
import { supportsColor } from './utils.js';

/**
 * 操作摘要配置
 */
export interface OperationSummary {
  title: string;
  duration: number;
  details: Record<string, string>;
  nextSteps?: string[];
  url?: string;
  emoji?: boolean;
}

/**
 * 显示操作摘要
 *
 * 格式化显示操作完成后的摘要信息
 */
export function displaySummary(summary: OperationSummary): void {
  const useEmoji = summary.emoji !== false && supportsColor();
  const useColor = supportsColor();

  // 标题
  if (useColor) {
    console.log('');
    console.log(chalk.green((useEmoji ? '✓ ' : '') + summary.title));
  } else {
    console.log(`\n[${useEmoji ? '✓' : 'SUCCESS'}] ${summary.title}`);
  }

  // 详情
  if (Object.keys(summary.details).length > 0) {
    console.log('');
    if (useColor) {
      console.log(chalk.bold('摘要:'));
    } else {
      console.log('摘要:');
    }

    Object.entries(summary.details).forEach(([key, value]) => {
      const paddedKey = key.padEnd(15);
      if (useColor) {
        console.log(chalk.dim('  ') + paddedKey + chalk.cyan(value));
      } else {
        console.log(`  ${paddedKey} ${value}`);
      }
    });
  }

  // 持续时间
  if (summary.duration > 0) {
    console.log('');
    const durationStr = formatDuration(summary.duration);
    if (useColor) {
      console.log(chalk.dim('  持续时间:   ') + chalk.yellow(durationStr));
    } else {
      console.log(`  持续时间:   ${durationStr}`);
    }
  }

  // 后续步骤
  if (summary.nextSteps && summary.nextSteps.length > 0) {
    console.log('');
    if (useColor) {
      console.log(chalk.bold('后续步骤:'));
    } else {
      console.log('后续步骤:');
    }

    summary.nextSteps.forEach((step, index) => {
      if (useColor) {
        console.log(chalk.dim('  • ') + chalk.green(step));
      } else {
        console.log(`  ${index + 1}. ${step}`);
      }
    });
  }

  // URL
  if (summary.url) {
    console.log('');
    if (useColor) {
      console.log(chalk.blue('URL: ') + chalk.underline(summary.url));
    } else {
      console.log(`URL: ${summary.url}`);
    }
  }

  console.log('');
}

/**
 * 格式化持续时间
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分`;
  }
  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`;
  }
  return `${seconds}秒`;
}

/**
 * 创建操作摘要
 *
 * 辅助函数，用于快速创建摘要对象
 */
export function createSummary(
  title: string,
  options?: {
    duration?: number;
    details?: Record<string, string>;
    nextSteps?: string[];
    url?: string;
    emoji?: boolean;
  }
): OperationSummary {
  return {
    title,
    duration: options?.duration || 0,
    details: options?.details || {},
    nextSteps: options?.nextSteps,
    url: options?.url,
    emoji: options?.emoji,
  };
}

/**
 * 显示成功摘要
 *
 * 显示成功的操作摘要
 */
export function displaySuccessSummary(
  title: string,
  details?: Record<string, string>,
  duration?: number
): void {
  displaySummary(createSummary(title, { details, duration }));
}

/**
 * 显示失败摘要
 *
 * 显示失败的操作摘要
 */
export function displayFailureSummary(
  title: string,
  error?: string,
  suggestions?: string[]
): void {
  const details: Record<string, string> = {};

  if (error) {
    details['错误'] = error;
  }

  const nextSteps: string[] = [];
  if (suggestions && suggestions.length > 0) {
    nextSteps.push(...suggestions);
  }

  if (supportsColor()) {
    console.log('');
    console.log(chalk.red('✗ ' + title));
    console.log('');
    console.log(chalk.bold('摘要:'));

    Object.entries(details).forEach(([key, value]) => {
      console.log(chalk.dim('  ') + key + ': ' + chalk.red(value));
    });

    if (nextSteps.length > 0) {
      console.log('');
      console.log(chalk.bold('解决步骤:'));
      nextSteps.forEach(step => {
        console.log(chalk.dim('  • ') + chalk.yellow(step));
      });
    }

    console.log('');
  } else {
    console.log(`\n[ERROR] ${title}\n`);

    if (Object.keys(details).length > 0) {
      console.log('摘要:');
      Object.entries(details).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }

    if (nextSteps.length > 0) {
      console.log('\n解决步骤:');
      nextSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`);
      });
    }

    console.log('');
  }
}

/**
 * 显示进度摘要
 *
 * 显示带有进度信息的摘要
 */
export function displayProgressSummary(
  title: string,
  stats: {
    total: number;
    completed: number;
    failed: number;
  },
  duration?: number
): void {
  const successRate = (stats.completed / stats.total) * 100;

  const details: Record<string, string> = {
    '总数': stats.total.toString(),
    '完成': stats.completed.toString(),
    '失败': stats.failed.toString(),
    '成功率': `${successRate.toFixed(1)}%`,
  };

  displaySummary(createSummary(title, { details, duration }));
}

/**
 * 显示部署摘要
 *
 * 专门用于部署操作的摘要
 */
export function displayDeploymentSummary(
  deployment: {
    name: string;
    environment: string;
    version: string;
    url?: string;
  },
  duration: number,
  success: boolean
): void {
  const details: Record<string, string> = {
    '应用': deployment.name,
    '环境': deployment.environment,
    '版本': deployment.version,
  };

  const nextSteps: string[] = [];
  if (deployment.url) {
    nextSteps.push(`访问应用: ${deployment.url}`);
  }
  nextSteps.push('检查日志确保应用正常运行');

  if (success) {
    displaySuccessSummary('部署完成', details, duration);
  } else {
    displayFailureSummary('部署失败', undefined, nextSteps);
  }
}

/**
 * 显示测试摘要
 *
 * 专门用于测试结果的摘要
 */
export function displayTestSummary(
  results: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  },
  duration: number
): void {
  const details: Record<string, string> = {
    '测试总数': results.total.toString(),
    '通过': results.passed.toString(),
    '失败': results.failed.toString(),
    '跳过': results.skipped.toString(),
    '通过率': `${((results.passed / results.total) * 100).toFixed(1)}%`,
  };

  const nextSteps: string[] = [];
  if (results.failed > 0) {
    nextSteps.push('查看失败的测试详情');
    nextSteps.push('修复失败的测试用例');
  }

  const title = results.failed === 0 ? '测试全部通过' : '测试部分失败';
  displaySummary(createSummary(title, { details, duration, nextSteps }));
}
