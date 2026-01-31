# CLI 最佳实践

本文档总结了构建高质量 Node.js CLI 工具的最佳实践和设计原则。

## 用户体验原则

### 1. POSIX 兼容性

遵循 POSIX 参数规范,确保跨平台一致性:

```typescript
// ✅ 正确
cli.option('-v, --verbose', 'verbose output')
   .option('--output <file>', 'output file')
   .argument('[input]', 'input file')

// ❌ 错误
cli.option('--verbose', 'verbose output')  // 缺少短参数
```

**POSIX 规范**:
- 短参数: 单个字母,前缀 `-` (如 `-a`, `-v`)
- 长参数: 多个字母,前缀 `--` (如 `--all`, `--verbose`)
- 可组合短参数: `-abc` = `-a -b -c`
- 可选参数用 `[]`,必需参数用 `<>`

### 2. 渐进式披露 (Progressive Disclosure)

从简单用例开始,逐步展示高级功能:

```typescript
// ✅ 默认行为简单
mycli                    # 执行默认操作

// ✅ 常用选项易于发现
mycli --verbose          # 详细输出
mycli --output file.txt  # 指定输出

// ✅ 高级功能通过 help 发现
mycli --help             # 显示所有选项
```

### 3. 智能默认值

减少用户需要提供的参数数量:

```typescript
// ✅ 合理的默认值
cli
  .option('--port <number>', 'port', '3000')
  .option('--config <path>', 'config file', './config.json')
  .option('--format', 'output format', 'json')

// ❌ 无默认值,用户必须指定
cli
  .option('--port <number>', 'port')  // 必需
  .option('--config <path>', 'config path')  // 必需
```

### 4. 清晰的错误信息

错误信息应该:
- 说明发生了什么
- 为什么发生
- 如何修复

```typescript
// ✅ 好的错误信息
Error: Cannot find configuration file at /path/to/config.json

The configuration file is required to run this command.

Fixes:
  1. Create a config file: mycli init
  2. Specify a different path: mycli --config /other/path
  3. Use default config: mycli --no-config

// ❌ 差的错误信息
Error: ENOENT
```

### 5. 彩色输出

使用颜色高亮重要信息,但支持 `NO_COLOR`:

```typescript
import chalk from 'chalk';

// 检查 NO_COLOR 环境变量
const useColor = !process.env.NO_COLOR && process.stdout.isTTY;

const log = {
  info: (msg: string) => console.log(useColor ? chalk.blue(msg) : msg),
  success: (msg: string) => console.log(useColor ? chalk.green(msg) : msg),
  warn: (msg: string) => console.log(useColor ? chalk.yellow(msg) : msg),
  error: (msg: string) => console.error(useColor ? chalk.red(msg) : msg),
};
```

### 6. 优雅降级

在非 TTY 环境中禁用 UI 特性:

```typescript
import ora from 'ora';

if (process.stdout.isTTY) {
  const spinner = ora('Loading...').start();
  // 使用 spinner
} else {
  console.log('Loading...');
  // 简单输出
}
```

## 代码组织

### 标准目录结构

```
my-cli/
├── src/
│   ├── commands/           # 命令实现
│   │   ├── init.ts
│   │   ├── build.ts
│   │   └── deploy/
│   │       ├── production.ts
│   │       └── staging.ts
│   ├── lib/                # 共享库
│   │   ├── config.ts       # 配置管理
│   │   ├── logger.ts       # 日志工具
│   │   ├── api.ts          # API 客户端
│   │   └── errors.ts       # 错误类
│   ├── utils/              # 工具函数
│   │   ├── format.ts
│   │   └── validate.ts
│   ├── types/              # TypeScript 类型
│   │   └── index.ts
│   └── index.ts            # 入口
├── test/                   # 测试
│   ├── commands/
│   └── lib/
├── bin/                    # 可执行文件
│   └── run.js
├── package.json
├── tsconfig.json
└── README.md
```

### 命令设计模式

#### 单命令 CLI

```typescript
// src/index.ts
import { Command } from 'commander';

const program = new Command();

program
  .name('mycli')
  .description('A simple CLI tool')
  .version('1.0.0')
  .argument('[input]', 'input file')
  .option('-o, --output <file>', 'output file')
  .action((input, options) => {
    // 逻辑
  });

program.parse();
```

#### 多命令 CLI

```typescript
// src/index.ts
import { Command } from 'commander';

const program = new Command();

program
  .name('mycli')
  .description('A multi-command CLI tool')
  .version('1.0.0');

// 加载子命令
program.addCommand(buildCommand);
program.addCommand(deployCommand);
program.addCommand(configCommand);

program.parse();

// src/commands/build.ts
export const buildCommand = new Command('build')
  .description('Build the project')
  .option('--watch', 'watch mode')
  .action(build);

// src/commands/deploy.ts
export const deployCommand = new Command('deploy')
  .description('Deploy to production')
  .argument('<env>', 'environment')
  .action(deploy);
```

## 配置管理

### 配置优先级

```
1. 命令行参数 (最高)
2. 环境变量
3. 配置文件
4. 默认值 (最低)
```

### 配置文件位置

遵循 XDG 规范:

```typescript
import path from 'path';
import os from 'os';

// 配置文件搜索路径
const configPaths = [
  './mycli.config.js',           // 当前目录
  path.join(os.homedir(), '.myclirc'),  // 用户主目录
  path.join(os.homedir(), '.config', 'mycli', 'config.js'),  // XDG 配置
];
```

### 推荐方案: cosmiconfig + zod

