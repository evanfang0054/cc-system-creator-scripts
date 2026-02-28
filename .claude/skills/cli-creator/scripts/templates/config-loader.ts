/**
 * 配置加载器
 *
 * 支持多层级配置加载，优先级从高到低:
 * 1. CLI 标志参数 (最高优先级)
 * 2. 环境变量
 * 3. 项目配置 (.clirc, package.json)
 * 4. 用户配置 (~/.clirc, ~/.config/)
 * 5. 系统配置 (/etc/)
 * 6. 默认值 (最低优先级)
 */

import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';
import * as os from 'os';
import * as path from 'path';
import { getEnvInfo } from './utils.js';

/**
 * 配置选项接口
 */
export interface ConfigOptions {
  /**
   * 是否使用同步加载 (默认: false)
   */
  sync?: boolean;

  /**
   * 配置文件名称 (默认: 'cli-name')
   */
  name?: string;

  /**
   * 是否忽略环境变量 (默认: false)
   */
  ignoreEnv?: boolean;
}

/**
 * 加载配置的默认选项
 */
const DEFAULT_OPTIONS: ConfigOptions = {
  sync: false,
  name: '',
  ignoreEnv: false,
};

/**
 * 加载配置
 *
 * @param schema - Zod 配置架构
 * @param cliFlags - CLI 标志参数
 * @param options - 加载选项
 * @returns 验证后的配置对象
 */
export async function loadConfig<T extends z.ZodType>(
  schema: T,
  cliFlags: z.infer<T> = {} as z.infer<T>,
  options: ConfigOptions = {}
): Promise<z.infer<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 1. 默认配置 (最低优先级)
  const defaults = getDefaultConfig<T>();

  // 2. 系统配置
  const system = await loadSystemConfig(opts.name);

  // 3. 用户配置
  const user = await loadUserConfig(opts.name);

  // 4. 项目配置
  const project = await loadProjectConfig(opts.name);

  // 5. 环境变量
  const env = opts.ignoreEnv ? {} : loadEnvConfig(opts.name);

  // 6. CLI 标志 (最高优先级)
  const flags = cliFlags;

  // 合并配置 (优先级从低到高)
  const merged = {
    ...defaults,
    ...(system || {}),
    ...(user || {}),
    ...(project || {}),
    ...env,
    ...flags,
  };

  // 验证并返回配置
  return schema.parse(merged);
}

/**
 * 同步加载配置
 *
 * @param schema - Zod 配置架构
 * @param cliFlags - CLI 标志参数
 * @param options - 加载选项
 * @returns 验证后的配置对象
 */
export function loadConfigSync<T extends z.ZodType>(
  schema: T,
  cliFlags: z.infer<T> = {} as z.infer<T>,
  options: ConfigOptions = {}
): z.infer<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options, sync: true };

  // 1. 默认配置
  const defaults = getDefaultConfig<T>();

  // 2. 系统配置 (同步)
  const system = loadSystemConfigSync(opts.name);

  // 3. 用户配置 (同步)
  const user = loadUserConfigSync(opts.name);

  // 4. 项目配置 (同步)
  const project = loadProjectConfigSync(opts.name);

  // 5. 环境变量
  const env = opts.ignoreEnv ? {} : loadEnvConfig(opts.name);

  // 6. CLI 标志
  const flags = cliFlags;

  // 合并配置
  const merged = {
    ...defaults,
    ...(system || {}),
    ...(user || {}),
    ...(project || {}),
    ...env,
    ...flags,
  };

  // 验证并返回配置
  return schema.parse(merged);
}

/**
 * 获取默认配置
 */
function getDefaultConfig<T>(): any {
  return {};
}

/**
 * 加载系统配置
 *
 * 搜索位置: /etc/cli-name/config.yml
 */
async function loadSystemConfig(name: string): Promise<any> {
  if (!name) {
    return null;
  }

  const explorer = cosmiconfig(name, {
    searchPlaces: [
      `/etc/${name}/config.yml`,
      `/etc/${name}/config.yaml`,
      `/etc/${name}/config.json`,
      `/etc/${name}rc`,
    ],
  });

  try {
    const result = await explorer.load('/etc');
    return result?.config;
  } catch {
    return null;
  }
}

/**
 * 加载系统配置 (同步)
 */
function loadSystemConfigSync(name: string): any {
  if (!name) {
    return null;
  }

  const explorer = cosmiconfigSync(name, {
    searchPlaces: [
      `/etc/${name}/config.yml`,
      `/etc/${name}/config.yaml`,
      `/etc/${name}/config.json`,
      `/etc/${name}rc`,
    ],
  });

  try {
    const result = explorer.load('/etc');
    return result?.config;
  } catch {
    return null;
  }
}

/**
 * 加载用户配置
 *
 * 搜索位置: ~/.cli-namerc, ~/.config/cli-name/config.yml
 */
async function loadUserConfig(name: string): Promise<any> {
  if (!name) {
    return null;
  }

  const explorer = cosmiconfig(name, {
    searchPlaces: [
      `.${name}rc`,
      `.${name}rc.yml`,
      `.${name}rc.yaml`,
      `.${name}rc.json`,
      `${name}.config.js`,
    ],
  });

  try {
    const homeDir = os.homedir();
    const result = await explorer.search(homeDir);
    return result?.config;
  } catch {
    return null;
  }
}

/**
 * 加载用户配置 (同步)
 */
function loadUserConfigSync(name: string): any {
  if (!name) {
    return null;
  }

  const explorer = cosmiconfigSync(name, {
    searchPlaces: [
      `.${name}rc`,
      `.${name}rc.yml`,
      `.${name}rc.yaml`,
      `.${name}rc.json`,
      `${name}.config.js`,
    ],
  });

  try {
    const homeDir = os.homedir();
    const result = explorer.search(homeDir);
    return result?.config;
  } catch {
    return null;
  }
}

