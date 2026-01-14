/**
 * MCP 服务器错误处理模块
 */

// MCP JSON-RPC 标准错误代码
export enum McpErrorCode {
  InvalidParams = -32602,
  InternalError = -32603,
  ParseError = -32700,
}

// 基础错误类
export class McpError extends Error {
  constructor(
    message: string,
    public readonly code: McpErrorCode = McpErrorCode.InternalError,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'McpError';
    Error.captureStackTrace?.(this, McpError);
  }

  /**
   * 获取完整的错误信息（用于日志）
   */
  getFullMessage(): string {
    let msg = `[${this.name}] ${this.message} (code: ${this.code})`;
    if (this.details) {
      try {
        msg += `\n  Details: ${JSON.stringify(this.details, null, 2)}`;
      } catch {
        msg += `\n  Details: ${String(this.details)}`;
      }
    }
    return msg;
  }
}

// 参数验证错误
export class ValidationError extends McpError {
  constructor(message: string, details?: unknown) {
    super(message, McpErrorCode.InvalidParams, details);
    this.name = 'ValidationError';
    Error.captureStackTrace?.(this, ValidationError);
  }
}

/**
 * 简单的日志记录器
 */
export class Logger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * 记录信息
   */
  info(message: string, meta?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.error(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }

  /**
   * 记录警告
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.error(`[WARN] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }

  /**
   * 记录错误
   */
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorInfo = error instanceof McpError
      ? error.getFullMessage()
      : error instanceof Error
        ? `${error.name}: ${error.message}\n${error.stack}`
        : String(error);

    console.error(`[ERROR] ${message}`, errorInfo, meta ? JSON.stringify(meta, null, 2) : '');
  }

  /**
   * 记录调试信息
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.error(`[DEBUG] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }
}

// 导出全局日志实例
export const logger = new Logger();
