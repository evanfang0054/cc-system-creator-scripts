/**
 * 错误消息格式化工具
 */

import { z } from 'zod';

/**
 * 成功响应格式化
 */
export function formatSuccessResponse(
  title: string,
  data: string,
  metadata: Record<string, string | number>
) {
  const metadataText = Object.entries(metadata)
    .map(([key, value]) => `**${key}**: ${value}`)
    .join('\n');

  const dataText = data.trim() ? `\n\n---\n\n${data}` : '';

  return {
    content: [{
      type: 'text' as const,
      text: `✅ ${title}\n\n${metadataText}${dataText}`
    }]
  };
}

/**
 * 错误响应格式化
 */
export function formatErrorResponse(
  toolName: string,
  errorMessage: string,
  suggestions?: string[]
) {
  const suggestionsText = suggestions
    ? `\n\n**建议**:\n${suggestions.map(s => `- ${s}`).join('\n')}`
    : '';

  return {
    content: [{
      type: 'text' as const,
      text: `❌ ${toolName}\n\n**错误**: ${errorMessage}${suggestionsText}`
    }]
  };
}

/**
 * Zod 验证错误格式化
 */
export function formatZodError(error: z.ZodError): string {
  return error.errors
    .map(e => `- ${e.path.join('.')}: ${e.message}`)
    .join('\n');
}

/**
 * 通用服务器错误格式化
 */
export function formatServerError(toolName: string, errorMessage: string) {
  return {
    content: [{
      type: 'text' as const,
      text: `❌ 服务器错误\n\n**工具**: ${toolName}\n**错误**: ${errorMessage}\n\n请检查输入参数或稍后重试。`
    }]
  };
}