```typescript
import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';

// 配置 Schema
const configSchema = z.object({
  apiKey: z.string().optional(),
  endpoint: z.string().url().default('https://api.example.com'),
  timeout: z.number().min(1000).default(5000),
  retries: z.number().min(0).max(10).default(3),
});

export type Config = z.infer<typeof configSchema>;

// 加载配置
export async function loadConfig(): Promise<Config> {
  const explorer = cosmiconfig('mycli');
  const result = await explorer.search();

  if (!result) {
    return configSchema.parse({});
  }

  return configSchema.parse(result.config);
}
```

## 错误处理

### 自定义错误类

```typescript
// src/lib/errors.ts
export class CliError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestions: string[] = []
  ) {
    super(message);
    this.name = 'CliError';
  }
}

export class ConfigError extends CliError {
  constructor(message: string, suggestions: string[] = []) {
    super(message, 'CONFIG_ERROR', suggestions);
    this.name = 'ConfigError';
  }
}

export class ValidationError extends CliError {
  constructor(message: string, suggestions: string[] = []) {
    super(message, 'VALIDATION_ERROR', suggestions);
    this.name = 'ValidationError';
  }
}
```

### 错误处理模式

```typescript
import { CliError } from './lib/errors.js';

async function main() {
  try {
    await runCommand();
  } catch (error) {
    if (error instanceof CliError) {
      console.error(`\n❌ Error: ${error.message}\n`);

      if (error.suggestions.length > 0) {
        console.error('Suggestions:\n');
        error.suggestions.forEach((s, i) => {
          console.error(`  ${i + 1}. ${s}`);
        });
      }

      process.exit(error.code === 'VALIDATION_ERROR' ? 1 : 2);
    } else {
      console.error('\n❌ Unexpected error:', error);
      process.exit(1);
    }
  }
}
```

## 日志和输出

### 日志级别

```typescript
// src/lib/logger.ts
import chalk from 'chalk';

export enum LogLevel {
  SILENT = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}

export class Logger {
  constructor(private level: LogLevel = LogLevel.INFO) {}

  debug(message: string): void {
    if (this.level >= LogLevel.DEBUG) {
      console.log(chalk.gray('DEBUG'), message);
    }
  }

  info(message: string): void {
    if (this.level >= LogLevel.INFO) {
      console.log(chalk.blue('INFO'), message);
    }
  }

  warn(message: string): void {
    if (this.level >= LogLevel.WARN) {
      console.log(chalk.yellow('WARN'), message);
    }
  }

  error(message: string): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(chalk.red('ERROR'), message);
    }
  }

  success(message: string): void {
    console.log(chalk.green('SUCCESS'), message);
  }
}
```

### 使用 Spinner

```typescript
import ora from 'ora';

const spinner = ora('Installing dependencies...').start();

try {
  await installDependencies();
  spinner.succeed('Dependencies installed');
} catch (error) {
  spinner.fail('Installation failed');
  throw error;
}
```

## 性能优化

### 1. 延迟加载

只在需要时加载模块:

```typescript
// ✅ 延迟加载
program.command('build').action(async () => {
  const { build } = await import('./commands/build.js');
  await build();
});

// ❌ 提前加载所有命令
import { build } from './commands/build.js';
import { deploy } from './commands/deploy.js';
```

### 2. 流式处理

处理大文件时使用流:

```typescript
import fs from 'fs';

// ✅ 流式处理 (低内存)
const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output.txt');
readStream.pipe(writeStream);

// ❌ 一次性读取 (高内存)
const content = fs.readFileSync('input.txt');
fs.writeFileSync('output.txt', content);
```

### 3. 并行处理

使用 Promise.all 并行执行独立任务:

```typescript
// ✅ 并行执行
await Promise.all([
  installDependencies(),
  copyTemplateFiles(),
  createConfigFile(),
]);

// ❌ 串行执行
await installDependencies();
await copyTemplateFiles();
await createConfigFile();
```

## 安全性

### 1. 输入验证

```typescript
import z from 'zod';

const userInputSchema = z.object({
  filename: z.string().regex(/^\w+\.txt$/, 'Invalid filename'),
  count: z.number().int().min(1).max(100),
});

const input = userInputSchema.parse(userInput);
```

### 2. 避免命令注入

```typescript
import { execa } from 'execa';

// ✅ 安全: 使用数组参数
await execa('git', ['init']);

// ❌ 危险: 字符串拼接
await execa(`git init ${repoName}`);
```

### 3. 敏感信息处理

```typescript
// ✅ 不在日志中输出敏感信息
logger.info(`Connecting to ${hideApiKey(config.apiKey)}`);

function hideApiKey(key: string): string {
  return key.slice(0, 4) + '****';
}
```

## 测试

### 测试 CLI 输出

```typescript
import { describe, it, expect } from 'vitest';
import { execaCommand } from 'vitest/execa';

describe('CLI', () => {
  it('should display version', async () => {
    const { stdout } = await execaCommand('node ./bin/run.js --version');
    expect(stdout).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should show help', async () => {
    const { stdout } = await execaCommand('node ./bin/run.js --help');
    expect(stdout).toContain('USAGE');
    expect(stdout).toContain('OPTIONS');
  });
});
```

## 发布检查清单

在发布 CLI 前,确保:

- [ ] 支持 `--help` 和 `--version`
- [ ] 支持 `NO_COLOR` 环境变量
- [ ] 错误信息清晰有用
- [ ] 默认值合理
- [ ] 支持 `--dry-run` (如果适用)
- [ ] 测试覆盖率 > 80%
- [ ] TypeScript 编译无错误
- [ ] Lint 检查通过
- [ ] README.md 包含:
  - 安装说明
  - 使用示例
  - 命令列表
  - 配置说明
- [ ] package.json 包含正确的 `bin` 字段
- [ ] 支持 ESM 或同时支持 ESM/CJS
- [ ] 引擎版本限制合理 (`engines.node`)
