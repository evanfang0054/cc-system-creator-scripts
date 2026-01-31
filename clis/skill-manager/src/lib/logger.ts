import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import { supportsColor, isVerbose, isDebug, isCI } from './utils.js';

/**
 * 日志级别枚举
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  SUCCESS = 3,
  DEBUG = 4,
  VERBOSE = 5,
}

/**
 * Logger 类
 *
 * 提供增强的日志功能,支持:
 * - NO_COLOR 环境变量
 * - TTY 环境自动降级
 * - CI 环境兼容
 * - VERBOSE/DEBUG 模式
 */
export class Logger {
  private spinner?: Ora;
  private useColor: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.useColor = supportsColor();
    this.logLevel = this.calculateLogLevel();

    // 禁用 chalk 的颜色如果不支持
    if (!this.useColor) {
      chalk.level = 0;
    }
  }

  /**
   * 计算日志级别
   */
  private calculateLogLevel(): LogLevel {
    if (isDebug()) {
      return LogLevel.VERBOSE;
    }
    if (isVerbose()) {
      return LogLevel.VERBOSE;
    }
    return LogLevel.INFO;
  }

  /**
   * 格式化彩色输出
   */
  private formatColor(text: string, colorFn: (text: string) => string): string {
    return this.useColor ? colorFn(text) : text;
  }

  /**
   * 检查是否应该显示该级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  /**
   * INFO 级别日志
   */
  info(message: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const icon = this.formatColor('ℹ', chalk.blue);
      console.log(icon, message);
    }
  }

  /**
   * SUCCESS 级别日志
   */
  success(message: string): void {
    if (this.shouldLog(LogLevel.SUCCESS)) {
      const icon = this.formatColor('✓', chalk.green);
      console.log(icon, message);
    }
  }

  /**
   * WARN 级别日志
   */
  warn(message: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const icon = this.formatColor('⚠', chalk.yellow);
      console.log(icon, message);
    }
  }

  /**
   * ERROR 级别日志
   */
  error(message: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const icon = this.formatColor('✗', chalk.red);
      console.error(icon, message);
    }
  }

  /**
   * 标题日志
   */
  title(message: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const title = this.formatColor(message, (text) => chalk.bold.cyan(text));
      console.log(`\n${title}`);
    }
  }

  /**
   * DEBUG 级别日志
   */
  debug(message: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const icon = this.formatColor('🐛', chalk.gray);
      console.log(icon, message);
    }
  }

  /**
   * VERBOSE 级别日志
   */
  verbose(message: string): void {
    if (this.shouldLog(LogLevel.VERBOSE)) {
      const icon = this.formatColor('ℹ', chalk.dim);
      console.log(icon, message);
    }
  }

  /**
   * 启动加载动画
   *
   * 在 CI 环境中降级为普通日志
   */
  start(text: string): void {
    if (isCI()) {
      // CI 环境不使用 spinner
      this.info(text);
    } else {
      this.spinner = ora({
        text,
        color: this.useColor ? 'cyan' : 'white',
        isEnabled: this.useColor && process.stdout.isTTY,
      }).start();
    }
  }

  /**
   * 成功停止加载动画
   */
  succeed(text?: string): void {
    if (isCI()) {
      if (text) {
        this.success(text);
      }
    } else {
      this.spinner?.succeed(text);
    }
  }

  /**
   * 失败停止加载动画
   */
  fail(text?: string): void {
    if (isCI()) {
      if (text) {
        this.error(text);
      }
    } else {
      this.spinner?.fail(text);
    }
  }

  /**
   * 停止加载动画
   */
  stop(): void {
    this.spinner?.stop();
  }

  /**
   * 打印空行
   */
  newline(): void {
    console.log('');
  }

  /**
   * 打印原始文本 (不添加前缀)
   */
  raw(text: string): void {
    console.log(text);
  }
}

/**
 * 全局 logger 实例
 */
export const logger = new Logger();
