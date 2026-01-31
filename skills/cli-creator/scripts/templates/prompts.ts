/**
 * 交互式提示工具
 *
 * 使用 inquirer 实现友好的用户交互
 */

import inquirer from 'inquirer';
import { isCI } from './utils.js';

/**
 * 文本输入选项
 */
export interface TextInputOptions {
  message: string;
  default?: string;
  validate?: (input: string) => boolean | string;
  transform?: (input: string) => string;
  filter?: (input: string) => string;
}

/**
 * 选择选项
 */
export interface SelectOptions {
  message: string;
  choices: Array<{ name: string; value: string }>;
  default?: string;
}

/**
 * 复选框选项
 */
export interface CheckboxOptions {
  message: string;
  choices: Array<{
    name: string;
    value: string;
    checked?: boolean;
  }>;
}

/**
 * 确认选项
 */
export interface ConfirmOptions {
  message: string;
  default?: boolean;
}

/**
 * 文本输入提示
 *
 * 提示用户输入文本
 */
export async function promptText(options: TextInputOptions): Promise<string> {
  if (isCI()) {
    throw new Error('非交互式模式下需要提供参数');
  }

  const { value } = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: options.message,
      default: options.default,
      validate: options.validate,
      transformer: options.transform,
      filter: options.filter,
    },
  ]);

  return value;
}

/**
 * 密码输入提示
 *
 * 提示用户输入密码（遮罩显示）
 */
export async function promptPassword(message: string, mask = '*'): Promise<string> {
  if (isCI()) {
    throw new Error('非交互式模式下需要提供参数');
  }

  const { value } = await inquirer.prompt([
    {
      type: 'password',
      name: 'value',
      message,
      mask,
    },
  ]);

  return value;
}

/**
 * 选择提示（单选）
 *
 * 让用户从列表中选择一个选项
 */
export async function promptSelect(options: SelectOptions): Promise<string> {
  if (isCI()) {
    throw new Error('非交互式模式下需要提供参数');
  }

  const { value } = await inquirer.prompt([
    {
      type: 'list',
      name: 'value',
      message: options.message,
      choices: options.choices,
      default: options.default,
    },
  ]);

  return value;
}

/**
 * 自动完成选择
 *
 * 带搜索功能的选择提示
 */
export async function promptAutocomplete(
  message: string,
  choices: string[],
  suggestLimit = 10
): Promise<string> {
  if (isCI()) {
    throw new Error('非交互式模式下需要提供参数');
  }

  const { value } = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'value',
      message,
      source: (_answersSoFar: any, input: string) => {
        if (!input) {
          return choices.slice(0, suggestLimit);
        }
        return choices.filter(
          choice => choice.toLowerCase().includes(input.toLowerCase())
        ).slice(0, suggestLimit);
      },
    },
  ]);

  return value;
}

/**
 * 复选框提示（多选）
 *
 * 让用户从列表中选择多个选项
 */
export async function promptCheckbox(options: CheckboxOptions): Promise<string[]> {
  if (isCI()) {
    throw new Error('非交互式模式下需要提供参数');
  }

  const { values } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'values',
      message: options.message,
      choices: options.choices,
    },
  ]);

  return values;
}

/**
 * 确认提示
 *
 * 让用户确认是/否
 */
export async function promptConfirm(message: string, defaultVal = false): Promise<boolean> {
  if (isCI()) {
    // CI 环境下默认拒绝（更安全）
    return false;
  }

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultVal,
    },
  ]);

  return confirmed;
}

/**
 * 数字输入提示
 *
 * 提示用户输入数字
 */
export async function promptNumber(
  message: string,
  options: {
    default?: number;
    min?: number;
    max?: number;
    validate?: (input: number) => boolean | string;
  } = {}
): Promise<number> {
  if (isCI()) {
    throw new Error('非交互式模式下需要提供参数');
  }

  const { value } = await inquirer.prompt([
    {
      type: 'number',
      name: 'value',
      message,
      default: options.default,
      validate: (input: number) => {
        if (options.min !== undefined && input < options.min) {
          return `请输入大于或等于 ${options.min} 的数字`;
        }
        if (options.max !== undefined && input > options.max) {
          return `请输入小于或等于 ${options.max} 的数字`;
        }
        if (options.validate) {
          return options.validate(input);
        }
        return true;
      },
    },
  ]);

  return value;
}

