/**
 * 配置文件加载器
 *
 * 提供配置文件管理功能:
 * - 6 层配置加载优先级
 * - cosmiconfig 规范支持
 * - Zod 类型安全验证
 *
 * 配置优先级 (从高到低):
 * 1. CLI 参数
 * 2. 环境变量
 * 3. 项目配置文件
 * 4. 用户配置文件
 * 5. 全局配置文件
 * 6. 默认配置
 */

import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';
import { logger } from './logger.js';
import { ConfigError } from './errors.js';

/**
 * 配置 Schema
 */
export const ConfigSchema = z.object({
  // 默认平台
  defaultPlatform: z.enum(['claude-code', 'cursor', 'trae', 'vscode', 'windsurf']).optional(),
  // 默认分支
  defaultBranch: z.string().optional(),
  // Git 仓库 URL
  defaultRepo: z.string().url().optional(),
  // 是否自动检查更新
  checkUpdates: z.boolean().optional(),
  // 输出格式
  outputFormat: z.enum(['text', 'table', 'json', 'list']).optional(),
  // 并发数
  concurrency: z.number().min(1).max(10).optional(),
  // 调试模式
  debug: z.boolean().optional(),
  // 详细模式
  verbose: z.boolean().optional(),
});

/**
 * 配置类型
 */
export type Config = z.infer<typeof ConfigSchema>;

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Config = {
  defaultPlatform: 'claude-code',
  defaultBranch: 'main',
  checkUpdates: true,
  outputFormat: 'text',
  concurrency: 3,
  debug: false,
  verbose: false,
};

/**
 * 配置搜索路径
 */
export function getConfigSearchPlaces(): string[] {
  return [
    '.skillmanagerrc',
    '.skillmanagerrc.json',
    '.skillmanagerrc.yaml',
    '.skillmanagerrc.yml',
    '.skillmanagerrc.ts',
    '.skillmanagerrc.js',
    '.skill-manager.config.ts',
    '.skill-manager.config.js',
    'skill-manager.config.ts',
    'skill-manager.config.js',
    'package.json',
  ];
}

/**
 * 加载配置文件
 *
 * @param searchFrom 搜索起始路径
 * @returns 配置对象
 */
export async function loadConfig(
  searchFrom: string = process.cwd(),
): Promise<Config> {
  try {
    const explorer = cosmiconfig('skill-manager', {
      searchPlaces: getConfigSearchPlaces(),
    });

    const result = await explorer.search(searchFrom);

    if (result) {
      logger.debug(`找到配置文件: ${result.filepath}`);

      // 验证配置
      const validatedConfig = ConfigSchema.parse(result.config);

      return { ...DEFAULT_CONFIG, ...validatedConfig };
    }

    logger.debug('未找到配置文件,使用默认配置');
    return DEFAULT_CONFIG;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ConfigError(
        '配置文件格式错误',
        error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      );
    }

    throw new ConfigError(
      `加载配置文件失败: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 获取环境变量配置
 *
 * 从环境变量读取配置
 */
export function getEnvConfig(): Partial<Config> {
  const config: Partial<Config> = {};

  if (process.env.SKILL_MANAGER_DEFAULT_PLATFORM) {
    config.defaultPlatform = process.env.SKILL_MANAGER_DEFAULT_PLATFORM as Config['defaultPlatform'];
  }

  if (process.env.SKILL_MANAGER_DEFAULT_BRANCH) {
    config.defaultBranch = process.env.SKILL_MANAGER_DEFAULT_BRANCH;
  }

  if (process.env.SKILL_MANAGER_DEFAULT_REPO) {
    config.defaultRepo = process.env.SKILL_MANAGER_DEFAULT_REPO;
  }

  if (process.env.SKILL_MANAGER_CHECK_UPDATES) {
    config.checkUpdates = process.env.SKILL_MANAGER_CHECK_UPDATES === 'true';
  }

  if (process.env.SKILL_MANAGER_OUTPUT_FORMAT) {
    config.outputFormat = process.env.SKILL_MANAGER_OUTPUT_FORMAT as Config['outputFormat'];
  }

  if (process.env.SKILL_MANAGER_CONCURRENCY) {
    config.concurrency = Number.parseInt(process.env.SKILL_MANAGER_CONCURRENCY, 10);
  }

  return config;
}

/**
 * 合并配置
 *
 * 按优先级合并多个配置源
 */
export function mergeConfigs(
  cliConfig: Partial<Config>,
  envConfig: Partial<Config>,
  fileConfig: Config,
): Config {
  return {
    ...fileConfig,
    ...envConfig,
    ...cliConfig,
  } as Config;
}

/**
 * 验证配置
 */
export function validateConfig(config: unknown): Config {
  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ConfigError(
        '配置验证失败',
        error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      );
    }
    throw error;
  }
}

/**
 * 获取配置目录路径
 */
export function getConfigDir(): string {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  return `${home}/.skill-manager`;
}

/**
 * 获取全局配置文件路径
 */
export function getGlobalConfigPath(): string {
  return `${getConfigDir()}/config.json`;
}

/**
 * 保存配置到全局文件
 */
export async function saveGlobalConfig(config: Config): Promise<void> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const configPath = getGlobalConfigPath();
  const configDir = getConfigDir();

  // 确保配置目录存在
  await fs.mkdir(configDir, { recursive: true });

  // 保存配置
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

  logger.info(`配置已保存到: ${configPath}`);
}

/**
 * 加载全局配置
 */
export async function loadGlobalConfig(): Promise<Config> {
  const fs = await import('node:fs/promises');

  const configPath = getGlobalConfigPath();

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content);

    return validateConfig(config);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.debug('全局配置文件不存在,使用默认配置');
      return DEFAULT_CONFIG;
    }

    throw new ConfigError(
      `加载全局配置失败: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
