# Node.js CLI 工具开发 Skill (2025-2026)

## 概述

本文档整理了2025-2026年Node.js CLI工具开发的最新技术栈、优秀设计思路和依赖库，帮助开发者构建现代化、高性能、用户友好的命令行工具。

---

## 一、核心框架选择

### 1.1 完整CLI框架

| 框架 | 特点 | 适用场景 | 文档链接 |
|------|------|----------|----------|
| **oclif** | Salesforce维护，插件系统，自动生成文档，支持TypeScript | 大型企业级CLI，需要插件扩展 | https://oclif.io/ |
| **Commander.js** | 最流行(每周2亿+下载)，简单易用，成熟稳定 | 中小型CLI，快速开发 | https://github.com/tj/commander.js |
| **Yargs** | 功能丰富，声明式语法，中间件支持 | 需要复杂参数验证和中间件 | https://yargs.js.org/ |
| **Ink + Pastel** | React组件化UI，现代化交互体验 | 需要富交互UI的CLI | https://github.com/vadimdemedes/ink |
| **citty** (UnJS) | 轻量，高性能，现代ESM | 现代轻量级CLI | https://github.com/unjs/citty |
| **cac** | 极简，零依赖 | 超轻量级工具 | https://github.com/cacjs/cac |
| **gunshi** | Type-safe，小体积，活跃开发 | 现代TypeScript项目 | https://github.com/kazupon/gunshi |

### 1.2 框架选择建议

```
项目规模评估:
├── 简单脚本 (1-5个命令) → Commander.js / cac
├── 中型工具 (5-20个命令) → oclif / Yargs
├── 富交互UI → Ink + Pastel
└── 企业级/插件化 → oclif
```

---

## 二、UI与交互库

### 2.1 颜色与样式

| 库 | 用途 | 周下载量 | 文档 |
|----|------|----------|------|
| **chalk** | 终端字符串样式 | 299M+ | https://github.com/chalk/chalk |
| **kleur** | 轻量级颜色库 | - | https://github.com/lukeed/kleur |
| **ansi-colors** | 高性能ANSI颜色 | - | https://github.com/doowb/ansi-colors |
| **gradient-string** | 渐变文字效果 | - | https://github.com/bokub/gradient-string |

### 2.2 加载动画与进度

| 库 | 用途 | 特点 | 文档 |
|----|------|------|------|
| **ora** | 终端spinner | 优雅、可定制 | https://github.com/sindresorhus/ora |
| **cli-spinners** | 多种spinner样式 | 被ora依赖 | https://github.com/sindresorhus/cli-spinners |
| **listr2** | 任务列表UI | 交互式任务流 | https://listr2.kilic.dev/ |
| **progress** | 进度条 | 简单实用 | https://github.com/visionmedia/node-progress |
| **nanospinner** | 超轻量spinner | 体积小 | https://github.com/usmanyunusov/nanospinner |

### 2.3 交互式提示

| 库 | 用途 | 特点 | 文档 |
|----|------|------|------|
| **enquirer** | 交互式prompt | 快速(~4ms加载)，可扩展 | https://github.com/enquirer/enquirer |
| **inquirer** | 问答式交互 | 最流行，功能全面 | https://github.com/SBoudrias/Inquirer.js |
| **prompts** | 轻量prompt | 简洁API | https://github.com/terkelg/prompts |
| **@inquirer/prompts** | inquirer新版 | 现代API，推荐 | https://www.npmjs.com/package/@inquirer/prompts |

### 2.4 富UI组件 (Ink生态)

```bash
# Ink核心
npm install ink react

# Ink UI组件库
npm install ink-ui          # 官方UI组件
npm install ink-spinner     # Spinner组件
npm install ink-progress-bar # 进度条
npm install ink-select-input # 选择列表
npm install ink-text-input  # 文本输入
npm install ink-box         # 布局盒子
npm install ink-link        # 超链接
```

---

## 三、配置管理

### 3.1 配置文件库

| 库 | 用途 | 特点 | 文档 |
|----|------|------|------|
| **conf** | 配置持久化 | 简单，符合XDG规范 | https://github.com/sindresorhus/conf |
| **cosmiconfig** | 多格式配置加载 | 支持rc文件、package.json等 | https://github.com/cosmiconfig/cosmiconfig |
| **configstore** | 配置存储 | 轻量 | https://github.com/yeoman/configstore |
| **rc** | rc文件解析 | 标准rc格式 | https://github.com/dominictarr/rc |
| **zod** | 配置验证 | TypeScript schema验证 | https://zod.dev/ |

### 3.2 推荐配置方案

```typescript
// 使用 cosmiconfig + zod 实现类型安全配置
import { cosmiconfigSync } from 'cosmiconfig';
import { z } from 'zod';

const configSchema = z.object({
  apiKey: z.string().optional(),
  endpoint: z.string().url().default('https://api.example.com'),
  timeout: z.number().min(1000).default(5000),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const explorer = cosmiconfigSync('mycli');
  const result = explorer.search();
  return configSchema.parse(result?.config || {});
}
```

