# CLI-Creator 深度优化方案

基于 `cli-developer` 技能的最佳实践，对 `cli-creator` 进行全面优化升级。

**创建时间**: 2026-01-31
**优化来源**: cli-developer 技能的经验总结
**目标**: 生成的 CLI 工具达到生产级标准

---

## 📋 优化清单概览

### 🎯 核心架构优化 (P0)

| # | 优化项 | 来源 | 优先级 | 状态 |
|---|--------|------|--------|------|
| 1 | 交互式提示支持 | cli-developer | P0 | ⏳ 待实施 |
| 2 | 帮助文本生成 | cli-developer | P0 | ⏳ 待实施 |
| 3 | 错误处理模板 | cli-developer | P0 | ⏳ 待实施 |
| 4 | Shell 自动补全 | cli-developer | P0 | ⏳ 待实施 |
| 5 | TTY/CI 检测 | cli-developer | P0 | ⏳ 待实施 |

### 🔧 功能增强 (P1)

| # | 优化项 | 来源 | 优先级 | 状态 |
|---|--------|------|--------|------|
| 6 | 配置文件层级 | cli-developer | P1 | ⏳ 待实施 |
| 7 | 退出码标准化 | cli-developer | P1 | ⏳ 待实施 |
| 8 | 进度条模板 | cli-developer | P1 | ⏳ 待实施 |
| 9 | 版本检查 | cli-developer | P1 | ⏳ 待实施 |
| 10 | 延迟加载 | cli-developer | P1 | ⏳ 待实施 |

### 🎨 UX 提升 (P2)

| # | 优化项 | 来源 | 优先级 | 状态 |
|---|--------|------|--------|------|
| 11 | 输出格式化 | cli-developer | P2 | ⏳ 待实施 |
| 12 | 调试模式 | cli-developer | P2 | ⏳ 待实施 |
| 13 | 表格显示 | cli-developer | P2 | ⏳ 待实施 |
| 14 | 摘要/完成消息 | cli-developer | P2 | ⏳ 待实施 |
| 15 | SIGINT 处理 | cli-developer | P2 | ⏳ 待实施 |

---

## 🎯 P0 核心架构优化

### 1. 交互式提示支持

**来源**: cli-developer/node-cli.md#交互式提示

#### 当前问题
- 生成的 CLI 不支持交互式输入
- 用户必须记住所有参数和选项
- 不适合复杂配置场景

#### 解决方案

创建 `scripts/templates/prompts.ts` 模板：

```typescript
/**
 * 交互式提示工具
 *
 * 使用 inquirer 实现友好的用户交互
 */

import inquirer from 'inquirer';
import { isCI } from './utils.js';

/**
 * 文本输入提示
 */
export async function promptText(options: {
  message: string;
  default?: string;
  validate?: (input: string) => boolean | string;
}): Promise<string> {
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
    },
  ]);

  return value;
}

/**
 * 选择提示（单选）
 */
export async function promptSelect(options: {
  message: string;
  choices: Array<{ name: string; value: string }>;
  default?: string;
}): Promise<string> {
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
 * 复选框提示（多选）
 */
export async function promptCheckbox(options: {
  message: string;
  choices: Array<{ name: string; value: string; checked?: boolean }>;
}): Promise<string[]> {
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
 */
export async function promptConfirm(message: string, defaultVal = false): Promise<boolean> {
  if (isCI()) {
    return false; // CI 环境下默认拒绝
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
```

#### 使用示例

```typescript
// 在命令中使用
import { promptText, promptSelect, promptConfirm } from './lib/prompts.js';

export async function add(name?: string, options: AddOptions): Promise<void> {
  try {
    // 如果未提供名称,交互式提示
    const projectName = name || await promptText({
      message: '项目名称:',
      validate: (input) => input.length > 0 || '名称不能为空',
    });

    // 询问环境
    const environment = await promptSelect({
      message: '选择环境:',
      choices: [
        { name: '开发环境', value: 'development' },
        { name: '预发布', value: 'staging' },
        { name: '生产环境', value: 'production' },
      ],
      default: 'development',
    });

    // 确认操作
    if (options.force) {
      const confirmed = await promptConfirm(
        '确定要强制覆盖吗? 此操作不可撤销',
        false
      );
      if (!confirmed) {
        logger.info('操作已取消');
        return;
      }
    }

    // 执行操作...
  } catch (error) {
    logger.error(`添加失败: ${error}`);
  }
}
```

