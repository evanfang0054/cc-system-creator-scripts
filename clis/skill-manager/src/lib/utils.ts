/**
 * 环境检测工具函数
 *
 * 提供环境检测能力,支持:
 * - CI 环境检测
 * - 颜色支持检测 (NO_COLOR 兼容)
 * - 详细模式检测
 * - 调试模式检测
 */

/**
 * 检测是否在 CI 环境中运行
 *
 * 检查常见的 CI 环境变量
 */
export function isCI(): boolean {
  return (
    process.env.CI === 'true' ||
    process.env.CI === '1' ||
    process.env.CONTINUOUS_INTEGRATION === 'true' ||
    process.env.CONTINUOUS_INTEGRATION === '1' ||
    // GitHub Actions
    process.env.GITHUB_ACTIONS === 'true' ||
    // GitLab CI
    process.env.GITLAB_CI === 'true' ||
    // Travis CI
    process.env.TRAVIS === 'true' ||
    // CircleCI
    process.env.CIRCLECI === 'true' ||
    // Jenkins
    process.env.JENKINS_URL !== undefined ||
    // Azure Pipelines
    process.env.TF_BUILD === 'true' ||
    // Bitbucket Pipelines
    process.env.BITBUCKET_BUILD_NUMBER !== undefined ||
    // Netlify
    process.env.NETLIFY === 'true' ||
    // Vercel
    process.env.VERCEL === '1' ||
    // AWS CodeBuild
    process.env.CODEBUILD_BUILD_ID !== undefined ||
    // Google Cloud Build
    process.env.PROJECT_ID !== undefined && process.env.BUILD_ID !== undefined
  );
}

/**
 * 检测是否在 TTY 环境中运行
 *
 * TTY 环境支持交互式功能,如进度条、动画等
 */
export function isTTY(): boolean {
  return process.stdout.isTTY === true;
}

/**
 * 检测是否支持颜色输出
 *
 * 遵循 NO_COLOR 标准 (https://no-color.org/)
 * 自动检测 TTY 环境和 CI 环境
 */
export function supportsColor(): boolean {
  // 检查 NO_COLOR 环境变量
  if (process.env.NO_COLOR) {
    return false;
  }

  // 检查是否在 TTY 中
  const isTTY = process.stdout.isTTY;

  // CI 环境通常支持颜色,但某些可能不支持
  if (isCI()) {
    // 大多数 CI 支持颜色,返回 true
    return true;
  }

  // 非交互式环境通常不支持颜色
  return isTTY === true;
}

/**
 * 检测是否在详细模式
 *
 * 检查 VERBOSE 或 DEBUG 环境变量
 */
export function isVerbose(): boolean {
  return (
    process.env.VERBOSE === 'true' ||
    process.env.VERBOSE === '1' ||
    process.env.DEBUG === 'true' ||
    process.env.DEBUG === '1'
  );
}

/**
 * 检测是否在调试模式
 *
 * 检查 DEBUG 环境变量
 */
export function isDebug(): boolean {
  return process.env.DEBUG === 'true' || process.env.DEBUG === '1';
}

/**
 * 获取当前环境信息
 *
 * 返回环境检测结果的摘要
 */
export function getEnvironmentInfo(): {
  isCI: boolean;
  supportsColor: boolean;
  isVerbose: boolean;
  isDebug: boolean;
  isTTY: boolean;
} {
  return {
    isCI: isCI(),
    supportsColor: supportsColor(),
    isVerbose: isVerbose(),
    isDebug: isDebug(),
    isTTY: process.stdout.isTTY === true,
  };
}
