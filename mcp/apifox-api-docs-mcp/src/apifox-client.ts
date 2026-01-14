/**
 * Apifox API 客户端
 */

import { ApiResponse, RequestConfig, SuccessResponse, ErrorResponse } from './types.js';
import { McpError, McpErrorCode, logger } from './errors.js';
import { UUID_PATTERN, UUID_EXTRACTION_PATTERN, configManager } from './utils/index.js';

export class ApifoxClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = configManager.getBaseUrl();

    logger.info('ApifoxClient 初始化', {
      baseUrl: this.baseUrl,
      config: configManager.getConfig(),
    });
  }

  /**
   * 验证和提取 Apifox Key
   */
  extractKey(input: string): string {
    const trimmed = input.trim();

    // 从 URL 中提取 UUID
    const match = trimmed.match(UUID_EXTRACTION_PATTERN);
    if (match && match[1]) {
      return match[1];
    }

    // 验证是否为直接提供的 UUID
    if (UUID_PATTERN.test(trimmed)) {
      return trimmed;
    }

    throw new McpError('无效的 Apifox Key 或 URL 格式', McpErrorCode.InvalidParams, {
      input: trimmed.substring(0, 50),
      expected: 'UUID 或完整 URL (如 https://domain.com/apidoc/shared/{UUID})'
    });
  }

  /**
   * 通用请求方法（带重试机制）
   */
  private async makeRequest(
    key: string,
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse> {
    try {
      const validKey = this.extractKey(key);
      const url = `${this.baseUrl}/apidoc/shared/${validKey}/${endpoint}`;

      logger.debug('发起请求', { endpoint, url, config });

      const data = await this.fetchWithRetry(url, config);

      logger.info('请求成功', {
        endpoint,
        dataSize: data.length,
        config,
      });

      return { success: true, data };
    } catch (error) {
      logger.error('请求失败', error, { endpoint, config });

      return {
        success: false,
        error: error instanceof McpError ? error.message : `请求失败: ${String(error)}`
      };
    }
  }

  /**
   * 带重试机制的 HTTP 请求
   */
  private async fetchWithRetry(url: string, config: RequestConfig = {}): Promise<string> {
    const { timeout, retries } = configManager.getRequestConfig(config);
    const maxAttempts = retries + 1;

    logger.debug('开始重试请求', { url, timeout, retries, maxAttempts });

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await this.fetchWithTimeout(url, timeout);
        if (attempt > 0) {
          logger.info('重试成功', { attempt, maxAttempts });
        }
        return result;
      } catch (error) {
        logger.debug('请求失败', {
          attempt,
          maxAttempts,
          willRetry: this.shouldRetry(error, attempt, retries),
        });

        if (!this.shouldRetry(error, attempt, retries)) {
          throw this.handleError(error, timeout);
        }
        await this.backoff(attempt);
      }
    }

    throw new McpError('请求失败', McpErrorCode.InternalError);
  }

  /**
   * 带超时的单个请求
   */
  private async fetchWithTimeout(url: string, timeout: number): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return this.validateResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 验证 HTTP 响应
   */
  private async validateResponse(response: Response): Promise<string> {
    if (!response.ok) {
      throw new McpError(
        `HTTP ${response.status}: ${response.statusText}`,
        McpErrorCode.InternalError,
        { status: response.status, statusText: response.statusText }
      );
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new McpError('API 返回内容为空', McpErrorCode.InternalError);
    }

    return text;
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: unknown, attempt: number, maxRetries: number): boolean {
    // 达到最大重试次数
    if (attempt >= maxRetries) {
      return false;
    }

    // McpError 且是 4xx 错误不重试
    if (error instanceof McpError && error.details && typeof error.details === 'object') {
      const status = (error.details as { status?: number })?.status;
      if (status && status >= 400 && status < 500) {
        return false;
      }
    }

    // AbortError（超时）不重试
    if (error instanceof Error && error.name === 'AbortError') {
      return false;
    }

    return true;
  }

  /**
   * 指数退避延迟
   */
  private async backoff(attempt: number): Promise<void> {
    const delay = 1000 * Math.pow(2, attempt);
    await this.delay(delay);
  }

  /**
   * 处理错误并转换为 McpError
   */
  private handleError(error: unknown, timeout: number): McpError {
    if (error instanceof McpError) {
      return error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new McpError(`请求超时 (${timeout}ms)`, McpErrorCode.InternalError);
      }
      return new McpError(`网络请求失败: ${error.message}`, McpErrorCode.InternalError);
    }

    return new McpError(`网络请求失败: ${String(error)}`, McpErrorCode.InternalError);
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
    return this.makeRequest(key, 'llms.txt', config);
  }

  /**
   * 获取 API 详情
   */
  async getApiDetail(key: string, apiId: string, config?: RequestConfig): Promise<ApiResponse> {
    return this.makeRequest(key, `api-${apiId}.md`, config);
  }
}
