/**
 * 环境检测工具
 *
 * 检测运行环境,适配不同场景 (CI/CD, TTY, 调试模式等)
 */

/**
 * 检测是否在 CI 环境中运行
 *
 * CI 环境特征:
 * - CI=true 环境变量
 * - 不支持交互式输入 (!process.stdout.isTTY)
 * - 常见的 CI 系统环境变量
 */
export function isCI(): boolean {
  return (
    process.env.CI === 'true' ||
    process.env.CONTINUOUS_INTEGRATION === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.TRAVIS === 'true' ||
    process.env.JENKINS === 'true' ||
    process.env.GITLAB_CI === 'true' ||
    process.env.CIRCLECI === 'true' ||
    process.env.BITBUCKET_BUILD_NUMBER !== undefined ||
    process.env.APPVEYOR === 'true' ||
    process.env.CODEBUILD_BUILD_ID !== undefined ||
    !process.stdout.isTTY
  );
}

/**
 * 检测是否支持彩色输出
 *
 * 支持彩色的条件:
 * - 不在 CI 环境中
 * - stdout 是 TTY
 * - 未设置 NO_COLOR 环境变量
 *
 * 参考: https://no-color.org/
 */
export function supportsColor(): boolean {
  return !isCI() && process.stdout.isTTY && process.env.NO_COLOR !== '1';
}

/**
 * 检测是否在调试模式
 *
 * 调试模式特征:
 * - DEBUG=true 环境变量
 * - VERBOSE=true 环境变量
 */
export function isDebug(): boolean {
  return process.env.DEBUG === 'true' || process.env.VERBOSE === 'true';
}

/**
 * 检测是否在详细模式
 */
export function isVerbose(): boolean {
  return process.env.VERBOSE === 'true' || isDebug();
}

/**
 * 获取环境信息
 *
 * 返回当前运行环境的详细信息,用于调试和日志
 */
export function getEnvInfo(): {
  ci: boolean;
  color: boolean;
  debug: boolean;
  verbose: boolean;
  tty: boolean;
  platform: string;
  nodeVersion: string;
} {
  return {
    ci: isCI(),
    color: supportsColor(),
    debug: isDebug(),
    verbose: isVerbose(),
    tty: process.stdout.isTTY,
    platform: process.platform,
    nodeVersion: process.version,
  };
}

/**
 * 检测是否在 Windows 环境
 */
export function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * 检测是否在 macOS 环境
 */
export function isMac(): boolean {
  return process.platform === 'darwin';
}

/**
 * 检测是否在 Linux 环境
 */
export function isLinux(): boolean {
  return process.platform === 'linux';
}

/**
 * 检测是否在终端环境中运行 (非管道、非重定向)
 */
export function isTerminal(): boolean {
  return process.stdout.isTTY && process.stdin.isTTY;
}

/**
 * 获取当前用户的主目录
 */
export function getHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || '';
}

/**
 * 检测环境变量是否设置
 */
export function hasEnv(key: string): boolean {
  return process.env[key] !== undefined;
}

/**
 * 获取环境变量值 (带默认值)
 */
export function getEnv(key: string, defaultValue = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * 检测是否以 root/administrator 权限运行
 */
export function isPrivileged(): boolean {
  if (isWindows()) {
    // Windows: 检查是否具有管理员权限
    return process.env.USERDOMAIN === process.env.COMPUTERNAME;
  } else {
    // Unix-like: 检查是否为 root 用户
    return process.getuid && process.getuid() === 0;
  }
}
