/**
 * API Key 处理工具
 */

import { ValidationError } from '../errors.js';

/**
 * 解析和验证 API Key
 * 优先级: 参数 Key > 环境变量 Key
 */
export function resolveApiKey(inputKey?: string): string {
  const apiKey = inputKey || process.env.APIFOX_API_KEY || '';
  if (!apiKey) {
    throw new ValidationError('未提供 API Key，且环境变量 APIFOX_API_KEY 未设置');
  }
  return apiKey;
}

/**
 * 检查是否已配置默认 API Key
 */
export function hasDefaultApiKey(): boolean {
  return !!process.env.APIFOX_API_KEY;
}