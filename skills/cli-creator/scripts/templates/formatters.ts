/**
 * 输出格式化
 *
 * 支持多种输出格式: 文本、JSON、表格
 */

import cliTable from 'cli-table3';
import { isCI } from './utils.js';

/**
 * 表格格式化
 *
 * 使用 cli-table3 生成美观的表格
 */
export function formatTable(headers: string[], rows: string[][]): string {
  if (isCI()) {
    // CI 环境下使用简单文本格式
    let output = headers.join('\t') + '\n';
    output += rows.map(row => row.join('\t')).join('\n');
    return output;
  }

  const table = new cliTable({
    head: headers.map(h => ({
      content: h,
      hAlign: 'left',
      style: {
        head: [],
        border: ['grey'],
      },
    })),
    colWidths: headers.map(() => 20),
    style: {
      head: [],
      border: ['grey'],
    },
  });

  table.push(...rows);
  return table.toString();
}

/**
 * JSON 格式化
 *
 * 将对象格式化为 JSON 字符串
 */
export function formatJSON(data: unknown, pretty = true): string {
  return JSON.stringify(data, null, pretty ? 2 : 0);
}

/**
 * 列表格式化
 *
 * 将数组格式化为列表
 */
export function formatList(items: string[], options?: {
  bullet?: string;
  numbered?: boolean;
}): string {
  const bullet = options?.bullet || '•';
  const numbered = options?.numbered || false;

  if (numbered) {
    return items.map((item, index) => `  ${index + 1}. ${item}`).join('\n');
  }

  return items.map(item => `  ${bullet} ${item}`).join('\n');
}

/**
 * 键值对格式化
 *
 * 将对象格式化为键值对列表
 */
export function formatKeyValue(
  data: Record<string, any>,
  options?: {
    indent?: number;
    separator?: string;
  }
): string {
  const indent = options?.indent || 2;
  const separator = options?.separator || ':';

  const entries = Object.entries(data);
  const maxLength = Math.max(...entries.map(([key]) => key.length));

  return entries
    .map(([key, value]) => {
      const paddedKey = key.padEnd(maxLength);
      const indentStr = ' '.repeat(indent);
      return `${indentStr}${paddedKey} ${separator} ${value}`;
    })
    .join('\n');
}

/**
 * 树形格式化
 *
 * 将嵌套对象格式化为树形结构
 */
export function formatTree(
  data: Record<string, any>,
  options?: {
    indent?: number;
  }
): string {
  const indent = options?.indent || 2;

  let output = '';

  for (const [key, value] of Object.entries(data)) {
    output += `${' '.repeat(indent)}${key}`;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      output += '/\n';
      output += formatTree(value, { indent: indent + 2 });
    } else if (Array.isArray(value)) {
      output += ': [\n';
      value.forEach((item, index) => {
        output += `${' '.repeat(indent + 2)}[${index}] ${item}\n`;
      });
      output += `${' '.repeat(indent)}]\n`;
    } else {
      output += `: ${value}\n`;
    }
  }

  return output;
}

/**
 * 摘要格式化
 *
 * 格式化显示摘要信息
 */
export function formatSummary(summary: {
  title: string;
  details: Record<string, string>;
  stats?: Record<string, string | number>;
}): string {
  let output = `\n${summary.title}\n`;
  output += '='.repeat(summary.title.length) + '\n\n';

  if (Object.keys(summary.details).length > 0) {
    output += '详情:\n';
    output += formatKeyValue(summary.details, { indent: 2 });
    output += '\n';
  }

  if (summary.stats && Object.keys(summary.stats).length > 0) {
    output += '统计:\n';
    output += formatKeyValue(summary.stats, { indent: 2, separator: ':' });
    output += '\n';
  }

  return output;
}

/**
 * 颜色化表格
 *
 * 根据条件为表格单元格添加颜色
 */
export function formatColoredTable(
  headers: string[],
  rows: Array<Array<{ value: string; color?: string }>>
): string {
  if (isCI()) {
    // CI 环境下去除颜色
    const plainRows = rows.map(row => row.map(cell => cell.value));
    return formatTable(headers, plainRows);
  }

  // TODO: 实现带颜色的表格
  return formatTable(headers, rows.map(row => row.map(cell => cell.value)));
}

/**
 * 检查输出格式
 *
 * 从环境变量或选项中确定输出格式
 */
export function getOutputFormat(defaultFormat: 'text' | 'json' | 'table' = 'text'): 'text' | 'json' | 'table' {
  const envFormat = process.env.OUTPUT_FORMAT?.toLowerCase();

  if (envFormat && ['text', 'json', 'table'].includes(envFormat)) {
    return envFormat;
  }

  return defaultFormat;
}

/**
 * 根据格式输出数据
 *
 * 统一的输出接口，根据格式自动选择输出方法
 */
export function outputData<T>(
  data: T,
  format: 'text' | 'json' | 'table' = 'text',
  formatter?: (data: T) => string
): void {
  let output: string;

  switch (format) {
    case 'json':
      output = formatJSON(data);
      break;
    case 'table':
      // 如果数据是数组且第一项是对象，尝试表格格式化
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        const headers = Object.keys(data[0] as any);
        const rows = data.map(item => Object.values(item as any));
        output = formatTable(headers, rows);
      } else {
        output = formatJSON(data);
      }
      break;
    default: // text
      if (formatter) {
        output = formatter(data);
      } else {
        output = formatJSON(data);
      }
  }

  console.log(output);
}
