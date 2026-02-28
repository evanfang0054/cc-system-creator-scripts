# 依赖配置指南

本文档提供 Node.js CLI 项目的依赖配置指南,包括最小化方案、完整功能和框架特定配置。

## 最小化依赖方案

适合快速原型、学习项目或超轻量级工具。

### 核心依赖

```json
{
  "dependencies": {
    "commander": "^12.0.0"
  }
}
```

### 可选 UI 增强

```json
{
  "dependencies": {
    "chalk": "^5.3.0",
    "ora": "^8.0.0"
  }
}
```

### 开发依赖

```json
{
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsx": "^4.19.0",
    "@types/node": "^22.0.0"
  }
}
```

**总依赖数**: ~4 个
**node_modules 大小**: ~50MB

---

## 完整功能方案

适合标准 CLI 项目,包含配置管理、测试、代码质量工具。

### 生产依赖

```json
{
  "dependencies": {
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "cosmiconfig": "^9.0.0",
    "zod": "^3.23.0",
    "execa": "^9.5.0"
  }
}
```

### 开发依赖

```json
{
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsx": "^4.19.0",
    "tsdown": "^0.3.0",
    "vitest": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0",
    "@biomejs/biome": "^1.9.0",
    "@types/node": "^22.0.0"
  }
}
```

**总依赖数**: ~13 个
**node_modules 大小**: ~200MB

---

## 框架特定配置

### Commander.js

**核心依赖**:
```json
{
  "dependencies": {
    "commander": "^12.0.0"
  }
}
```

**特点**:
- API 简洁直观
- 学习曲线低
- 社区最成熟

**推荐配置**:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsdown src/index.ts --format cjs,esm"
  }
}
```

---

### oclif

**核心依赖**:
```json
{
  "dependencies": {
    "@oclif/core": "^4.0.0",
    "@oclif/plugin-help": "^6.0.0",
    "@oclif/plugin-plugins": "^4.0.0"
  }
}
```

**可选依赖**:
```json
{
  "dependencies": {
    "@oclif/plugin-autocomplete": "^3.0.0",
    "@oclif/plugin-notifier": "^3.0.0"
  }
}
```

**特点**:
- 插件系统强大
- 自动生成文档
- 企业级质量

**推荐配置**:
```json
{
  "oclif": {
    "bin": "mycli",
    "dirname": "mycli",
    "commands": "./dist/commands",
    "plugins": [
      "@oclif/plugin-help",
      "@oclif/plugin-plugins"
    ]
  }
}
```

---

### Yargs

**核心依赖**:
```json
{
  "dependencies": {
    "yargs": "^17.7.0"
  }
}
```

**可选依赖**:
```json
{
  "dependencies": {
    "yargs-parser": "^21.1.0"
  }
}
```

**特点**:
- 内置参数验证
- 中间件支持
- 复杂场景处理能力强

**推荐配置**:
```typescript
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .parserConfiguration({
    'camel-case-expansion': true,
    'boolean-negation': true,
  })
  .parse();
```

---

### Ink

**核心依赖**:
```json
{
  "dependencies": {
    "ink": "^4.4.0",
    "react": "^18.2.0",
    "react-reconciler": "^0.29.0"
  }
}
```

**可选 UI 组件**:
```json
{
  "dependencies": {
    "ink-spinner": "^5.0.0",
    "ink-progress-bar": "^3.0.0",
    "ink-select-input": "^5.0.0",
    "ink-text-input": "^5.0.0"
  }
}
```

**特点**:
- React 组件化
- Rich UI 支持
- 交互能力强

**推荐配置**:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.tsx",
    "build": "tsdown src/index.tsx --format cjs,esm"
  }
}
```

**tsconfig.json 调整**:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "ink"
  }
}
```

---

### citty

**核心依赖**:
```json
{
  "dependencies": {
    "citty": "^0.1.0"
  }
}
```

**特点**:
- 超轻量
- ESM 原生
- UnJS 生态

**推荐配置**:
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --format esm"
  }
}
```

---

### cac

**核心依赖**:
```json
{
  "dependencies": {
    "cac": "^6.8.0"
  }
}
```

**特点**:
- 零依赖
- 极小体积
- 快速上手

---

## UI 库

### 颜色和样式

| 库 | 周下载量 | 大小 | 特点 |
|----|---------|------|------|
| **chalk** | 299M+ | 15KB | 最流行,功能丰富 |
| **kleur** | 10M+ | 0.5KB | 轻量,快速 |
| **ansi-colors** | 50M+ | 3KB | 高性能 |
| **gradient-string** | 2M+ | 5KB | 渐变效果 |

**推荐**: chalk (默认)

```typescript
import chalk from 'chalk';

console.log(chalk.blue('Info'));
console.log(chalk.green('Success'));
console.log(chalk.red('Error'));
console.log(chalk.yellow('Warning'));
```

### 加载动画

| 库 | 周下载量 | 特点 |
|----|---------|------|
| **ora** | 50M+ | 优雅,可定制 |
| **cli-spinners** | 30M+ | 多种样式 |
| **listr2** | 5M+ | 任务列表 UI |
| **nanospinner** | 1M+ | 超轻量 |

**推荐**: ora (默认)

