/**
 * 标准 POSIX 退出码
 *
 * 参考: https://tldp.org/LDP/abs/html/exitcodes.html
 */

/**
 * 标准 POSIX 退出码常量
 */
export const EXIT_CODES = {
  /** 成功 */
  SUCCESS: 0,

  /** 一般错误 */
  GENERAL_ERROR: 1,

  /** 误用 shell 命令 (无效参数) */
  MISUSE: 2,

  /** 命令无法执行 */
  CANNOT_EXECUTE: 126,

  /** 命令未找到 */
  COMMAND_NOT_FOUND: 127,

  /** 无效退出码 */
  INVALID_EXIT_CODE: 128,

  /** 被 Ctrl+C 终止 */
  SIGINT: 130,

  /** 被 SIGTERM 终止 */
  SIGTERM: 143,

  /** 权限被拒绝 */
  PERMISSION_DENIED: 77,

  /** 文件未找到 */
  NOT_FOUND: 127,

  /** 操作已取消 */
  CANCELLED: 130,
} as const;

/**
 * 退出码类型
 */
export type ExitCode = typeof EXIT_CODES[keyof typeof EXIT_CODES];

/**
 * 退出码描述
 */
export const EXIT_CODE_DESCRIPTIONS: Record<ExitCode, string> = {
  [EXIT_CODES.SUCCESS]: '成功',
  [EXIT_CODES.GENERAL_ERROR]: '一般错误',
  [EXIT_CODES.MISUSE]: '误用 shell 命令',
  [EXIT_CODES.CANNOT_EXECUTE]: '命令无法执行',
  [EXIT_CODES.COMMAND_NOT_FOUND]: '命令未找到',
  [EXIT_CODES.INVALID_EXIT_CODE]: '无效退出码',
  [EXIT_CODES.SIGINT]: '被 Ctrl+C 终止',
  [EXIT_CODES.SIGTERM]: '被 SIGTERM 终止',
  [EXIT_CODES.PERMISSION_DENIED]: '权限被拒绝',
  [EXIT_CODES.NOT_FOUND]: '文件未找到',
  [EXIT_CODES.CANCELLED]: '操作已取消',
};

/**
 * 信号退出码映射
 */
export const SIGNAL_EXIT_CODES = {
  SIGHUP: 129,    // 1 - 挂起
  SIGINT: 130,    // 2 - 中断 (Ctrl+C)
  SIGQUIT: 131,   // 3 - 退出
  SIGILL: 132,    // 4 - 非法指令
  SIGTRAP: 133,   // 5 - 断点陷阱
  SIGABRT: 134,   // 6 - 异常终止
  SIGBUS: 135,    // 7 - 总线错误
  SIGFPE: 136,    // 8 - 浮点异常
  SIGKILL: 137,   // 9 - 强制终止
  SIGUSR1: 138,   // 10 - 用户信号 1
  SIGSEGV: 139,   // 11 - 段错误
  SIGUSR2: 140,   // 12 - 用户信号 2
  SIGPIPE: 141,   // 13 - 管道破裂
  SIGALRM: 142,   // 14 - 定时器
  SIGTERM: 143,   // 15 - 终止
  SIGSTKFLT: 144, // 16 - 协栈错误
  SIGCHLD: 145,   // 17 - 子进程状态
  SIGCONT: 146,   // 18 - 继续
  SIGSTOP: 147,   // 19 - 停止
  SIGTSTP: 148,   // 20 - 终端停止 (Ctrl+Z)
  SIGTTIN: 149,   // 21 - 后台读
  SIGTTOU: 150,   // 22 - 后台写
} as const;

/**
 * 根据错误获取退出码
 *
 * @param error - 错误对象
 * @returns 退出码
 */
export function getExitCode(error: Error): ExitCode {
  // CliError 或带有 code 属性的错误
  if ('code' in error && typeof error.code === 'string') {
    const errorCode = (error as any).code.toUpperCase();

    // Node.js 错误码
    switch ((error as any).code) {
      case 'EACCES':
      case 'EPERM':
        return EXIT_CODES.PERMISSION_DENIED;
      case 'ENOENT':
        return EXIT_CODES.NOT_FOUND;
      case 'EEXIST':
        return EXIT_CODES.GENERAL_ERROR;
      case 'EINVAL':
        return EXIT_CODES.MISUSE;
      default:
        break;
    }

    // 自定义错误码
    switch (errorCode) {
      case 'ECANCELLED':
      case 'CANCELLED':
        return EXIT_CODES.CANCELLED;
      case 'EMISSINGARG':
        return EXIT_CODES.MISUSE;
      case 'EINVALIDCONFIG':
        return EXIT_CODES.GENERAL_ERROR;
      case 'ECMDNOTFOUND':
        return EXIT_CODES.COMMAND_NOT_FOUND;
      default:
        return EXIT_CODES.GENERAL_ERROR;
    }
  }

  // 默认一般错误
  return EXIT_CODES.GENERAL_ERROR;
}