/**
 * 编辑器输入提示
 *
 * 在外部编辑器中打开编辑输入
 */
export async function promptEditor(message: string): Promise<string> {
  if (isCI()) {
    throw new Error('非交互式模式下需要提供参数');
  }

  const { value } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'value',
      message,
    },
  ]);

  return value;
}

/**
 * 多步骤提示
 *
 * 按顺序执行多个提示
 */
export async function promptSeries(
  prompts: Array<{
    name: string;
    prompt: () => Promise<any>;
  }>
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};

  for (const { name, prompt } of prompts) {
    results[name] = await prompt();
  }

  return results;
}

/**
 * 条件提示
 *
 * 根据条件决定是否显示提示
 */
export async function promptConditional(
  condition: boolean,
  promptFn: () => Promise<any>
): Promise<any> {
  if (!condition) {
    return undefined;
  }

  if (isCI()) {
    throw new Error('非交互式模式下需要提供参数');
  }

  return await promptFn();
}

/**
 * 验证输入不为空
 */
export function validateNonEmpty(input: string): boolean | string {
  if (input.trim().length === 0) {
    return '输入不能为空';
  }
  return true;
}

/**
 * 验证是有效的项目名称
 */
export function validateProjectName(input: string): boolean | string {
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(input)) {
    return '项目名称只能包含小写字母、数字和连字符，且必须以字母或数字开头和结尾';
  }
  return true;
}

/**
 * 验证是有效的 URL
 */
export function validateURL(input: string): boolean | string {
  try {
    new URL(input);
    return true;
  } catch {
    return '请输入有效的 URL';
  }
}

/**
 * 验证是有效的邮箱地址
 */
export function validateEmail(input: string): boolean | string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input)) {
    return '请输入有效的邮箱地址';
  }
  return true;
}

/**
 * 常用提示模板
 */
export const PromptTemplates = {
  /**
   * 项目名称提示
   */
  projectName: async (defaultName = 'my-project'): Promise<string> => {
    return await promptText({
      message: '项目名称:',
      default: defaultName,
      validate: validateProjectName,
    });
  },

  /**
   * 项目描述提示
   */
  projectDescription: async (): Promise<string> => {
    return await promptText({
      message: '项目描述:',
      validate: validateNonEmpty,
    });
  },

  /**
   * 环境选择提示
   */
  environment: async (defaultEnv = 'development'): Promise<string> => {
    return await promptSelect({
      message: '选择环境:',
      choices: [
        { name: '开发环境 (development)', value: 'development' },
        { name: '预发布环境 (staging)', value: 'staging' },
        { name: '生产环境 (production)', value: 'production' },
      ],
      default: defaultEnv,
    });
  },

  /**
   * 功能选择提示
   */
  features: async (): Promise<string[]> => {
    return await promptCheckbox({
      message: '选择要启用的功能:',
      choices: [
        { name: 'TypeScript', value: 'typescript', checked: true },
        { name: 'ESLint', value: 'eslint', checked: true },
        { name: 'Prettier', value: 'prettier', checked: true },
        { name: 'Jest', value: 'jest', checked: false },
        { name: 'CI/CD', value: 'cicd', checked: false },
      ],
    });
  },

  /**
   * 确认危险操作
   */
  confirmDangerous: async (operation = '此操作'): Promise<boolean> => {
    return await promptConfirm(
      `⚠️  警告: ${operation}不可撤销，确定要继续吗?`,
      false
    );
  },

  /**
   * 确认覆盖
   */
  confirmOverwrite: async (path: string): Promise<boolean> => {
    return await promptConfirm(
      `"${path}" 已存在，确定要覆盖吗?`,
      false
    );
  },
};