```typescript
import ora from 'ora';

const spinner = ora('Loading...').start();
spinner.succeed('Done!');
spinner.fail('Error!');
```

### 交互式提示

| 库 | 周下载量 | 特点 |
|----|---------|------|
| **enquirer** | 5M+ | 快速,可扩展 |
| **inquirer** | 10M+ | 功能全面 |
| **prompts** | 8M+ | 简洁 API |
| **@inquirer/prompts** | 3M+ | 现代版本 |

**推荐**: enquirer (性能) 或 @inquirer/prompts (现代)

```typescript
import { prompt } from 'enquirer';

const response = await prompt([
  {
    type: 'input',
    name: 'name',
    message: 'Project name?',
  },
]);
```

---

## 配置管理

### 配置加载

| 库 | 特点 |
|----|------|
| **conf** | 简单,符合 XDG 规范 |
| **cosmiconfig** | 支持多格式,灵活 |
| **configstore** | 轻量 |
| **rc** | 标准 rc 格式 |

**推荐**: cosmiconfig (灵活) + zod (验证)

```typescript
import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';

const schema = z.object({
  apiKey: z.string(),
});

const explorer = cosmiconfig('mycli');
const result = await explorer.search();
const config = schema.parse(result?.config);
```

### 配置验证

| 库 | 特点 |
|----|------|
| **zod** | TypeScript 友好,强大 |
| **joi** | 成熟,功能丰富 |
| **yup** | 轻量,简单 |
| **ajv** | JSON Schema 验证 |

**推荐**: zod (默认)

---

## 进程执行

| 库 | 特点 |
|----|------|
| **execa** | Promise 接口,跨平台 |
| **zx** | 脚本编写,内置工具 |
| **cross-spawn** | 跨平台 spawn |

**推荐**: execa (默认)

```typescript
import { execa } from 'execa';

const { stdout } = await execa('git', ['status']);
```

---

## 打包工具

| 工具 | 特点 | 适用场景 |
|----|------|---------|
| **tsdown** | 基于 Rolldown,快速 | TypeScript 库 |
| **tsup** | 基于 esbuild,简单 | 小型项目 |
| **esbuild** | 极速打包 | 大型项目 |
| **@vercel/ncc** | 单文件输出 | CLI 工具 |

**推荐**: tsdown (默认) 或 @vercel/ncc (单文件)

---

## 测试工具

| 框架 | 特点 | 适用场景 |
|----|------|---------|
| **Vitest** | 极速,HMR | 现代项目 |
| **Jest** | 成熟,生态丰富 | 大型项目 |
| **Node Test Runner** | 内置,零依赖 | 简单项目 |

**推荐**: Vitest (默认)

```json
{
  "devDependencies": {
    "vitest": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0"
  }
}
```

---

## 代码质量

### Linting

| 工具 | 特点 | 适用场景 |
|----|------|---------|
| **Biome** | 快速,一体 | 现代 JavaScript/TS |
| **ESLint** | 生态丰富 | 传统项目 |
| **Deno lint** | 内置,Deno | Deno 项目 |

**推荐**: Biome (默认)

```json
{
  "devDependencies": {
    "@biomejs/biome": "^1.9.0"
  },
  "scripts": {
    "lint": "biome check .",
    "format": "biome format . --write"
  }
}
```

### TypeScript

```json
{
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsx": "^4.19.0",
    "@types/node": "^22.0.0"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 安全性考虑

### 依赖审计

```bash
# npm
npm audit

# pnpm
pnpm audit

# yarn
yarn audit
```

### 使用 Snyk

```bash
npm install -g snyk
snyk test
snyk monitor
```

### 最小化攻击面

1. **避免不必要的依赖**
   - 每个依赖都是潜在的安全风险
   - 定期审查依赖

2. **固定依赖版本**
   ```json
   {
     "dependencies": {
       "commander": "12.0.0"  // 精确版本
     }
   }
   ```

3. **使用 npm overrides**
   ```json
   {
     "overrides": {
       "minimatch": "^3.0.5"
     }
   }
   ```

---

## 版本选择建议

### 稳定性优先

```json
{
  "dependencies": {
    "commander": "^12.0.0"  // 主版本锁定
  }
}
```

### 最新功能优先

```json
{
  "dependencies": {
    "commander": "~12.0.0"  // 次版本锁定
  }
}
```

### 锁定模式

```json
{
  "dependencies": {
    "commander": "12.0.0"  // 精确版本
  }
}
```

---

## 完整示例: 标准配置

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mycli": "./bin/run.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsdown src/index.ts --format cjs,esm",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "biome check .",
    "format": "biome format . --write",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "cosmiconfig": "^9.0.0",
    "zod": "^3.23.0",
    "execa": "^9.5.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsx": "^4.19.0",
    "tsdown": "^0.3.0",
    "vitest": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0",
    "@biomejs/biome": "^1.9.0",
    "@types/node": "^22.0.0"
  },
  "files": [
    "bin",
    "dist",
    "src"
  ]
}
```

---

## 依赖更新策略

### 定期更新

```bash
# 交互式更新
npx npm-check-updates -u

# 检查过期依赖
npm outdated
```

### 使用 Dependabot

创建 `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Renovate

更强大的自动化更新工具:
```yaml
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"]
}
```
