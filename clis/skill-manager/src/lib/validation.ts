import type { Platform } from '../types/index.js';
import { ValidationError } from './errors.js';

/**
 * 验证平台参数
 *
 * @throws {ValidationError} 如果平台参数无效
 */
export function validatePlatform(platform: string): Platform {
  const validPlatforms: Platform[] = [
    'claude-code',
    'cursor',
    'trae',
    'vscode',
    'windsurf',
  ];

  if (validPlatforms.includes(platform as Platform)) {
    return platform as Platform;
  }

  throw new ValidationError(
    `无效的平台参数: "${platform}"`,
    [
      `有效选项: ${validPlatforms.join(', ')}`,
      '使用 --platform <type> 指定平台',
      '示例: --platform claude-code',
    ],
  );
}

/**
 * 验证作用域参数
 *
 * @throws {ValidationError} 如果作用域参数无效
 */
export function validateScope(scope: string): 'global' | 'project' | 'all' {
  const validScopes = ['global', 'project', 'all'];

  if (validScopes.includes(scope)) {
    return scope as 'global' | 'project' | 'all';
  }

  throw new ValidationError(
    `无效的作用域参数: "${scope}"`,
    [
      `有效选项: ${validScopes.join(', ')}`,
      '使用 --scope <scope> 指定作用域',
      '示例: --scope global',
    ],
  );
}

/**
 * 验证 URL 格式
 *
 * @throws {ValidationError} 如果 URL 格式无效
 */
export function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new ValidationError(
      `无效的 URL 格式: "${url}"`,
      [
        '请提供完整的 URL',
        '示例: https://github.com/username/repo',
        '示例: https://gitlab.com/username/repo',
      ],
    );
  }
}

/**
 * 验证分支名称
 *
 * @throws {ValidationError} 如果分支名称无效
 */
export function validateBranch(branch: string): void {
  if (!branch || branch.trim().length === 0) {
    throw new ValidationError(
      '分支名称不能为空',
      [
        '使用 --branch <name> 指定分支',
        '示例: --branch main',
        '示例: --branch develop',
      ],
    );
  }

  // Git 分支名称规则
  const branchRegex = /^(?!\/|\.\.|.*[\.\s].*@|.*\.\.|.*\/\.)(?!.*\/\.$)[a-zA-Z0-9\-/_\.]+$/;

  if (!branchRegex.test(branch)) {
    throw new ValidationError(
      `无效的分支名称: "${branch}"`,
      [
        '分支名称只能包含字母、数字、连字符(-)、下划线(_)、点(.)和斜杠(/)',
        '不能以点(.)、斜杠(/)开头或结尾',
        '不能包含连续的点(..)',
        '不能包含空格或特殊字符',
      ],
    );
  }
}

/**
 * 获取有效的平台列表
 */
export function getValidPlatforms(): Platform[] {
  return ['claude-code', 'cursor', 'trae', 'vscode', 'windsurf'];
}

/**
 * 获取有效的作用域列表
 */
export function getValidScopes(): ('global' | 'project' | 'all')[] {
  return ['global', 'project', 'all'];
}
