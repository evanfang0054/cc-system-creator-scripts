# CLI-Creator 快速实施指南

本文档提供基于 cli-developer 经验的快速实施方案。

---

## 📦 优先实施清单

### 🔴 第一优先级 (立即实施)

这些改进对用户体验影响最大，建议优先实施：

#### 1. 错误处理模板 ⚡

**影响**: 用户遇到错误时能得到友好提示和解决方案

**创建文件**: `scripts/templates/errors.ts`

**关键代码**:
```typescript
export class CliError extends Error {
  code: string;
  suggestions: string[];
  context?: ErrorContext;
}

export function displayError(error: Error): void {
  console.error(chalk.red('✗ 错误: ') + error.message);
  if (error instanceof CliError) {
    error.suggestions.forEach(s => {
      console.error(chalk.dim('  • ') + s);
    });
  }
}
```

**集成位置**: 在 init_cli.ts 中生成错误处理代码

---

#### 2. 帮助文本生成 ⚡

**影响**: 用户能快速了解命令用法，无需查文档

**创建文件**: `scripts/templates/help.ts`

**关键代码**:
```typescript
export function generateCommandHelp(help: CommandHelp): string {
  return `
${chalk.bold(help.usage)}

${help.description}

${chalk.yellow('参数')}
${help.arguments?.content}

${chalk.yellow('示例')}
${help.examples?.content}
  `;
}
```

**集成位置**: 在 generateCommanderIndex() 中使用

---

#### 3. TTY/CI 检测 ⚡

**影响**: 确保在 CI/CD 环境中正常工作

**创建文件**: `scripts/templates/utils.ts`

**关键代码**:
```typescript
export function isCI(): boolean {
  return !process.stdout.isTTY || process.env.CI === 'true';
}

export function supportsColor(): boolean {
  return !isCI() && process.env.NO_COLOR !== '1';
}
```

**集成位置**: 修改 logger.ts 使用 supportsColor()

---

### 🟡 第二优先级 (重要增强)

#### 4. 交互式提示

**创建文件**: `scripts/templates/prompts.ts`

**依赖**: inquirer@^9.0.0

**使用场景**:
- 缺少必需参数时提示用户输入
- 复杂配置时提供友好的选择界面

---

#### 5. Shell 自动补全

**创建文件**:
- `scripts/templates/completion.sh` (Bash 脚本模板)
- `scripts/templates/completion.ts` (生成器)

**集成步骤**:
1. 在 init_cli.ts 中添加 completion 命令
2. 生成补全脚本到 `completions/` 目录
3. 在 package.json 中添加安装说明

---

#### 6. 退出码标准化

**创建文件**: `scripts/templates/exit-codes.ts`

**关键代码**:
```typescript
export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE: 2,
  PERMISSION_DENIED: 77,
  NOT_FOUND: 127,
  SIGINT: 130,
};
```

---

### 🟢 第三优先级 (锦上添花)

#### 7. 进度条支持

**依赖**: cli-progress@^3.12.0

**适用场景**: 文件操作、批量处理

#### 8. 表格格式化

**依赖**: cli-table3@^0.6.3

**适用场景**: 列表显示、状态查询

#### 9. 操作摘要

**创建文件**: `scripts/templates/summary.ts`

**效果**: 显示操作完成后的详细摘要

---

## 🚀 实施步骤 (快速版)

### 第 1 步: 更新依赖映射

修改 `init_cli.ts` 中的 DEPENDENCY_MAP:

```typescript
const DEPENDENCY_MAP = {
  // ... 现有依赖

  // 新增
  prompts: {
    inquirer: ['inquirer@^9.0.0'],
  },
  output: {
    table: ['cli-table3@^0.6.3'],
    progress: ['cli-progress@^3.12.0'],
  },
  formatting: {
    figures: ['cli-spinners@^2.9.0'],
  },
};
```

---

### 第 2 步: 创建核心工具模板

按以下顺序创建模板文件：

1. **utils.ts** - 其他模板依赖它
2. **errors.ts** - 错误处理基础
3. **help.ts** - 帮助文本生成
4. **prompts.ts** - 交互式提示
5. **completion.ts** - Shell 补全

每个模板约 50-100 行代码。

---

### 第 3 步: 修改 init_cli.ts 主逻辑

#### 3.1 更新 generateLibFiles()