---

### 2. 帮助文本生成

**来源**: cli-developer/ux-patterns.md#帮助文本设计

#### 当前问题
- Commander 默认帮助过于简单
- 缺少使用示例
- 参数说明不清晰

#### 解决方案

创建 `scripts/templates/help.ts` 模板：

```typescript
/**
 * 帮助文本工具
 *
 * 生成统一、友好的帮助文本
 */

export interface HelpSection {
  title: string;
  content: string;
}

export interface CommandHelp {
  usage: string;
  description: string;
  arguments?: HelpSection;
  options?: HelpSection;
  examples?: HelpSection;
  seeAlso?: string[];
}

/**
 * 生成命令帮助
 */
export function generateCommandHelp(help: CommandHelp): string {
  const sections: string[] = [];

  // 标题和描述
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
 * 生成选项说明
 */
export function generateOptionHelp(options: Array<{
  flags: string;
  description: string;
  default?: string;
}>): string {
  return options.map(opt => {
    let line = `  ${opt.flags.padEnd(25)} ${opt.description}`;
    if (opt.default !== undefined) {
      line += chalk.dim(` (默认: ${opt.default})`);
    }
    return line;
  }).join('\n');
}
```

#### 修改 init_cli.ts 集成帮助

```typescript
// 在 generateCommanderIndex() 中添加
function generateCommanderIndex(config: CliConfig): string {
  let content = `#!/usr/bin/env node
import { Command } from 'commander';
import { logger } from './lib/logger.js';
import { generateCommandHelp, generateOptionHelp } from './lib/help.js';
${config.features.ui ? `import chalk from 'chalk';\nimport ora from 'ora';\n` : ''}

const program = new Command();

program
  .name('${config.name}')
  .description('${config.description}')
  .version('${config.version}')
  .addHelpText('afterAll', \`
\\n了解更多: https://github.com/yourusername/\${program.name()}
\\\`);

// Add 命令
program
  .command('add')
  .description('添加项目')
  .argument('<name>', '项目名称')
  .option('--description <desc>', '项目描述')
  .option('--force', '强制覆盖已存在的项目')
  .action(add);

program
  .command('add')
  .addHelpText('after', \`
\${generateCommandHelp({
  usage: '${config.name} add <name> [options]',
  description: '添加新项目到注册表',
  arguments: {
    title: '参数',
    content: \`
  name          项目名称（必需）
                只能包含字母、数字和连字符
\`,
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
    ]),
  },
  examples: {
    title: '示例',
    content: \`
  # 添加新项目
  \${config.name} add my-project

  # 添加带描述的项目
  \${config.name} add my-project --description "我的项目"

  # 强制覆盖
  \${config.name} add my-project --force
\`,
  },
  seeAlso: ['update', 'check', 'remove'],
})}
\`);

program.parse();
`;
  return content;
}
```

---

### 3. 错误处理模板

**来源**: cli-developer/design-patterns.md#错误处理模式

#### 当前问题
- 错误消息不够友好
- 缺少上下文信息
- 没有解决方案建议

#### 解决方案

创建 `scripts/templates/errors.ts` 模板：

```typescript
/**
 * 错误处理工具
 *
 * 提供友好的错误消息和解决方案
 */

import chalk from 'chalk';

export interface ErrorContext {
  [key: string]: string | string[];
}

/**
 * CLI 错误类
 */
export class CliError extends Error {
  code: string;
  context?: ErrorContext;
  suggestions: string[];

  constructor(
    message: string,
    code: string,
    suggestions: string[] = [],
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'CliError';
    this.code = code;
    this.suggestions = suggestions;
    this.context = context;
  }
}

/**
 * 显示错误
 */
