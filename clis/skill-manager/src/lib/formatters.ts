/**
 * 输出格式化工具
 *
 * 提供多种输出格式:
 * - 表格格式 (使用 cli-table3)
 * - JSON 格式
 * - 列表格式
 *
 * 自动适配 CI 环境
 */

import Table from 'cli-table3';
import { isCI, supportsColor } from './utils.js';

/**
 * 输出格式类型
 */
export type OutputFormat = 'text' | 'table' | 'json' | 'list';

/**
 * 表格数据接口
 */
export interface TableData {
  headers: string[];
  rows: string[][];
}

/**
 * 格式化为表格
 *
 * 在 CI 环境中自动降级为简单文本
 */
export function formatTable(data: TableData): string {
  // CI 环境中使用简单格式
  if (isCI()) {
    return formatSimpleTable(data);
  }

  // 使用 cli-table3
  const table = new Table({
    head: data.headers,
    style: {
      head: supportsColor() ? ['cyan', 'bold'] : [],
      border: supportsColor() ? ['grey'] : ['white'],
    },
  });

  table.push(...data.rows);
  return table.toString();
}

/**
 * 格式化为简单表格 (CI 环境降级)
 */
function formatSimpleTable(data: TableData): string {
  const lines: string[] = [];

  // 表头
  lines.push(data.headers.join(' | '));
  lines.push(Array(data.headers.length).join('---'));

  // 数据行
  for (const row of data.rows) {
    lines.push(row.join(' | '));
  }

  return lines.join('\n');
}

/**
 * 格式化为 JSON
 */
export function formatJSON(data: unknown, pretty: boolean = true): string {
  if (pretty) {
    return JSON.stringify(data, null, 2);
  }
  return JSON.stringify(data);
}

/**
 * 格式化为列表
 */
export function formatList(items: string[], numbered: boolean = false): string {
  if (numbered) {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
  }
  return items.map((item) => `• ${item}`).join('\n');
}

/**
 * 格式化为键值对列表
 */
export function formatKeyValue(pairs: Record<string, string>): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(pairs)) {
    lines.push(`${key}: ${value}`);
  }

  return lines.join('\n');
}

/**
 * 格式化技能列表
 */
export function formatSkillsList(
  skills: Array<{
    name: string;
    platform: string;
    description: string;
    version?: string;
  }>,
  format: OutputFormat = 'text',
): string {
  switch (format) {
    case 'json':
      return formatJSON(skills);

    case 'table':
      return formatTable({
        headers: ['名称', '平台', '描述', '版本'],
        rows: skills.map((s) => [
          s.name,
          s.platform,
          s.description,
          s.version || 'N/A',
        ]),
      });

    case 'list':
      return skills
        .map((s) => `• ${s.name} (${s.platform}): ${s.description}`)
        .join('\n');

    case 'text':
    default:
      // 按平台分组
      const byPlatform: Record<string, typeof skills> = {};
      for (const skill of skills) {
        if (!byPlatform[skill.platform]) {
          byPlatform[skill.platform] = [];
        }
        byPlatform[skill.platform].push(skill);
      }

      const lines: string[] = [];
      for (const [platform, platformSkills] of Object.entries(byPlatform)) {
        lines.push(`\n${platform.toUpperCase()}`);
        lines.push('─'.repeat(50));
        for (const skill of platformSkills) {
          lines.push(`  ${skill.name}`);
          lines.push(`    ${skill.description}`);
          if (skill.version) {
            lines.push(`    版本: ${skill.version}`);
          }
        }
      }
      return lines.join('\n');
  }
}

/**
 * 验证输出格式
 */
export function validateOutputFormat(format: string): OutputFormat {
  const validFormats: OutputFormat[] = ['text', 'table', 'json', 'list'];

  // "default" 是 "text" 的同义词
  if (format === 'default') {
    return 'text';
  }

  if (validFormats.includes(format as OutputFormat)) {
    return format as OutputFormat;
  }

  throw new Error(
    `无效的输出格式: "${format}". 有效选项: ${validFormats.join(', ')}`,
  );
}
