/**
 * Apifox API 客户端（简化版）
 */

import { ApiResponse, RequestConfig } from './types.js';
import { McpError, McpErrorCode } from './errors.js';

export class ApifoxClient {
  private readonly baseUrl: string;
  private readonly defaultConfig: RequestConfig;

  constructor() {
    this.baseUrl = process.env.APIFOX_BASE_URL || 'https://apifox.evanfang.com.cn';
    this.defaultConfig = {
      timeout: parseInt(process.env.APIFOX_TIMEOUT || '10000'),
      retries: parseInt(process.env.APIFOX_RETRIES || '2'),
    };
  }

  /**
   * 验证和提取 Apifox Key
   */
  extractKey(input: string): string {
    const trimmed = input.trim();

    // 从 URL 中提取 UUID
    const match = trimmed.match(/([a-f0-9-]{36})/i);
    if (match && match[1]) {
      return match[1];
    }

    // 验证是否为直接提供的 UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)) {
      return trimmed;
    }

    throw new McpError('无效的 Apifox Key 或 URL 格式', McpErrorCode.InvalidParams, {
      input: trimmed.substring(0, 50),
      expected: 'UUID 或完整 URL (如 https://domain.com/apidoc/shared/{UUID})'
    });
  }

  /**
   * 带重试机制的 HTTP 请求
   */
  private async fetchWithRetry(url: string, config: RequestConfig = {}): Promise<string> {
    const { timeout = this.defaultConfig.timeout || 10000, retries = this.defaultConfig.retries || 2 } = config;

    for (let attempt = 0; attempt <= retries!; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          // 4xx 错误不重试
          if (response.status < 500) {
            throw new McpError(`HTTP ${response.status}: ${response.statusText}`, McpErrorCode.InternalError);
          }
          // 5xx 错误可以重试
          if (attempt < retries!) {
            await this.delay(1000 * Math.pow(2, attempt)); // 指数退避
            continue;
          }
          throw new McpError(`HTTP ${response.status}: ${response.statusText}`, McpErrorCode.InternalError);
        }

        const text = await response.text();
        if (!text.trim()) {
          throw new McpError('API 返回内容为空', McpErrorCode.InternalError);
        }
        return text;

      } catch (error) {
        if (error instanceof McpError) throw error;

        // 最后一次尝试或不可重试的错误
        if (attempt === retries! || (error instanceof Error && error.name === 'AbortError')) {
          throw new McpError(
            error instanceof Error && error.name === 'AbortError' ? `请求超时 (${timeout}ms)` : `网络请求失败: ${error instanceof Error ? error.message : String(error)}`,
            McpErrorCode.InternalError
          );
        }

        // 等待后重试
        await this.delay(1000 * Math.pow(2, attempt));
      }
    }

    throw new McpError('请求失败', McpErrorCode.InternalError);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取 API 列表
   */
  async getApiList(key: string, config?: RequestConfig): Promise<ApiResponse> {
    try {
      const validKey = this.extractKey(key);
      const url = `${this.baseUrl}/apidoc/shared/${validKey}/llms.txt`;
      const data = await this.fetchWithRetry(url, config);

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof McpError ? error.message : `请求失败: ${String(error)}`
      };
    }
  }

  /**
   * 获取 API 详情
   */
  async getApiDetail(key: string, apiId: string, config?: RequestConfig): Promise<ApiResponse> {
    try {
      const validKey = this.extractKey(key);
      const url = `${this.baseUrl}/apidoc/shared/${validKey}/api-${apiId}.md`;
      const data = await this.fetchWithRetry(url, config);

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof McpError ? error.message : `请求失败: ${String(error)}`
      };
    }
  }
}
