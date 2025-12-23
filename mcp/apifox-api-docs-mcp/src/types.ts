/**
 * 类型定义（简化版）
 */

// 请求配置
export interface RequestConfig {
  timeout?: number;
  retries?: number;
}

// API 响应
export interface ApiResponse {
  success: boolean;
  data?: string;
  error?: string;
}