---

## 四、进程与执行

### 4.1 子进程执行

| 库 | 用途 | 特点 | 文档 |
|----|------|------|------|
| **execa** | 进程执行 | Promise接口，跨平台，人类友好 | https://github.com/sindresorhus/execa |
| **zx** | Google出品 | 脚本编写，内置chalk、fs-extra | https://github.com/google/zx |
| **cross-spawn** | 跨平台spawn | 解决Windows兼容 | https://github.com/moxystudio/node-cross-spawn |

### 4.2 使用示例

```typescript
// execa 推荐用法
import { execa } from 'execa';

// 执行命令并获取输出
const { stdout } = await execa('git', ['status', '--short']);

// 带spinner的执行
import ora from 'ora';

const spinner = ora('Installing dependencies...').start();
try {
  await execa('npm', ['install']);
  spinner.succeed('Dependencies installed');
} catch (error) {
  spinner.fail('Installation failed');
  throw error;
}

// zx 脚本风格
#!/usr/bin/env zx
import { $, cd, question } from 'zx';

cd('/tmp');
await $`ls -la`;
const name = await question('Project name? ');
await $`mkdir ${name}`;
```

---

## 五、打包与分发

### 5.1 打包工具对比

| 工具 | 特点 | 支持Node版本 | 推荐度 | 文档 |
|------|------|-------------|--------|------|
| **Node.js SEA** | 官方单文件可执行 | 20+ | ⭐⭐⭐⭐⭐ | https://nodejs.org/api/single-executable-applications.html |
| **nexe** | 编译为单文件 | 8-24 | ⭐⭐⭐⭐ | https://github.com/nexe/nexe |
| **pkg** (已归档) | 不再维护 | 仅到18.x | ❌不推荐 | - |
| **@vercel/ncc** | 编译为单文件 | 所有 | ⭐⭐⭐ | https://github.com/vercel/ncc |
| **esbuild** | 极速打包 | 所有 | ⭐⭐⭐⭐ | https://esbuild.github.io/ |

### 5.2 推荐打包方案

```bash
# 方案1: Node.js SEA (推荐新项目)
# 需要 Node.js 20+
node --experimental-sea-config sea-config.json

# 方案2: nexe (兼容性最好)
npm install -g nexe
nexe app.js --build --output dist/my-cli

# 方案3: tsdown (TypeScript库打包)
npm install tsdown
npx tsdown src/index.ts --format cjs,esm
```

---

## 六、测试框架

### 6.1 测试工具

| 框架 | 特点 | 适用场景 | 文档 |
|------|------|----------|------|
| **Vitest** | 极速，Vite生态，HMR | 现代项目首选 | https://vitest.dev/ |
| **Jest** | 成熟，生态丰富 | 大型项目，迁移项目 | https://jestjs.io/ |
| **Node Test Runner** | 内置，零依赖 | 简单项目 | https://nodejs.org/api/test.html |
| **AVA** | 极简，并发 | 轻量测试 | https://github.com/avajs/ava |

### 6.2 CLI测试辅助

| 库 | 用途 | 文档 |
|----|------|------|
| **ink-testing-library** | 测试Ink组件 | https://github.com/vadimdemedes/ink-testing-library |
| **strip-ansi** | 去除ANSI字符用于断言 | https://github.com/chalk/strip-ansi |

### 6.3 测试示例

```typescript
// Vitest + execa 测试CLI
import { describe, it, expect } from 'vitest';
import { execa } from 'execa';

describe('CLI', () => {
  it('should display version', async () => {
    const { stdout } = await execa('node', ['./bin/run.js', '--version']);
    expect(stdout).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should show help', async () => {
    const { stdout } = await execa('node', ['./bin/run.js', '--help']);
    expect(stdout).toContain('USAGE');
  });
});
```

---

## 七、开发工具链

### 7.1 TypeScript支持

| 工具 | 用途 | 特点 | 文档 |
|------|------|------|------|
| **tsx** | TypeScript执行 | 极速，推荐开发 | https://github.com/privatenumber/tsx |
| **ts-node** | TypeScript执行 | 传统方案 | https://typestrong.org/ts-node/ |
| **tsdown** | TypeScript打包 | 基于Rolldown | https://tsdown.dev/ |

### 7.2 代码质量

| 工具 | 用途 | 文档 |
|------|------|------|
| **Biome** | 快速lint+format | https://biomejs.dev/ |
| **ESLint** | 代码检查 | https://eslint.org/ |
| **Prettier** | 代码格式化 | https://prettier.io/ |
| **TypeScript** | 类型检查 | https://www.typescriptlang.org/ |

### 7.3 开发工作流

