/**
 * 类型定义
 */

// 请求配置
export interface RequestConfig {
  timeout?: number;
  retries?: number;
}

// API 列表参数
export interface ApiListParams {
  input?: string;
  timeout?: number;
  retries?: number;
}

// API 详情参数
export interface ApiDetailParams {
  key?: string;
  apiId: string;
  timeout?: number;
  retries?: number;
}

// 成功响应
export interface SuccessResponse {
  success: true;
  data: string;
}

// 错误响应
export interface ErrorResponse {
  success: false;
  error: string;
}

// API 响应（联合类型）
export type ApiResponse = SuccessResponse | ErrorResponse;

// HTTP 状态码范围
export type HttpStatusCode = number;

// 重试配置
export interface RetryConfig {
  maxAttempts: number;
  backoffMultiplier: number;
  initialDelay: number;
}