```typescript
async function generateLibFiles(config: CliConfig, srcDir: string): Promise<void> {
  const libDir = path.join(srcDir, 'lib');
  await fs.mkdir(libDir, { recursive: true });

  // Logger (现有)
  const loggerTemplate = await fs.readFile(
    path.join(__dirname, 'templates/logger.ts'),
    'utf-8'
  );
  await fs.writeFile(path.join(libDir, 'logger.ts'), loggerTemplate);

  // Validation (现有)
  if (config.template !== 'minimal') {
    const validationTemplate = await fs.readFile(
      path.join(__dirname, 'templates/validation.ts'),
      'utf-8'
    );
    await fs.writeFile(path.join(libDir, 'validation.ts'), validationTemplate);
  }

  // ✅ 新增: Utils
  const utilsTemplate = await fs.readFile(
    path.join(__dirname, 'templates/utils.ts'),
    'utf-8'
  );
  await fs.writeFile(path.join(libDir, 'utils.ts'), utilsTemplate);

  // ✅ 新增: Errors
  if (config.template !== 'minimal') {
    const errorsTemplate = await fs.readFile(
      path.join(__dirname, 'templates/errors.ts'),
      'utf-8'
    );
    await fs.writeFile(path.join(libDir, 'errors.ts'), errorsTemplate);
  }

  // ✅ 新增: Help
  if (config.template !== 'minimal') {
    const helpTemplate = await fs.readFile(
      path.join(__dirname, 'templates/help.ts'),
      'utf-8'
    );
    await fs.writeFile(path.join(libDir, 'help.ts'), helpTemplate);
  }

  // ✅ 新增: Prompts
  if (config.template === 'advanced') {
    const promptsTemplate = await fs.readFile(
      path.join(__dirname, 'templates/prompts.ts'),
      'utf-8'
    );
    await fs.writeFile(path.join(libDir, 'prompts.ts'), promptsTemplate);
  }
}
```

#### 3.2 更新 generatePackageJson()

```typescript
function generatePackageJson(config: CliConfig): string {
  const dependencies = [];
  const devDependencies = [];

  // ... 现有依赖

  // ✅ 新增依赖
  if (config.template !== 'minimal') {
    dependencies.push('cli-table3@^0.6.3');
  }

  if (config.template === 'advanced') {
    dependencies.push('inquirer@^9.0.0');
  }

  return JSON.stringify({
    name: config.name,
    version: config.version,
    // ... 其他字段
    dependencies: dependencies.join(' '),
    devDependencies: devDependencies.join(' '),
  }, null, 2);
}
```

---

### 第 4 步: 创建模板文件

#### utils.ts 模板

创建 `scripts/templates/utils.ts`:

```typescript
/**
 * 环境检测工具
 */

export function isCI(): boolean {
  return !process.stdout.isTTY || process.env.CI === 'true';
}

export function supportsColor(): boolean {
  return !isCI() && process.env.NO_COLOR !== '1';
}

export function isDebug(): boolean {
  return process.env.DEBUG === 'true' || process.env.VERBOSE === 'true';
}

export function getEnvInfo() {
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

#### errors.ts 模板

创建 `scripts/templates/errors.ts`:

```typescript
/**
 * 错误处理工具
 */

import chalk from 'chalk';

export interface ErrorContext {
  [key: string]: string | string[];
}

export class CliError extends Error {
  code: string;
  suggestions: string[];
  context?: ErrorContext;

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

export function displayError(error: Error | CliError): void {
  if (error instanceof CliError) {
    console.error(chalk.red('✗ 错误: ') + error.message);

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
```

---

### 第 5 步: 测试验证

```bash
# 1. 创建测试 CLI
npx ts-node skills/cli-creator/scripts/init_cli.ts test-cli --template standard

# 2. 进入目录
cd test-cli

# 3. 安装依赖
npm install

# 4. 构建测试
npm run build

# 5. 测试命令
node dist/index.js --help
node dist/index.js add --help
node dist/index.js add test-project
```

---

## 📝 最小可行实施 (MVP)

如果时间有限，至少实施以下 3 项：

1. **✅ utils.ts** - 环境检测 (30 分钟)
2. **✅ errors.ts** - 友好错误处理 (1 小时)
3. **✅ TTY 检测集成到 logger** - CI 兼容性 (30 分钟)

**总时间**: 约 2 小时

**效果**:
- 生成的 CLI 在 CI/CD 中正常工作
- 错误消息友好且包含解决方案
- 彩色输出自动检测

---

## 🎯 完整实施时间估算

| 优先级 | 功能 | 预计时间 |
|--------|------|----------|
| P0 | utils.ts | 30 分钟 |
| P0 | errors.ts | 1 小时 |
| P0 | help.ts | 1.5 小时 |
| P0 | TTY 检测集成 | 30 分钟 |
| P1 | prompts.ts | 1 小时 |
| P1 | completion.ts | 1 小时 |
| P1 | exit-codes.ts | 30 分钟 |
| P2 | 进度条和表格 | 1 小时 |
| P2 | 操作摘要 | 30 分钟 |
| 集成测试 | 修改 init_cli.ts | 2 小时 |
| 测试验证 | 全面测试 | 2 小时 |

**总计**: 约 11 小时 (1.5 工作日)

---

## 📚 参考资源

- cli-developer 技能文档
  - design-patterns.md
  - node-cli.md
  - ux-patterns.md
- 实施方案: CLI_DEVELOPER_OPTIMIZATION.md
- 现有优化: OPTIMIZATION_SUMMARY.md

---

**创建时间**: 2026-01-31
**状态**: 快速实施指南已完成
**建议**: 先实施 MVP (3项核心改进),验证效果后再全面实施