```json
// package.json scripts 推荐配置
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsdown src/index.ts --format cjs,esm",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "biome check .",
    "format": "biome format . --write",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 八、优秀CLI项目参考

### 8.1 值得学习的项目

| 项目 | 技术栈 | 特点 | GitHub |
|------|--------|------|--------|
| **Vercel CLI** | oclif, TypeScript | 企业级，插件化 | vercel/vercel |
| **Turborepo** | Rust + TypeScript | 高性能构建 | vercel/turborepo |
| **Nx** | TypeScript | 大型monorepo | nrwl/nx |
| **Claude Code** | TypeScript | AI驱动CLI | anthropics/claude-code |
| **Atuin** | Rust | 历史记录同步 | atuinsh/atuin |
| **Taskmaster** | Node.js | AI任务管理 | eyaltoledano/claude-task-master |
| **OpenCode** | TypeScript | AI代码助手 | opencode-ai/opencode |
| **Sindre Sorhus CLI集合** | 各种 | 高质量小工具 | sindresorhus/* |

### 8.2 设计模式参考

```
优秀CLI的共同特点:
├── 清晰的命令层次结构
├── 一致的参数命名 (--help, --version, --json)
├── 有意义的错误信息
├── 支持 --json 输出便于脚本集成
├── 渐进式披露 (简单用例→高级功能)
├── 智能默认值
├── 优雅降级 (无TTY环境)
└── 详细的帮助文档
```

---

## 九、设计思路与最佳实践

### 9.1 用户体验原则

1. **POSIX兼容**
   - 短参数 `-a`，长参数 `--all`
   - 可组合参数 `-abc` = `-a -b -c`
   - 可选参数用 `[]`，必需参数用 `<>`

2. **富有同理心的CLI**
   - 缺少参数时提供交互式提示
   - 提供有用的错误信息和修复建议
   - 支持 `--dry-run` 预览操作

3. **状态持久化**
   - 记住用户偏好设置
   - 使用XDG规范存储配置
   - 支持 `--reset` 清除配置

4. **彩色输出**
   - 使用颜色高亮重要信息
   - 支持 `NO_COLOR` 环境变量
   - 自动检测TTY能力

5. **富交互**
   - 使用spinner显示进度
   - 使用列表展示任务
   - 支持键盘导航

### 9.2 代码组织

```
my-cli/
├── src/
│   ├── commands/           # 命令实现
│   │   ├── init.ts
│   │   ├── deploy.ts
│   │   └── config/
│   │       ├── get.ts
│   │       └── set.ts
│   ├── lib/               # 共享库
│   │   ├── config.ts      # 配置管理
│   │   ├── logger.ts      # 日志工具
│   │   └── api.ts         # API客户端
│   ├── utils/             # 工具函数
│   │   ├── spinner.ts
│   │   └── errors.ts
│   ├── types/             # TypeScript类型
│   └── index.ts           # 入口
├── test/                  # 测试文件
├── bin/                   # 可执行脚本
│   ├── dev.js
│   └── run.js
├── package.json
├── tsconfig.json
└── README.md
```

### 9.3 错误处理

```typescript
// 推荐错误处理模式
import { CLIError } from '@oclif/core/errors';

class UserError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'UserError';
  }
}

// 命令中使用
async run() {
  try {
    await this.performAction();
  } catch (error) {
    if (error instanceof UserError) {
      this.error(`[${error.code}] ${error.message}`, {
        suggestions: ['Run `mycli config:validate` to check your setup'],
      });
    }
    throw error;
  }
}
```

---

## 十、依赖清单速查

### 10.1 最小化CLI依赖

```bash
# 核心框架 (选一个)
npm install commander          # 或 oclif, yargs, ink

# UI增强
npm install chalk ora

# 配置管理
npm install conf cosmiconfig

# 进程执行
npm install execa

# 类型安全
npm install zod
```

### 10.2 完整开发依赖

```bash
# TypeScript
npm install -D typescript tsx tsdown

# 测试
npm install -D vitest @vitest/coverage-v8

# 代码质量
npm install -D @biomejs/biome

# 类型定义
npm install -D @types/node
```

---

## 十一、文档链接汇总

### 官方文档
- oclif: https://oclif.io/
- Commander.js: https://github.com/tj/commander.js#readme
- Ink: https://github.com/vadimdemedes/ink
- Vitest: https://vitest.dev/
- esbuild: https://esbuild.github.io/
- tsdown: https://tsdown.dev/

### 最佳实践指南
- Node.js CLI最佳实践: https://github.com/lirantal/nodejs-cli-apps-best-practices
- POSIX参数规范: https://www.gnu.org/software/libc/manual/html_node/Argument-Syntax.html
- XDG规范: https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html

---

## 十二、版本信息

- 文档创建时间: 2026-01-31
- 适用Node.js版本: 18.x, 20.x, 22.x (推荐20+)
- 主要参考: GitHub Trending 2025, npm生态系统现状

---

*本Skill文档持续更新，建议定期查阅最新版本。*