/**
 * 优雅退出
 *
 * 显示退出信息并使用指定的退出码退出程序
 *
 * @param code - 退出码
 * @param message - 可选的退出消息
 */
export function exit(code: ExitCode, message?: string): never {
  if (message) {
    if (code === EXIT_CODES.SUCCESS) {
      console.log(message);
    } else {
      console.error(message);
    }
  }

  process.exit(code);
}

/**
 * 优雅退出并显示错误
 *
 * @param error - 错误对象
 */
export function exitWithError(error: Error): never {
  const exitCode = getExitCode(error);

  // 如果有 displayError 函数，使用它
  if (typeof (error as any).displayError === 'function') {
    (error as any).displayError();
  } else {
    console.error(error.message);
  }

  process.exit(exitCode);
}

/**
 * 成功退出
 *
 * @param message - 可选的成功消息
 */
export function exitSuccess(message?: string): never {
  if (message) {
    console.log(message);
  }

  process.exit(EXIT_CODES.SUCCESS);
}

/**
 * 取消退出
 *
 * @param message - 可选的取消消息
 */
export function exitCancelled(message = '操作已取消'): never {
  console.warn(message);
  process.exit(EXIT_CODES.CANCELLED);
}

/**
 * 验证退出码是否有效
 *
 * @param code - 退出码
 * @returns 是否有效
 */
export function isValidExitCode(code: number): boolean {
  return code >= 0 && code <= 255;
}

/**
 * 格式化退出码信息
 *
 * @param code - 退出码
 * @returns 格式化的信息字符串
 */
export function formatExitCode(code: number): string {
  if (isValidExitCode(code)) {
    const description = EXIT_CODE_DESCRIPTIONS[code as ExitCode];
    if (description) {
      return `${code} (${description})`;
    }

    // 检查是否是信号退出码
    const signal = Object.entries(SIGNAL_EXIT_CODES).find(
      ([_, value]) => value === code
    );
    if (signal) {
      return `${code} (信号: ${signal[0]})`;
    }

    return `${code} (未知)`;
  }

  return `${code} (无效)`;
}

/**
 * 信号处理器
 *
 * 设置常见的信号处理器
 */
export function setupSignalHandlers(): void {
  // SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n操作已取消 (SIGINT)');
    process.exit(EXIT_CODES.SIGINT);
  });

  // SIGTERM
  process.on('SIGTERM', () => {
    console.log('\n收到终止信号 (SIGTERM)');
    process.exit(EXIT_CODES.SIGTERM);
  });

  // 未捕获的异常
  process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:');
    console.error(error);
    process.exit(EXIT_CODES.GENERAL_ERROR);
  });

  // 未处理的 Promise 拒绝
  process.on('unhandledRejection', (reason) => {
    console.error('未处理的 Promise 拒绝:');
    console.error(reason);
    process.exit(EXIT_CODES.GENERAL_ERROR);
  });
}

/**
 * 退出码统计
 */
export class ExitCodeStats {
  private stats: Map<ExitCode, number> = new Map();

  /**
   * 记录退出码
   */
  record(code: ExitCode): void {
    const count = this.stats.get(code) || 0;
    this.stats.set(code, count + 1);
  }

  /**
   * 获取退出码次数
   */
  getCount(code: ExitCode): number {
    return this.stats.get(code) || 0;
  }

  /**
   * 获取所有统计
   */
  getAll(): Map<ExitCode, number> {
    return new Map(this.stats);
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.stats.clear();
  }

  /**
   * 打印统计报告
   */
  printReport(): void {
    console.log('\n退出码统计:');
    console.log('─'.repeat(40));

    for (const [code, count] of this.stats.entries()) {
      console.log(`${formatExitCode(code)}: ${count} 次`);
    }

    console.log('─'.repeat(40));

    const total = Array.from(this.stats.values()).reduce((a, b) => a + b, 0);
    const successCount = this.getCount(EXIT_CODES.SUCCESS);
    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    console.log(`总计: ${total} 次`);
    console.log(`成功率: ${successRate.toFixed(1)}%`);
  }
}
