/**
 * 配置管理模块
 */

import { RequestConfig } from '../types.js';
import { API_TIMEOUT, API_RETRIES, CONFIG_DEFAULTS } from './constants.js';
import { logger, McpError, McpErrorCode } from '../errors.js';

/**
 * 应用配置接口
 */
export interface AppConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  nodeEnv: string;
}

/**
 * 配置管理类
 */
export class ConfigManager {
  private readonly config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
    this.logConfig();
  }

  /**
   * 加载配置
   */
  private loadConfig(): AppConfig {
    return {
      baseUrl: process.env.APIFOX_BASE_URL || CONFIG_DEFAULTS.BASE_URL,
      timeout: parseInt(process.env.APIFOX_TIMEOUT || String(CONFIG_DEFAULTS.TIMEOUT)),
      retries: parseInt(process.env.APIFOX_RETRIES || String(CONFIG_DEFAULTS.RETRIES)),
      nodeEnv: process.env.NODE_ENV || CONFIG_DEFAULTS.NODE_ENV,
    };
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    const errors: string[] = [];

    // 验证超时时间
    if (this.config.timeout < API_TIMEOUT.MIN || this.config.timeout > API_TIMEOUT.MAX) {
      errors.push(`timeout 必须在 ${API_TIMEOUT.MIN} 到 ${API_TIMEOUT.MAX} 之间，当前值: ${this.config.timeout}`);
    }

    // 验证重试次数
    if (this.config.retries < API_RETRIES.MIN || this.config.retries > API_RETRIES.MAX) {
      errors.push(`retries 必须在 ${API_RETRIES.MIN} 到 ${API_RETRIES.MAX} 之间，当前值: ${this.config.retries}`);
    }

    // 验证 baseUrl
    if (!this.config.baseUrl || !this.isValidUrl(this.config.baseUrl)) {
      errors.push(`baseUrl 必须是有效的 URL，当前值: ${this.config.baseUrl}`);
    }

    if (errors.length > 0) {
      throw new McpError(
        `配置验证失败:\n${errors.join('\n')}`,
        McpErrorCode.InvalidParams,
        { errors }
      );
    }
  }

  /**
   * 验证 URL 格式
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 记录配置信息
   */
  private logConfig(): void {
    const safeConfig = {
      ...this.config,
      // 脱敏处理（如果需要）
    };

    logger.info('配置加载成功', {
      baseUrl: safeConfig.baseUrl,
      timeout: safeConfig.timeout,
      retries: safeConfig.retries,
      nodeEnv: safeConfig.nodeEnv,
    });
  }

  /**
   * 获取配置
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * 获取请求配置（合并默认配置和用户配置）
   */
  getRequestConfig(userConfig?: RequestConfig): Required<RequestConfig> {
    return {
      timeout: userConfig?.timeout ?? this.config.timeout,
      retries: userConfig?.retries ?? this.config.retries,
    };
  }

  /**
   * 获取基础 URL
   */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * 是否为开发环境
   */
  isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  /**
   * 是否为生产环境
   */
  isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }
}

// 导出全局配置实例
export const configManager = new ConfigManager();
