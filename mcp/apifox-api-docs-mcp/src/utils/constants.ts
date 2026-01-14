/**
 * 常量定义
 */

export const API_TIMEOUT = {
  MIN: 1000,
  MAX: 60000,
  DEFAULT: 10000
} as const;

export const API_RETRIES = {
  MIN: 0,
  MAX: 5,
  DEFAULT: 2
} as const;

/**
 * 配置默认值
 */
export const CONFIG_DEFAULTS = {
  BASE_URL: 'https://apifox.evanfang.com.cn',
  TIMEOUT: API_TIMEOUT.DEFAULT,
  RETRIES: API_RETRIES.DEFAULT,
  NODE_ENV: 'production',
} as const;

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const UUID_EXTRACTION_PATTERN = /([a-f0-9-]{36})/i;

export const API_KEY_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 1000,
  API_ID_MIN_LENGTH: 1,
  API_ID_MAX_LENGTH: 100
} as const;