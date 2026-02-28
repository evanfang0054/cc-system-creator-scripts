/**
 * 参数验证工具
 *
 * 提供常用参数验证函数,确保输入正确性
 */

/**
 * 验证平台参数
 */
export function validatePlatform(
  platform: string,
  validPlatforms: string[],
): boolean {
  return validPlatforms.includes(platform);
}

/**
 * 验证作用域参数
 */
export function validateScope(
  scope: string,
  validScopes: string[],
): boolean {
  return validScopes.includes(scope);
}

/**
 * 验证数字范围
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
): boolean {
  return value >= min && value <= max;
}

/**
 * 验证 URL 格式
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证文件路径存在
 */
export async function validatePath(path: string): Promise<boolean> {
  try {
    await import('fs/promises').then(fs => fs.access(path));
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取验证错误提示
 */
export function getValidationError(
  field: string,
  value: string,
  validOptions: string[],
): string {
  return `无效的 ${field} 参数: "${value}"\n有效选项: ${validOptions.join(', ')}`;
}
