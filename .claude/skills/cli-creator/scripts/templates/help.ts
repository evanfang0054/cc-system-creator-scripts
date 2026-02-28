/**
 * 帮助文本工具
 *
 * 生成统一、友好的命令帮助文本
 */

import chalk from 'chalk';

/**
 * 帮助章节
 */
export interface HelpSection {
  title: string;
  content: string;
}

/**
 * 命令帮助配置
 */
export interface CommandHelp {
  usage: string;
  description: string;
  arguments?: HelpSection;
  options?: HelpSection;
  examples?: HelpSection;
  seeAlso?: string[];
}

/**
 * 选项配置
 */
export interface OptionHelp {
  flags: string;
  description: string;
  default?: string;
  deprecated?: boolean;
}

/**
 * 生成命令帮助文本
 *
 * 生成格式统一的命令帮助文档
 */
export function generateCommandHelp(help: CommandHelp): string {
  const sections: string[] = [];

  // 用法和描述
  sections.push(chalk.bold(help.usage));
  sections.push('');
  sections.push(help.description);
  sections.push('');

  // 参数
  if (help.arguments) {
    sections.push(chalk.bold.yellow('参数'));
    sections.push('');
    sections.push(help.arguments.content);
    sections.push('');
  }

  // 选项
  if (help.options) {
    sections.push(chalk.bold.yellow('选项'));
    sections.push('');
    sections.push(help.options.content);
    sections.push('');
  }

  // 示例
  if (help.examples) {
    sections.push(chalk.bold.yellow('示例'));
    sections.push('');
    sections.push(help.examples.content);
    sections.push('');
  }

  // 相关命令
  if (help.seeAlso && help.seeAlso.length > 0) {
    sections.push(chalk.bold.yellow('相关命令'));
    sections.push('');
    help.seeAlso.forEach(cmd => {
      sections.push(`  ${cmd}`);
    });
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * 生成选项说明文本
 *
 * 格式化选项列表，包含标志、描述和默认值
 */
export function generateOptionHelp(options: OptionHelp[]): string {
  return options.map(opt => {
    let line = `  ${chalk.cyan(opt.flags.padEnd(25))} ${opt.description}`;

    // 添加默认值
    if (opt.default !== undefined) {
      const defaultText = opt.default === '' ? '""' : opt.default;
      line += chalk.dim(` (默认: ${defaultText})`);
    }

    // 标记已弃用
    if (opt.deprecated) {
      line += ' ' + chalk.red('[已弃用]');
    }

    return line;
  }).join('\n');
}

/**
 * 生成参数说明文本
 */
export function generateArgumentHelp(arguments: Array<{
  name: string;
  description: string;
  required?: boolean;
}>): string {
  return arguments.map(arg => {
    const name = arg.required ? chalk.bold(arg.name) : chalk.dim(`[${arg.name}]`);
    let line = `  ${name.padEnd(20)} ${arg.description}`;

    if (!arg.required) {
      line += chalk.dim(' (可选)');
    }

    return line;
  }).join('\n');
}

/**
 * 生成示例文本
 */
export function generateExampleHelp(examples: string[]): string {
  return examples.map(ex => `  ${chalk.gray(ex)}`).join('\n');
}

/**
 * 生成子命令列表
 */
export function generateSubcommandList(commands: Array<{
  name: string;
  description: string;
}>): string {
  const maxLength = Math.max(...commands.map(c => c.name.length));

  return commands.map(cmd => {
    const name = chalk.cyan(cmd.name.padEnd(maxLength));
    const desc = cmd.description;
    return `  ${name}  ${desc}`;
  }).join('\n');
}

/**
 * 格式化帮助标题
 */
export function formatHelpTitle(title: string): string {
  return '\n' + chalk.bold.cyan(title) + '\n' + '='.repeat(title.length);
}

/**
 * 格式化帮助章节标题
 */
export function formatHelpSection(title: string): string {
  return '\n' + chalk.bold.yellow(title);
}

/**
 * 格式化代码块
 */
export function formatCodeBlock(code: string, language = ''): string {
  const lines = code.split('\n');
  const maxLength = Math.max(...lines.map(l => l.length));
  const border = chalk.dim('─'.repeat(maxLength + 4));

  return [
    border,
    ...lines.map(line => chalk.dim('│ ') + chalk.green(code) + chalk.dim(' │')),
    border,
  ].join('\n');
}

/**
 * 格式化链接
 */
export function formatLink(text: string, url: string): string {
  return chalk.blue.underline(text) + chalk.dim(` (${url})`);
}

/**
 * 创建帮助模板
 *
 * 为常见命令类型生成帮助模板
 */
export const HelpTemplates = {
  /**
   * Add 命令帮助模板
   */
  add: (cliName: string): CommandHelp => ({
    usage: `${cliName} add <name> [options]`,
    description: '添加新项目到注册表',
    arguments: {
      title: '参数',
      content: generateArgumentHelp([
        {
          name: 'name',
          description: '项目名称',
          required: true,
        },
      ]),
    },
    options: {
      title: '选项',
      content: generateOptionHelp([
        {
          flags: '--description <desc>',
          description: '项目的详细描述',
        },
        {
          flags: '--force',
          description: '强制覆盖已存在的同名项目',
          default: 'false',
        },
        {
          flags: '--scope <scope>',
          description: '作用域 (global|project)',
          default: 'global',
        },
      ]),
    },
    examples: {
      title: '示例',
      content: generateExampleHelp([
        `${cliName} add my-project`,
        `${cliName} add my-project --description "我的项目"`,
        `${cliName} add my-project --force`,
      ]),
    },
    seeAlso: ['update', 'check', 'remove'],
  }),

  /**
   * Update 命令帮助模板
   */
  update: (cliName: string): CommandHelp => ({
    usage: `${cliName} update [name] [options]`,
    description: '更新已注册的项目',
    arguments: {
      title: '参数',
      content: generateArgumentHelp([
        {
          name: 'name',
          description: '项目名称 (不指定则更新所有)',
          required: false,
        },
      ]),
    },
    options: {
      title: '选项',
      content: generateOptionHelp([
        {
          flags: '--description <desc>',
          description: '更新项目描述',
        },
        {
          flags: '--scope <scope>',
          description: '更新作用域',
        },
      ]),
    },
    examples: {
      title: '示例',
      content: generateExampleHelp([
        `${cliName} update`,
        `${cliName} update my-project`,
        `${cliName} update my-project --description "新描述"`,
      ]),
    },
    seeAlso: ['add', 'check'],
  }),

  /**
   * Check 命令帮助模板
   */
  check: (cliName: string): CommandHelp => ({
    usage: `${cliName} check [name] [options]`,
    description: '查看已注册的项目',
    arguments: {
      title: '参数',
      content: generateArgumentHelp([
        {
          name: 'name',
          description: '项目名称 (不指定则显示所有)',
          required: false,
        },
      ]),
    },
    options: {
      title: '选项',
      content: generateOptionHelp([
        {
          flags: '--scope <scope>',
          description: '筛选作用域',
        },
        {
          flags: '--json',
          description: '以 JSON 格式输出',
          default: 'false',
        },
      ]),
    },
    examples: {
      title: '示例',
      content: generateExampleHelp([
        `${cliName} check`,
        `${cliName} check my-project`,
        `${cliName} check --scope global`,
        `${cliName} check --json`,
      ]),
    },
    seeAlso: ['add', 'update', 'remove'],
  }),

  /**
   * Remove 命令帮助模板
   */
  remove: (cliName: string): CommandHelp => ({
    usage: `${cliName} remove <name> [options]`,
    description: '删除已注册的项目',
    arguments: {
      title: '参数',
      content: generateArgumentHelp([
        {
          name: 'name',
          description: '要删除的项目名称',
          required: true,
        },
      ]),
    },
    options: {
      title: '选项',
      content: generateOptionHelp([
        {
          flags: '--force',
          description: '强制删除，不提示确认',
          default: 'false',
        },
      ]),
    },
    examples: {
      title: '示例',
      content: generateExampleHelp([
        `${cliName} remove my-project`,
        `${cliName} remove my-project --force`,
      ]),
    },
    seeAlso: ['add', 'check'],
  }),

  /**
   * Scan 命令帮助模板
   */
  scan: (cliName: string): CommandHelp => ({
    usage: `${cliName} scan [options]`,
    description: '扫描文件系统发现项目',
    arguments: undefined,
    options: {
      title: '选项',
      content: generateOptionHelp([
        {
          flags: '--scope <scope>',
          description: '扫描作用域',
          default: 'all',
        },
        {
          flags: '--register',
          description: '自动注册新发现的项目',
          default: 'false',
        },
        {
          flags: '--verbose',
          description: '显示详细信息',
          default: 'false',
        },
      ]),
    },
    examples: {
      title: '示例',
      content: generateExampleHelp([
        `${cliName} scan`,
        `${cliName} scan --scope global`,
        `${cliName} scan --register`,
        `${cliName} scan --register --verbose`,
      ]),
    },
    seeAlso: ['add', 'search'],
  }),

  /**
   * Search 命令帮助模板
   */
  search: (cliName: string): CommandHelp => ({
    usage: `${cliName} search <keyword> [options]`,
    description: '搜索已注册的项目',
    arguments: {
      title: '参数',
      content: generateArgumentHelp([
        {
          name: 'keyword',
          description: '搜索关键词',
          required: true,
        },
      ]),
    },
    options: {
      title: '选项',
      content: generateOptionHelp([
        {
          flags: '--scope <scope>',
          description: '限定搜索作用域',
        },
        {
          flags: '--type <type>',
          description: '项目类型过滤',
        },
      ]),
    },
    examples: {
      title: '示例',
      content: generateExampleHelp([
        `${cliName} search cli`,
        `${cliName} search "test framework"`,
        `${cliName} search cli --scope global`,
      ]),
    },
    seeAlso: ['check', 'scan'],
  }),
};
