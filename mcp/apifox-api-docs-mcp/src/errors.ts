/**
 * MCP 服务器错误处理模块（简化版）
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
  }
}

// 参数验证错误
export class ValidationError extends McpError {
  constructor(message: string, details?: unknown) {
    super(message, McpErrorCode.InvalidParams, details);
    this.name = 'ValidationError';
  }
}
