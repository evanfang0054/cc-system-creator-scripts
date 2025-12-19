import { ApiResponse, ApiInfo } from './types.js';

export class ApifoxClient {
  private baseUrl: string;

  constructor() {
    // 从环境变量获取基础 URL，如果没有则使用默认值
    this.baseUrl = process.env.APIFOX_BASE_URL || 'https://apifox.evanfang.com.cn';
  }

  /**
   * 从 URL 或直接的 key 中提取 Apifox key
   */
  extractKey(input: string): string {
    // 如果是完整 URL，提取其中的 key
    if (input.includes('/apidoc/shared/')) {
      const match = input.match(/shared\/([a-f0-9-]{36})/);
      if (match) {
        return match[1];
      }
      throw new Error('无法从 URL 中提取有效的 Apifox key');
    }

    // 如果是直接的 key 格式验证
    const keyPattern = /^[a-f0-9-]{36}$/;
    if (keyPattern.test(input)) {
      return input;
    }

    throw new Error('输入的 key 格式不正确，应为 36 位 UUID 格式');
  }

  /**
   * 构建 llms.txt 文件的 URL
   */
  buildLlmsUrl(key: string): string {
    return `${this.baseUrl}/apidoc/shared/${key}/llms.txt`;
  }

  /**
   * 构建 API 详细文档的 URL
   */
  buildApiDetailUrl(key: string, apiId: string): string {
    return `${this.baseUrl}/apidoc/shared/${key}/api-${apiId}.md`;
  }

  /**
   * 获取 API 列表
   */
  async getApiList(key: string): Promise<ApiResponse> {
    try {
      const url = this.buildLlmsUrl(key);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();

      return {
        success: true,
        data: content
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 获取 API 详细文档
   */
  async getApiDetail(key: string, apiId: string): Promise<ApiResponse> {
    try {
      const url = this.buildApiDetailUrl(key, apiId);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let content = await response.text();

      return {
        success: true,
        data: content
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  }