export function displayError(error: Error | CliError): void {
  if (error instanceof CliError) {
    // 错误标题
    console.error(chalk.red('✗ 错误: ') + error.message);

    // 错误代码
    if (error.code) {
      console.error(chalk.dim(`  代码: ${error.code}`));
    }

    // 上下文
    if (error.context) {
      console.error('');
      Object.entries(error.context).forEach(([key, value]) => {
        console.error(chalk.dim('  ') + key + ':');
        if (Array.isArray(value)) {
          value.forEach(v => console.error(chalk.dim('    • ') + v));
        } else {
          console.error(chalk.dim('    • ') + value);
        }
      });
    }

    // 解决方案
    if (error.suggestions.length > 0) {
      console.error('');
      console.error(chalk.yellow('解决方案:'));
      error.suggestions.forEach(s => {
        console.error(chalk.dim('  • ') + s);
      });
    }
  } else {
    console.error(chalk.red('✗ 错误: ') + error.message);
  }
}

/**
 * 预定义错误
 */
export const Errors = {
  fileNotFound: (filePath: string, searchedPaths: string[]) =>
    new CliError(
      '未找到配置文件',
      'ENOENT',
      [
        `运行 '\${process.argv[1]} init' 创建配置文件`,
        '使用 --config 指定不同的位置',
        '检查文件权限',
      ],
      {
        '已搜索的位置': searchedPaths,
      }
    ),

  invalidOption: (option: string, validOptions: string[], suggestion?: string) =>
    new CliError(
      \`无效的选项 "\${option}"\`,
      'EINVAL',
      suggestion
        ? [\`您是否指 "\${suggestion}"?\`]
        : [],
      {
        '有效选项': validOptions,
      }
    ),

  permissionDenied: (path: string) =>
    new CliError(
      \`访问 "\${path}" 时权限被拒绝\`,
      'EACCES',
      [
        '使用 sudo 运行命令',
        '检查文件权限',
        '确保当前用户有访问权限',
      ]
    ),

  networkError: (url: string) =>
    new CliError(
      '网络请求失败',
      'ENETWORK',
      [
        '检查网络连接',
        '确认 URL 是否正确',
        '尝试使用代理',
      ],
      {
        URL: url,
      }
    ),
};
```

#### 使用示例

```typescript
// 在命令中使用
import { displayError, Errors } from './lib/errors.js';

export async function add(name: string, options: AddOptions): Promise<void> {
  try {
    // 验证选项
    const validEnvironments = ['development', 'staging', 'production'];
    if (!validEnvironments.includes(options.environment)) {
      throw Errors.invalidOption(
        options.environment,
        validEnvironments,
        findClosestMatch(options.environment, validEnvironments)
      );
    }

    // 检查文件
    const configPath = getConfigPath();
    if (!(await fileExists(configPath))) {
      throw Errors.fileNotFound(configPath, [
        './mycli.config.yml',
        '~/.myclirc',
        '/etc/mycli/config.yml',
      ]);
    }

    // 执行操作...
  } catch (error) {
    displayError(error as Error);
    process.exit(getExitCode(error));
  }
}
```

---

### 4. Shell 自动补全

**来源**: cli-developer/SKILL.md#核心工作流程

#### 当前问题
- 不支持 Tab 补全
- 用户必须记住所有命令和选项
- 降低使用效率

#### 解决方案

创建 `scripts/templates/completion.sh` 模板：

```bash
# Bash 自动补全脚本
_${CLI_NAME}_completion() {
    local cur prev words cword
    _init_completion || return

    case ${prev} in
        ${CLI_NAME})
            COMPREPLY=($(compgen -W "add update check remove scan search --help --version" -- "${cur}"))
            ;;
        add|update|remove)
            COMPREPLY=($(compgen -W "--force --verbose --help" -- "${cur}"))
            ;;
        scan)
            COMPREPLY=($(compgen -W "--register --verbose --help" -- "${cur}"))
            ;;
        search)
            COMPREPLY=($(compgen -W "--repo --type --help" -- "${cur}"))
            ;;
        *)
            ;;
    esac
}

complete -F _${CLI_NAME}_completion ${CLI_NAME}
```

创建 `scripts/templates/completion.ts` 生成器：

```typescript
/**
 * 自动补全生成器
 *
 * 生成 Shell 自动补全脚本
 */

import fs from 'fs/promises';
import path from 'path';

export async function generateCompletion(config: CliConfig, targetDir: string): Promise<void> {
  const bashScript = `
# Bash 自动补全 for ${config.name}
# 安装: ${config.name} completion >> ~/.bashrc
# 或: ${config.name} completion >> ~/.bash_profile

_${config.name}_completion() {
    local cur prev words cword
    _init_completion || return

    case ${prev} in
        ${config.name})
            COMPREPLY=($(compgen -W "add update check remove${config.template !== 'minimal' ? ' scan search' : ''} --help --version" -- "${cur}"))
            ;;
        add)
            COMPREPLY=($(compgen -W "--force --verbose --help" -- "${cur}"))
            ;;
        update|check|remove)
            COMPREPLY=($(compgen -W "--verbose --help" -- "${cur}"))
            ;;