/**
 * 加载项目配置
 *
 * 搜索位置: .clirc, package.json, cli-name.config.js
 */
async function loadProjectConfig(name: string): Promise<any> {
  if (!name) {
    return null;
  }

  const explorer = cosmiconfig(name);

  try {
    const result = await explorer.search();
    return result?.config;
  } catch {
    return null;
  }
}

/**
 * 加载项目配置 (同步)
 */
function loadProjectConfigSync(name: string): any {
  if (!name) {
    return null;
  }

  const explorer = cosmiconfigSync(name);

  try {
    const result = explorer.search();
    return result?.config;
  } catch {
    return null;
  }
}

/**
 * 加载环境变量配置
 *
 * 将环境变量转换为配置对象
 * 环境变量命名规则: CLI_NAME_<KEY>
 * 例如: MY_CLI_DEBUG=true -> { debug: true }
 */
function loadEnvConfig(name: string): Record<string, any> {
  const env: Record<string, any> = {};
  const prefix = name ? name.toUpperCase().replace(/-/g, '_') : 'CLI';

  // 查找所有匹配的环境变量
  for (const key in process.env) {
    if (key.startsWith(prefix + '_')) {
      const configKey = key.slice(prefix.length + 1).toLowerCase();
      const value = process.env[key];

      // 转换类型
      env[configKey] = parseEnvValue(value);
    }
  }

  return env;
}

/**
 * 解析环境变量值
 *
 * 自动转换字符串为合适的类型
 */
function parseEnvValue(value: string): any {
  // 布尔值
  if (value === 'true') return true;
  if (value === 'false') return false;

  // 数字
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);

  // JSON
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  // 默认返回字符串
  return value;
}

/**
 * 创建配置验证架构
 *
 * 辅助函数，用于快速创建 Zod 配置架构
 */
export function createConfigSchema<T extends Record<string, z.ZodTypeAny>>(
  shape: T
): z.ZodObject<T> {
  return z.object(shape);
}

/**
 * 验证配置
 *
 * 验证配置对象是否符合架构
 */
export function validateConfig<T extends z.ZodType>(
  schema: T,
  config: unknown
): { success: boolean; data?: z.infer<T>; errors?: string[] } {
  const result = schema.safeParse(config);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
    };
  }
}

/**
 * 获取配置搜索路径
 *
 * 返回所有配置文件的搜索路径，用于调试
 */
export function getConfigSearchPaths(name: string): string[] {
  const homeDir = os.homedir();
  const cwd = process.cwd();

  return [
    // 系统级
    `/etc/${name}/config.yml`,
    `/etc/${name}/config.yaml`,
    `/etc/${name}/config.json`,
    `/etc/${name}rc`,

    // 用户级
    path.join(homeDir, `.${name}rc`),
    path.join(homeDir, `.${name}rc.yml`),
    path.join(homeDir, `.${name}rc.yaml`),
    path.join(homeDir, `.${name}rc.json`),
    path.join(homeDir, '.config', name, 'config.yml'),
    path.join(homeDir, '.config', name, 'config.yaml'),
    path.join(homeDir, '.config', name, 'config.json'),

    // 项目级
    path.join(cwd, `.${name}rc`),
    path.join(cwd, `.${name}rc.yml`),
    path.join(cwd, `.${name}rc.yaml`),
    path.join(cwd, `.${name}rc.json`),
    path.join(cwd, `${name}.config.js`),
    path.join(cwd, `${name}.config.ts`),
    path.join(cwd, 'package.json'),
  ];
}

/**
 * 显示配置调试信息
 *
 * 显示所有配置层级的加载状态
 */
export async function debugConfigLoad(
  name: string,
  options: ConfigOptions = {}
): Promise<void> {
  const envInfo = getEnvInfo();
  console.log('\n=== 配置加载调试信息 ===');
  console.log(`CLI 名称: ${name || '(未指定)'}`);
  console.log(`环境: ${JSON.stringify(envInfo, null, 2)}`);
  console.log('');

  // 1. 默认配置
  console.log('1. 默认配置:');
  console.log('  (内置默认值)');

  // 2. 系统配置
  const system = await loadSystemConfig(name);
  console.log('\n2. 系统配置:');
  if (system) {
    console.log('  ✓ 已加载:', JSON.stringify(system, null, 2));
  } else {
    console.log('  ✗ 未找到');
  }

  // 3. 用户配置
  const user = await loadUserConfig(name);
  console.log('\n3. 用户配置:');
  if (user) {
    console.log('  ✓ 已加载:', JSON.stringify(user, null, 2));
  } else {
    console.log('  ✗ 未找到');
  }

  // 4. 项目配置
  const project = await loadProjectConfig(name);
  console.log('\n4. 项目配置:');
  if (project) {
    console.log('  ✓ 已加载:', JSON.stringify(project, null, 2));
  } else {
    console.log('  ✗ 未找到');
  }

  // 5. 环境变量
  console.log('\n5. 环境变量:');
  const env = loadEnvConfig(name);
  if (Object.keys(env).length > 0) {
    console.log('  ✓ 已加载:', JSON.stringify(env, null, 2));
  } else {
    console.log('  ✗ 未找到');
  }

  // 搜索路径
  console.log('\n配置文件搜索路径:');
  const paths = getConfigSearchPaths(name);
  paths.forEach(p => console.log(`  • ${p}`));

  console.log('\n' + '='.repeat(50) + '\n');
}
