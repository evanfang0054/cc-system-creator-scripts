/**
 * 错误处理系统
 *
 * 提供友好的错误处理和显示
 * 包含自定义错误类型和统一的错误显示函数
 */

import { supportsColor } from './utils.js';

/**
 * CLI 错误基类
 *
 * 所有自定义错误都应该继承这个类
 */
export class CliError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly suggestions?: string[],
  ) {
    super(message);
    this.name = 'CliError';
    Error.captureStackTrace(this, CliError);
  }
}

/**
 * 验证错误
 *
 * 用于参数验证失败的情况
 */
export class ValidationError extends CliError {
  constructor(
    message: string,
    suggestions?: string[],
  ) {
    super(message, 'VALIDATION_ERROR', suggestions);
    this.name = 'ValidationError';
  }
}

/**
 * 配置错误
 *
 * 用于配置相关的问题
 */
export class ConfigError extends CliError {
  constructor(
    message: string,
    suggestions?: string[],
  ) {
    super(message, 'CONFIG_ERROR', suggestions);
    this.name = 'ConfigError';
  }
}

/**
 * 网络错误
 *
 * 用于网络操作失败的情况
 */
export class NetworkError extends CliError {
  constructor(
    message: string,
    suggestions?: string[],
  ) {
    super(message, 'NETWORK_ERROR', suggestions);
    this.name = 'NetworkError';
  }
}

/**
 * 文件系统错误
 *
 * 用于文件操作失败的情况
 */
export class FileSystemError extends CliError {
  constructor(
    message: string,
    suggestions?: string[],
  ) {
    super(message, 'FILESYSTEM_ERROR', suggestions);
    this.name = 'FileSystemError';
  }
}

/**
 * Git 操作错误
 *
 * 用于 Git 操作失败的情况
 */
export class GitError extends CliError {
  constructor(
    message: string,
    suggestions?: string[],
  ) {
    super(message, 'GIT_ERROR', suggestions);
    this.name = 'GitError';
  }
}

/**
 * 显示错误信息
 *
 * 友好地显示错误,包括:
 * - 错误类型和代码
 * - 错误消息
 * - 建议的解决方案
 * - 堆栈跟踪 (仅在调试模式)
 */
export function displayError(error: unknown): void {
  const useColor = supportsColor();

  // 如果是自定义错误
  if (error instanceof CliError) {
    console.error('\n' + formatColor('错误: ', 'red', useColor) + formatColor(error.code, 'yellow', useColor));
    console.error(formatColor('  ' + error.message, 'red', useColor));

    // 显示建议
    if (error.suggestions && error.suggestions.length > 0) {
      console.error('\n' + formatColor('💡 建议的解决方案:', 'cyan', useColor));
      error.suggestions.forEach((suggestion, index) => {
        console.error(formatColor(`  ${index + 1}. ${suggestion}`, 'white', useColor));
      });
    }

    // 调试模式下显示堆栈
    if (isDebugMode() && error.stack) {
      console.error('\n' + formatColor('堆栈跟踪:', 'gray', useColor));
      console.error(formatColor(error.stack, 'gray', useColor));
    }
  }
  // 如果是普通 Error
  else if (error instanceof Error) {
    console.error('\n' + formatColor('错误: ', 'red', useColor) + formatColor(error.message, 'red', useColor));

    // 调试模式下显示堆栈
    if (isDebugMode() && error.stack) {
      console.error('\n' + formatColor('堆栈跟踪:', 'gray', useColor));
      console.error(formatColor(error.stack, 'gray', useColor));
    }
  }
  // 其他类型
  else {
    console.error('\n' + formatColor('错误: ', 'red', useColor) + formatColor(String(error), 'red', useColor));
  }

  console.error('');
}

/**
 * 格式化彩色输出
 */
function formatColor(text: string, color: string, useColor: boolean): string {
  if (!useColor) {
    return text;
  }

  const colors: Record<string, string> = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    reset: '\x1b[0m',
  };

  const colorCode = colors[color] || colors.reset;
  return `${colorCode}${text}${colors.reset}`;
}

/**
 * 检测是否在调试模式
 */
function isDebugMode(): boolean {
  return process.env.DEBUG === 'true' || process.env.DEBUG === '1';
}
