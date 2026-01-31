/**
 * 退出码管理
 *
 * 提供标准化的退出码定义和错误处理
 * 遵循 sysexits.h 标准 (https://man7.org/linux/man-pages/man3/sysexits.h.html)
 */

import type { CliError } from './errors.js';

/**
 * 标准退出码常量
 *
 * 遵循 sysexits.h 标准
 */
export const EXIT_CODES = {
  /** 成功 */
  SUCCESS: 0,

  /** 操作失败 (通用错误) */
  FAILURE: 1,

  /** 命令行使用错误 */
  USAGE: 64,

  /** 数据格式错误 */
  DATAERR: 65,

  /** 无法打开输入 */
  NOINPUT: 66,

  /** 添加失败 (如创建文件) */
  NOUSER: 67,

  /** 设备错误 */
  NOHOST: 68,

  /** 服务不可用 */
  UNAVAILABLE: 69,

  /** 内部软件错误 */
  SOFTWARE: 70,

  /** 系统错误 (如内存不足) */
  OSERR: 71,

  /** 关键文件不存在 */
  NOFILE: 72,

  /** 无法创建输出文件 */
  CANTCREAT: 73,

  /** 输入/输出错误 */
  IOERR: 74,

  /** 临时失败 (可重试) */
  TEMPFAIL: 75,

  /** 协议错误 */
  PROTOCOL: 76,

  /** 权限不足 */
  NOPERM: 77,

  /** 配置错误 */
  CONFIG: 78,
} as const;

/**
 * 根据错误类型获取退出码
 *
 * 将自定义错误映射到标准退出码
 */
export function getExitCode(error: unknown): number {
  // CLI 错误
  if (isCliError(error)) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return EXIT_CODES.USAGE;
      case 'CONFIG_ERROR':
        return EXIT_CODES.CONFIG;
      case 'NETWORK_ERROR':
        return EXIT_CODES.TEMPFAIL;
      case 'FILESYSTEM_ERROR':
        return EXIT_CODES.IOERR;
      case 'GIT_ERROR':
        return EXIT_CODES.SOFTWARE;
      default:
        return EXIT_CODES.FAILURE;
    }
  }

  // Node.js 系统错误
  if (isNodeSystemError(error)) {
    switch (error.code) {
      case 'EACCES':
      case 'EPERM':
        return EXIT_CODES.NOPERM;
      case 'ENOENT':
      case 'ENOTDIR':
        return EXIT_CODES.NOFILE;
      case 'EIO':
        return EXIT_CODES.IOERR;
      case 'ENOMEM':
        return EXIT_CODES.OSERR;
      default:
        return EXIT_CODES.FAILURE;
    }
  }

  // 其他错误
  return EXIT_CODES.FAILURE;
}

/**
 * 显示错误并退出
 *
 * 统一的错误退出处理函数
 */
export function exitWithError(error: unknown): never {
  // 动态导入 displayError 避免循环依赖
  import('./errors.js').then(({ displayError }) => {
    displayError(error);
  });

  const exitCode = getExitCode(error);
  process.exit(exitCode);
}

/**
 * 设置信号处理器
 *
 * 优雅地处理 SIGINT 和 SIGTERM 信号
 */
export function setupSignalHandlers(): void {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

  signals.forEach((signal) => {
    process.on(signal, () => {
      console.error('\n\n操作被用户中断');

      // 使用 SIGINT 的退出码
      process.exit(128 + (signal === 'SIGINT' ? 2 : 15));
    });
  });
}

/**
 * 处理未捕获的异常
 *
 * 全局异常处理器
 */
export function setupUnhandledRejection(): void {
  process.on('uncaughtException', (error: Error) => {
    console.error('\n未捕获的异常:');
    exitWithError(error);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('\n未处理的 Promise 拒绝:');
    exitWithError(reason);
  });
}

/**
 * 类型守卫: 检查是否为 CliError
 */
function isCliError(error: unknown): error is CliError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'name' in error
  );
}

/**
 * 类型守卫: 检查是否为 Node.js 系统错误
 */
function isNodeSystemError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as NodeJS.ErrnoException).code === 'string'
  );
}