${config.template !== 'minimal' ? `        scan)
            COMPREPLY=($(compgen -W "--register --verbose --help" -- "${cur}"))
            ;;
        search)
            COMPREPLY=($(compgen -W "--repo --type --help" -- "${cur}"))
            ;;
` : `        `}
        *)
            ;;
    esac
}

complete -F _${config.name}_completion ${config.name}
`;

  await fs.writeFile(
    path.join(targetDir, 'completions', `${config.name}.bash`),
    bashScript
  );
}
```

#### 修改 init_cli.ts 添加补全命令

```typescript
// 在 generateCommanderIndex() 中添加
program
  .command('completion')
  .description('生成 Shell 自动补全脚本')
  .option('--shell <type>', 'Shell 类型 (bash|zsh|fish)', 'bash')
  .action(async (options) => {
    const script = await fs.readFile(
      path.join(__dirname, '../completions/${config.name}.' + options.shell),
      'utf-8'
    );
    console.log(script);
  });
```

---

### 5. TTY/CI 检测

**来源**: cli-developer/design-patterns.md#交互式-vs-非交互式

#### 当前问题
- 在 CI 环境中可能要求交互式输入
- 颜色输出可能干扰日志收集
- 未检测管道输出

#### 解决方案

创建 `scripts/templates/utils.ts` 模板：

```typescript
/**
 * 环境检测工具
 *
 * 检测运行环境,适配不同场景
 */

/**
 * 检测是否在 CI 环境中运行
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
    !process.stdout.isTTY
  );
}

/**
 * 检测是否支持颜色
 */
export function supportsColor(): boolean {
  return !isCI() && process.stdout.isTTY && process.env.NO_COLOR !== '1';
}

/**
 * 检测是否在调试模式
 */
export function isDebug(): boolean {
  return process.env.DEBUG === 'true' || process.env.VERBOSE === 'true';
}

/**
 * 获取环境信息
 */
export function getEnvInfo(): {
  ci: boolean;
  color: boolean;
  debug: boolean;
  tty: boolean;
  platform: string;
  nodeVersion: string;
} {
  return {
    ci: isCI(),
    color: supportsColor(),
    debug: isDebug(),
    tty: process.stdout.isTTY,
    platform: process.platform,
    nodeVersion: process.version,
  };
}
```

#### 修改 logger.ts 支持 TTY 检测

```typescript
import { supportsColor } from './utils.js';

export const logger: Logger = {
  info(message: string): void {
    if (supportsColor()) {
      console.log(chalk.blue('ℹ') + ' ' + message);
    } else {
      console.log('[INFO] ' + message);
    }
  },

  success(message: string): void {
    if (supportsColor()) {
      console.log(chalk.green('✓') + ' ' + message);
    } else {
      console.log('[SUCCESS] ' + message);
    }
  },

  error(message: string): void {
    if (supportsColor()) {
      console.error(chalk.red('✗') + ' ' + message);
    } else {
      console.error('[ERROR] ' + message);
    }
  },
  // ...
};
```

---

## 🔧 P1 功能增强

### 6. 配置文件层级

**来源**: cli-developer/design-patterns.md#配置层级

创建 `scripts/templates/config-loader.ts`:

```typescript
/**
 * 配置加载器
 *
 * 支持多层级配置: 系统 → 用户 → 项目 → 环境变量 → CLI 标志
 */

import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';

export const ConfigSchema = z.object({
  // 定义配置架构
});

export async function loadConfig(): Promise<z.infer<typeof ConfigSchema>> {
  const explorer = cosmiconfig('${CLI_NAME}', {
    searchPlaces: [
      '.${CLI_NAME}rc',
      '.${CLI_NAME}rc.json',
      '.${CLI_NAME}rc.yaml',
      '.${CLI_NAME}rc.yml',
      '.${CLI_NAME}rc.ts',
      '.${CLI_NAME}config.js',
      '.${CLI_NAME}config.json',
      'package.json',
    ],
  });

  // 1. 加载项目配置
  const project = await explorer.search();

  // 2. 加载用户配置
  const user = await explorer.load(path.join(os.homedir(), '.${CLI_NAME}rc'));

  // 3. 加载环境变量
  const env = loadEnvConfig();

  // 4. 合并配置 (优先级从高到低)
  const config = {
    ...getDefaultConfig(),
    ...(user?.config || {}),
    ...(project?.config || {}),
    ...env,
    ...parseCliFlags(),
  };

  // 5. 验证
  return ConfigSchema.parse(config);
}
```

---

### 7. 退出码标准化

**来源**: cli-developer/design-patterns.md#退出码

创建 `scripts/templates/exit-codes.ts`:

```typescript
/**
 * 标准 POSIX 退出码
 *
 * 参考: https://tldp.org/LDP/abs/html/exitcodes.html
 */

export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE: 2,              // 无效参数
  PERMISSION_DENIED: 77,
  NOT_FOUND: 127,
  SIGINT: 130,            // Ctrl+C
} as const;

export type ExitCode = typeof EXIT_CODES[keyof typeof EXIT_CODES];

/**
 * 根据错误获取退出码
 */
export function getExitCode(error: Error): ExitCode {
  if ('code' in error) {
    switch ((error as any).code) {
      case 'EACCES':
        return EXIT_CODES.PERMISSION_DENIED;
      case 'ENOENT':
        return EXIT_CODES.NOT_FOUND;
      default:
        return EXIT_CODES.GENERAL_ERROR;
    }
  }

  // CliError 有自己的 code
  if (error.name === 'CliError') {
    return EXIT_CODES.GENERAL_ERROR;
  }

  return EXIT_CODES.GENERAL_ERROR;
}

/**
 * 优雅退出
 */
export function exit(code: ExitCode): never {
  process.exit(code);
}
```

---

### 8. 进度条模板

**来源**: cli-developer/node-cli.md#进度条-cli-progress

创建 `scripts/templates/progress.ts`:

```typescript
/**
 * 进度条工具
 *
 * 用于显示确定性的进度 (已知总数)
 */

import cliProgress from 'cli-progress';

export class ProgressBar {
  private bar: cliProgress.SingleBar;

  constructor(total: number, message = '处理中') {
    this.bar = new cliProgress.SingleBar({
      format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} | {message}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    });

    this.bar.start(total, 0, { message });
  }

  update(current: number, message?: string): void {
    this.bar.update(current, { message });
  }

  stop(): void {
    this.bar.stop();
  }
}

/**
 * 多进度条 (并行任务)
 */
export class MultiProgress {
  private multibar: cliProgress.MultiBar;

  constructor() {
    this.multibar = new cliProgress.MultiBar({
      format: chalk.cyan('{bar}') + ' | {percentage}% | {task} | {value}/{total}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      clearOnComplete: false,
    });
  }

  create(total: number, task: string): cliProgress.SingleBar {
    return this.multibar.create(total, 0, { task });
  }

  stop(): void {
    this.multibar.stop();
  }
}
```

---

### 9. 版本检查

**来源**: cli-developer/design-patterns.md#版本控制与更新

创建 `scripts/templates/update-check.ts`:

```typescript
/**
 * 版本检查
 *
 * 非阻塞地检查更新
 */

import { createRequire } from 'module';
import { logger } from './logger.js';

const require = createRequire(import.meta.url);

export async function checkForUpdates(): Promise<void> {
  try {
    const pkg = require('../package.json');
    const currentVersion = pkg.version;

    // 非阻塞地检查更新
    fetch(\`https://registry.npmjs.org/\${pkg.name}/latest\`)
      .then(res => res.json())
      .then(data => {
        if (data.version !== currentVersion) {
          logger.warn(\`有可用更新: \${currentVersion} → \${data.version}\`);
          logger.info(\`运行: npm install -g \${pkg.name}@latest\`);
        }
      })
      .catch(() => {
        // 静默失败
      });
  } catch {
    // 忽略错误
  }
}

/**
 * 检查 Node 版本
 */
export function checkNodeVersion(minVersion: string): void {
  const currentNode = process.version;
  const semver = require('semver');

  if (!semver.satisfies(currentNode, \`>=\${minVersion}\`)) {
    logger.error(\`\${pkg.name} 需要 Node.js \${minVersion} 或更高版本\`);
    logger.info(\`当前版本: \${currentNode}\`);
    process.exit(1);
  }
}
```

---

### 10. 延迟加载

**来源**: cli-developer/design-patterns.md#性能模式

修改命令索引支持延迟加载:

```typescript
// 在 generateCommanderIndex() 中使用延迟加载
program
  .command('deploy')
  .description('部署应用')
  .action(async () => {
    // 仅在需要时加载
    const { deploy } = await import('./commands/deploy.js');
    await deploy();
  });
```

---

## 🎨 P2 UX 提升

### 11. 输出格式化

**来源**: cli-developer/ux-patterns.md#输出格式化

创建 `scripts/templates/formatters.ts`:

```typescript
/**
 * 输出格式化
 *
 * 支持多种输出格式: 文本、JSON、表格
 */

import cliTable from 'cli-table3';

/**
 * 表格格式化
 */
export function formatTable(data: {
  headers: string[];
  rows: string[][];
}): string {
  const table = new cliTable({
    head: data.headers.map(h => chalk.cyan(h)),
    style: {
      head: [],
      border: ['grey'],
    },
  });

  table.push(...data.rows);
  return table.toString();
}

/**
 * JSON 格式化
 */
export function formatJSON(data: unknown, pretty = true): string {
  return JSON.stringify(data, null, pretty ? 2 : 0);
}

/**
 * 列表格式化
 */
export function formatList(items: string[], bullet = '•'): string {
  return items.map(item => \`  \${bullet} \${item}\`).join('\\n');
}

/**
 * 树形格式化
 */
export function formatTree(structure: Record<string, unknown>): string {
  // 实现树形显示逻辑
  // ...
}
```

---

### 12. 调试模式

**来源**: cli-developer/ux-patterns.md#调试和详细模式

修改 logger 支持调试级别:

```typescript
import { isDebug } from './utils.js';

export const logger: Logger = {
  debug(message: string): void {
    if (isDebug()) {
      const timestamp = new Date().toISOString();
      console.error(chalk.dim(\`[\${timestamp}] [DEBUG] \${message}\`));
    }
  },
  // ...
};
```

---

### 13. 表格显示

**来源**: cli-developer/ux-patterns.md#表格

集成 cli-table3:

```typescript
import cliTable from 'cli-table3';

export function displayTable(headers: string[], rows: string[][]): void {
  const table = new cliTable({
    head: headers.map(h => chalk.cyan(h)),
    colWidths: headers.map(() => 20),
  });

  table.push(...rows);
  console.log(table.toString());
}
```

---

### 14. 摘要/完成消息

**来源**: cli-developer/ux-patterns.md#摘要完成

创建 `scripts/templates/summary.ts`:

```typescript
/**
 * 操作摘要
 *
 * 显示操作完成后的摘要信息
 */

export interface OperationSummary {
  title: string;
  duration: number;
  details: Record<string, string>;
  nextSteps?: string[];
  url?: string;
}

export function displaySummary(summary: OperationSummary): void {
  console.log('');
  logger.success(summary.title);
  console.log('');

  // 详情
  if (Object.keys(summary.details).length > 0) {
    console.log(chalk.bold('摘要:'));
    Object.entries(summary.details).forEach(([key, value]) => {
      console.log(\`  \${key.padEnd(15)} \${value}\`);
    });
    console.log('');
  }

  // 持续时间
  const duration = formatDuration(summary.duration);
  console.log(\`  持续时间:   \${duration}\`);

  // 后续步骤
  if (summary.nextSteps && summary.nextSteps.length > 0) {
    console.log('');
    console.log(chalk.bold('后续步骤:'));
    summary.nextSteps.forEach(step => {
      console.log(\`  • \${step}\`);
    });
  }

  // URL
  if (summary.url) {
    console.log('');
    console.log(\`URL: \${chalk.blue(summary.url)}\`);
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return \`\${hours}小时\${minutes % 60}分\`;
  }
  if (minutes > 0) {
    return \`\${minutes}分\${seconds % 60}秒\`;
  }
  return \`\${seconds}秒\`;
}
```

---

### 15. SIGINT 处理

**来源**: cli-developer/node-cli.md#错误处理

添加全局 SIGINT 处理:

```typescript
// 在主入口文件中
process.on('SIGINT', () => {
  logger.warn('\\n操作已取消');
  process.exit(130); // 标准 SIGINT 退出码
});

process.on('SIGTERM', () => {
  logger.warn('\\n收到终止信号');
  process.exit(143);
});
```

---

## 📦 实施步骤

### 阶段 1: 创建新模板 (1-2 天)

1. ✅ 复审现有模板 (logger, validation)
2. 创建新模板:
   - [ ] `templates/utils.ts` - TTY/CI 检测
   - [ ] `templates/prompts.ts` - 交互式提示
   - [ ] `templates/help.ts` - 帮助文本
   - [ ] `templates/errors.ts` - 错误处理
   - [ ] `templates/exit-codes.ts` - 退出码
   - [ ] `templates/config-loader.ts` - 配置加载
   - [ ] `templates/progress.ts` - 进度条
   - [ ] `templates/formatters.ts` - 输出格式化
   - [ ] `templates/summary.ts` - 操作摘要
   - [ ] `templates/completion.ts` - Shell 补全

### 阶段 2: 修改主脚本 (2-3 天)

1. 修改 `init_cli.ts`:
   - [ ] 更新依赖映射 (添加新依赖)
   - [ ] 集成新模板生成
   - [ ] 改进命令生成逻辑
   - [ ] 添加补全命令生成

2. 更新 `package.json` 模板:
   - [ ] 添加 inquirer、cli-table3、cli-progress
   - [ ] 添加合适的版本要求

### 阶段 3: 测试和验证 (1-2 天)

1. 创建测试 CLI:
   ```bash
   npx ts-node init_cli.ts test-cli --template standard
   ```

2. 测试功能:
   - [ ] 交互式提示
   - [ ] 帮助文本
   - [ ] 错误消息
   - [ ] Shell 补全
   - [ ] CI/CD 兼容性

### 阶段 4: 文档更新 (1 天)

1. 更新 SKILL.md
2. 创建使用示例
3. 更新 README

---

## 📊 改进效果对比

### 改进前

```bash
$ mycli add
Error: name is required
```

### 改进后

```bash
$ mycli add
? 项目名称: my-project
? 选择环境: (Use arrow keys)
❯ development
  staging
  production

✓ 项目已添加

摘要:
  名称:        my-project
  环境:        development
  持续时间:    2.3秒

后续步骤:
  • 运行 'mycli check' 查看项目
  • 运行 'mycli update my-project' 更新配置
```

---

## 🎯 预期效果

### 开箱即用性

- **改进前**: 基础命令,需手动添加功能
- **改进后**: 完整功能,开箱即用

### 用户体验

- **改进前**: 简单错误提示
- **改进后**: 友好错误消息 + 解决方案

### 开发效率

- **改进前**: 手动编写重复代码
- **改进后**: 自动生成模板代码

### 生产质量

- **改进前**: 简单原型
- **改进后**: 生产级 CLI

---

**创建时间**: 2026-01-31
**状态**: 优化方案已完成,待实施
**优先级**: 高
**预计工期**: 5-8 天
