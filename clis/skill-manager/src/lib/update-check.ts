/**
 * 版本检查工具
 *
 * 提供:
 * - 非阻塞版本检查
 * - Node.js 版本检查
 * - 自动检查更新
 */

import { createRequire } from 'node:module';
import semver from 'semver';
import { logger } from './logger.js';
import { isDebug } from './utils.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');

/**
 * 当前版本
 */
export const CURRENT_VERSION = packageJson.version as string;

/**
 * 最小 Node.js 版本
 */
export const MIN_NODE_VERSION = packageJson.engines.node.replace('>=', '') as string;

/**
 * 版本信息接口
 */
export interface VersionInfo {
  current: string;
  latest: string;
  updateAvailable: boolean;
}

/**
 * 检查 Node.js 版本
 *
 * @throws {Error} 如果 Node.js 版本过低
 */
export function checkNodeVersion(): void {
  const nodeVersion = process.version.slice(1); // 移除 'v' 前缀
  const minVersion = MIN_NODE_VERSION;

  if (!isVersionSatisfied(nodeVersion, minVersion)) {
    throw new Error(
      `Node.js 版本过低。当前: ${nodeVersion}, 要求: >=${minVersion}`,
    );
  }

  logger.debug(`Node.js 版本检查通过: ${nodeVersion} >= ${minVersion}`);
}

/**
 * 检查版本是否满足要求
 */
function isVersionSatisfied(current: string, required: string): boolean {
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);

  for (let i = 0; i < requiredParts.length; i++) {
    if (currentParts[i] > requiredParts[i]) {
      return true;
    }
    if (currentParts[i] < requiredParts[i]) {
      return false;
    }
  }

  return true;
}

/**
 * 非阻塞检查更新
 *
 * 在后台检查新版本,不阻塞主流程
 */
export async function checkForUpdates(): Promise<void> {
  if (isDebug()) {
    logger.debug('跳过版本检查 (DEBUG 模式)');
    return;
  }

  // 非阻塞检查
  setImmediate(async () => {
    try {
      const versionInfo = await fetchLatestVersion();

      if (versionInfo.updateAvailable) {
        logger.newline();
        logger.info(
          `发现新版本: ${versionInfo.latest} (当前: ${versionInfo.current})`,
        );
        logger.info('运行以下命令更新:');
        logger.info(
          `  npm install -g ${packageJson.name}@${versionInfo.latest}`,
        );
        logger.info('或');
        logger.info(`  pnpm install -g ${packageJson.name}@${versionInfo.latest}`);
        logger.newline();
      }
    } catch (error) {
      // 静默失败,不影响主流程
      logger.debug(`版本检查失败: ${error}`);
    }
  });
}

/**
 * 获取最新版本
 *
 * 从 npm registry 获取最新版本信息
 */
async function fetchLatestVersion(): Promise<VersionInfo> {
  const packageName = packageJson.name;

  try {
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`,
      {
        signal: AbortSignal.timeout(5000), // 5 秒超时
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as { version: string };
    const latest = data.version;

    return {
      current: CURRENT_VERSION,
      latest,
      updateAvailable: semver.gt(latest, CURRENT_VERSION),
    };
  } catch (error) {
    // 详细的错误日志
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        logger.debug('版本检查超时 (5秒)');
      } else if (error.message.includes('ECONNREFUSED')) {
        logger.debug('网络连接被拒绝,请检查网络设置');
      } else if (error.message.includes('ENOTFOUND')) {
        logger.debug('DNS 解析失败,请检查网络连接');
      } else if (error.message.startsWith('HTTP')) {
        logger.debug(`npm registry 返回错误: ${error.message}`);
      } else {
        logger.debug(`版本检查失败: ${error.message}`);
      }
    } else {
      logger.debug(`版本检查失败: ${String(error)}`);
    }

    // 返回当前版本,表示无更新
    return {
      current: CURRENT_VERSION,
      latest: CURRENT_VERSION,
      updateAvailable: false,
    };
  }
}

/**
 * 获取当前版本
 */
export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}

/**
 * 获取最小 Node.js 版本
 */
export function getMinNodeVersion(): string {
  return MIN_NODE_VERSION;
}
