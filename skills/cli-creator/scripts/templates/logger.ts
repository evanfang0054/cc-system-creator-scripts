/**
 * 日志输出工具
 *
 * 提供统一的日志接口,支持彩色输出和加载动画
 * 自动检测 CI/CD 环境,适配 TTY 和非 TTY 输出
 */

import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { supportsColor, isDebug, isCI } from './utils.js';

export interface Logger {
  title(message: string): void;
  info(message: string): void;
  success(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  debug(message: string): void;
  start(message: string): Ora;
  succeed(message?: string): void;
  fail(message?: string): void;
}

/**
 * Logger 实现
 */
export const logger: Logger = {
  /**
   * 显示标题
   */
  title(message: string): void {
    if (supportsColor()) {
      console.log('\n' + chalk.bold.cyan(message));
    } else {
      console.log('\n' + message);
      console.log('='.repeat(message.length));
    }
  },

  /**
   * 显示信息
   */
  info(message: string): void {
    if (supportsColor()) {
      console.log(chalk.blue('ℹ') + ' ' + message);
    } else {
      console.log('[INFO] ' + message);
    }
  },

  /**
   * 显示成功消息
   */
  success(message: string): void {
    if (supportsColor()) {
      console.log(chalk.green('✓') + ' ' + message);
    } else {
      console.log('[SUCCESS] ' + message);
    }
  },

  /**
   * 显示错误消息
   */
  error(message: string): void {
    if (supportsColor()) {
      console.error(chalk.red('✗') + ' ' + message);
    } else {
      console.error('[ERROR] ' + message);
    }
  },

  /**
   * 显示警告消息
   */
  warn(message: string): void {
    if (supportsColor()) {
      console.warn(chalk.yellow('⚠') + ' ' + message);
    } else {
      console.warn('[WARN] ' + message);
    }
  },

  /**
   * 显示调试消息
   * 仅在调试模式下输出
   */
  debug(message: string): void {
    if (isDebug()) {
      const timestamp = new Date().toISOString();
      if (supportsColor()) {
        console.error(chalk.dim(`[${timestamp}] [DEBUG] ${message}`));
      } else {
        console.error(`[${timestamp}] [DEBUG] ${message}`);
      }
    }
  },

  /**
   * 创建加载动画
   */
  spinner: ora(),

  /**
   * 开始加载
   */
  start(message: string): Ora {
    if (isCI()) {
      // CI 环境下不显示 spinner,直接输出
      logger.info(message);
      logger.spinner = ora();
      logger.spinner.isSpinning = false;
      return logger.spinner;
    }
    logger.spinner = ora(message).start();
    return logger.spinner;
  },

  /**
   * 加载成功
   */
  succeed(message?: string): void {
    if (logger.spinner.isSpinning) {
      logger.spinner.succeed(message);
    } else if (message) {
      logger.success(message);
    }
  },

  /**
   * 加载失败
   */
  fail(message?: string): void {
    if (logger.spinner.isSpinning) {
      logger.spinner.fail(message);
    } else if (message) {
      logger.error(message);
    }
  },
};
