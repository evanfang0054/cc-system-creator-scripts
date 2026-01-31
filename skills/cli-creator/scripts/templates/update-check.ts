/**
 * 版本检查
 *
 * 非阻塞地检查版本更新
 */

import { createRequire } from 'module';
import { supportsColor, isDebug } from './utils.js';

const require = createRequire(import.meta.url);

/**
 * 检查 npm 包更新
 *
 * 非阻塞地从 npm registry 检查是否有新版本
 */
export async function checkForUpdates(): Promise<void> {
  try {
    // 动态导入 package.json
    const pkg = require('../package.json');
    const currentVersion = pkg.version;

    // 非阻塞检查（不等待结果）
    fetch(`https://registry.npmjs.org/${pkg.name}/latest`)
      .then(res => res.json())
      .then(data => {
        if (data.version !== currentVersion) {
          const current = `v${currentVersion}`;
          const latest = `v${data.version}`;
          const message = `有可用更新: ${current} → ${latest}`;

          if (supportsColor()) {
            console.log('\n' + chalk.yellow('⚠') + ' ' + message);
            console.log(chalk.dim(`运行: npm install -g ${pkg.name}@latest`));
          } else {
            console.log('\n[UPDATE] ' + message);
            console.log(`运行: npm install -g ${pkg.name}@latest`);
          }
        }
      })
      .catch(() => {
        // 静默失败 - 不中断用户工作流
        if (isDebug()) {
          console.error('[DEBUG] 更新检查失败');
        }
      });
  } catch (error) {
    // 忽略错误 - 不影响正常使用
    if (isDebug()) {
      console.error('[DEBUG] 更新检查出错:', error);
    }
  }
}

/**
 * 检查 Node.js 版本
 *
 * 验证当前 Node.js 版本是否满足最低要求
 */
export function checkNodeVersion(minVersion: string): void {
  const currentNode = process.version;
  let semver: any;

  try {
    // 尝试导入 semver
    semver = require('semver');
  } catch {
    // 如果没有 semver，使用简单的版本比较
    checkNodeVersionSimple(minVersion, currentNode);
    return;
  }

  if (!semver.satisfies(currentNode, `>=${minVersion}`)) {
    console.error(`${process.argv[1] || 'CLI'} 需要 Node.js ${minVersion} 或更高版本`);
    console.error(`当前版本: ${currentNode}`);
    console.error(`\n请升级 Node.js: https://nodejs.org/`);
    process.exit(1);
  }
}

/**
 * 简单的 Node.js 版本检查 (无 semver 依赖)
 */
function checkNodeVersionSimple(minVersion: string, currentVersion: string): void {
  const parseVersion = (v: string): number[] => {
    return v.replace('v', '').split('.').map(Number);
  };

  const min = parseVersion(minVersion);
  const cur = parseVersion(currentVersion);

  for (let i = 0; i < 3; i++) {
    if (cur[i] > min[i]) return;
    if (cur[i] < min[i]) {
      console.error(`${process.argv[1] || 'CLI'} 需要 Node.js ${minVersion} 或更高版本`);
      console.error(`当前版本: ${currentVersion}`);
      console.error(`\n请升级 Node.js: https://nodejs.org/`);
      process.exit(1);
    }
  }
}

/**
 * 获取版本信息
 *
 * 返回当前版本和最新版本信息
 */
export async function getVersionInfo(): Promise<{
  current: string;
  latest?: string;
  hasUpdate: boolean;
}> {
  try {
    const pkg = require('../package.json');
    const currentVersion = pkg.version;

    const response = await fetch(`https://registry.npmjs.org/${pkg.name}/latest`);
    const data = await response.json();

    return {
      current: currentVersion,
      latest: data.version,
      hasUpdate: data.version !== currentVersion,
    };
  } catch {
    const pkg = require('../package.json');
    return {
      current: pkg.version,
      hasUpdate: false,
    };
  }
}

/**
 * 显示版本信息
 *
 * 格式化显示当前版本和其他信息
 */
export function displayVersionInfo(): void {
  try {
    const pkg = require('../package.json');
    const envInfo = getEnvInfo();

    console.log('');
    console.log(`${pkg.name} v${pkg.version}`);
    console.log(`Node.js ${envInfo.nodeVersion}`);
    console.log(`Platform: ${envInfo.platform}`);

    if (pkg.description) {
      console.log(`\n${pkg.description}`);
    }

    if (pkg.author) {
      console.log(`\nAuthor: ${pkg.author}`);
    }

    if (pkg.homepage) {
      console.log(`Homepage: ${pkg.homepage}`);
    }

    console.log('');
  } catch (error) {
    console.error('无法获取版本信息');
  }
}

/**
 * 检查依赖更新
 *
 * 检查生产依赖是否有更新
 */
export async function checkDependencyUpdates(): Promise<void> {
  try {
    const pkg = require('../package.json');
    const dependencies = pkg.dependencies || {};

    const updateInfo: Array<{ name: string; current: string; latest?: string }> = [];

    // 并行检查所有依赖
    await Promise.all(
      Object.entries(dependencies).map(async ([name, version]) => {
        try {
          const response = await fetch(`https://registry.npmjs.org/${name}/latest`);
          const data = await response.json();

          // 移除版本前缀 (^, ~, >=, etc.)
          const currentVersion = version.replace(/^[\^~>=<]/, '');

          if (data.version !== currentVersion) {
            updateInfo.push({
              name,
              current: currentVersion,
              latest: data.version,
            });
          }
        } catch {
          // 忽略单个包的错误
        }
      })
    );

    // 显示有更新的依赖
    if (updateInfo.length > 0) {
      console.log('\n依赖更新可用:');
      updateInfo.forEach(({ name, current, latest }) => {
        console.log(`  ${name}: ${current} → ${latest}`);
      });
      console.log(`\n运行: npm update`);
    }
  } catch (error) {
    // 静默失败
  }
}

/**
 * 获取环境信息
 */
function getEnvInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}

/**
 * 检查是否在支持的 Node.js 版本上运行
 *
 * 在 package.json 中指定 engines 字段时使用
 */
export function checkEngines(): boolean {
  try {
    const pkg = require('../package.json');
    const engines = pkg.engines;

    if (!engines || !engines.node) {
      return true;
    }

    // 检查 node 版本要求
    const nodeRange = engines.node;
    checkNodeVersion(nodeRange.replace(/^[\^~>=]/, ''));

    return true;
  } catch {
    return true;
  }
}
