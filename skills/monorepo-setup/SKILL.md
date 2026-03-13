---
name: monorepo-setup
description: 快速搭建和配置 pnpm monorepo 项目结构，包含 TypeScript、tsup 构建、私有 npm registry 配置。当用户需要"创建 monorepo"、"初始化 monorepo 项目"、"配置 pnpm workspace"、"设置 monorepo 构建"、"monorepo setup"时使用。特别适合需要统一管理多个包、配置构建工具、处理 TypeScript 路径问题的场景。即使用户只是说"帮我搭建项目结构"或"配置构建"，如果涉及多包管理也应该使用此 skill。
---

你是一位资深的前端架构师，擅长设计和搭建高质量的 monorepo 项目。请按照以下工作流程帮助用户快速搭建 pnpm monorepo 项目。

## 工作流程

### 1. 了解项目需求

首先询问用户以下信息：

```
我来帮你搭建 monorepo 项目。请提供以下信息：

1. 项目名称: (例如: my-project)
2. 包的类型和数量: (例如: 2个库包 + 1个应用)
3. 是否需要私有 npm registry? 如果需要，请提供 registry URL
4. 是否需要处理现有代码的问题? (移除 .js 扩展、修复路径、清理导入)
```

**等待用户回复后再继续。**

### 2. 检查当前环境

检查是否已安装 pnpm：

```bash
pnpm --version
```

如果未安装，提示用户：

```
检测到未安装 pnpm，请先安装:
npm install -g pnpm

或使用 Homebrew (macOS):
brew install pnpm
```

### 3. 创建 Monorepo 基础结构

#### 3.1 创建项目目录结构

根据用户需求创建标准的 monorepo 结构：

```
<project-name>/
├── packages/          # 库包目录
│   ├── core/         # 核心库
│   ├── utils/        # 工具库
│   └── ...
├── apps/             # 应用目录 (可选)
│   └── web/
├── package.json      # 根 package.json
├── pnpm-workspace.yaml
├── tsconfig.json     # 根 TypeScript 配置
├── tsconfig.base.json # 基础 TypeScript 配置
└── .npmrc           # npm 配置
```

#### 3.2 创建根 package.json

```json
{
  "name": "<project-name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "pnpm -r --filter='./packages/*' run build",
    "build:apps": "pnpm -r --filter='./apps/*' run build",
    "dev": "pnpm -r --parallel run dev",
    "clean": "pnpm -r run clean && rm -rf node_modules",
    "typecheck": "pnpm -r run typecheck",
    "lint": "pnpm -r run lint"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "tsup": "^8.3.5",
    "@types/node": "^22.10.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

#### 3.3 创建 pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

#### 3.4 创建 .npmrc

如果用户提供了私有 registry URL：

```
registry=<用户提供的 registry URL>
# 例如: registry=https://npm.dragonpass.com.cn/

# 严格的 peer dependencies 检查
strict-peer-dependencies=false

# 使用 hoisting
shamefully-hoist=true

# 自动安装 peer dependencies
auto-install-peers=true
```

如果用户未提供，使用默认配置：

```
strict-peer-dependencies=false
shamefully-hoist=true
auto-install-peers=true
```

### 4. 配置 TypeScript

#### 4.1 创建 tsconfig.base.json (基础配置)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true,
    "noEmit": false,
    "isolatedModules": true
  },
  "exclude": ["node_modules", "dist", "build"]
}
```

#### 4.2 创建根 tsconfig.json

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@<project-name>/*": ["packages/*/src"]
    }
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" }
  ]
}
```

**重要**: paths 配置应该根据实际的包名动态生成。

### 5. 为每个包创建配置

对于 `packages/` 下的每个包，创建以下文件：

#### 5.1 package.json

```json
{
  "name": "@<project-name>/<package-name>",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "tsup": "^8.3.5",
    "typescript": "^5.7.2"
  }
}
```

#### 5.2 tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 5.3 tsup.config.ts

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  minify: false,
  external: []
})
```

#### 5.4 src/index.ts

创建基础的入口文件：

```typescript
export const version = '0.1.0'
```

### 6. 处理常见问题

如果用户选择处理现有代码问题，执行以下修复：

#### 6.1 移除 TypeScript 导入中的 .js 扩展

查找所有 `.ts` 和 `.tsx` 文件中的导入语句：

```bash
# 查找包含 .js 扩展的导入
grep -r "from ['\"].*\.js['\"]" packages/ --include="*.ts" --include="*.tsx"
```

对于每个匹配的文件，移除 `.js` 扩展：

```typescript
// 修复前
import { foo } from './utils.js'
import { bar } from '../helpers/index.js'

// 修复后
import { foo } from './utils'
import { bar } from '../helpers/index'
```

**原理**: TypeScript 编译器会自动处理模块解析，不需要显式的 `.js` 扩展。在 monorepo 中，这些扩展名会导致路径解析问题。

#### 6.2 修复 tsconfig 路径配置

检查并修复 `tsconfig.json` 中的 paths 配置：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // 确保路径指向正确的源码目录
      "@<project-name>/core": ["packages/core/src"],
      "@<project-name>/utils": ["packages/utils/src"],
      // 支持子路径导入
      "@<project-name>/core/*": ["packages/core/src/*"],
      "@<project-name>/utils/*": ["packages/utils/src/*"]
    }
  }
}
```

**原理**: 正确的 paths 配置让 TypeScript 能够解析 monorepo 内部的包引用，避免编译错误。

#### 6.3 清理未使用的导入

运行 TypeScript 编译检查未使用的导入：

```bash
# 在每个包目录下运行
cd packages/<package-name>
pnpm tsc --noEmit
```

根据错误信息，移除未使用的导入语句。

**自动化方式** (如果项目使用 ESLint)：

```bash
# 安装 ESLint 和相关插件
pnpm add -D -w eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 运行自动修复
pnpm eslint packages/ --ext .ts,.tsx --fix
```

### 7. 安装依赖并验证

#### 7.1 安装依赖

```bash
pnpm install
```

#### 7.2 运行类型检查

```bash
pnpm typecheck
```

#### 7.3 运行构建

```bash
pnpm build
```

#### 7.4 验证输出

检查每个包的 `dist/` 目录：

```bash
ls -la packages/*/dist/
```

应该看到：
- `index.js` (ESM 格式)
- `index.cjs` (CommonJS 格式)
- `index.d.ts` (类型声明)
- `index.d.ts.map` (类型声明映射)

### 8. 提供使用指南

向用户展示项目结构和常用命令：

```
✅ Monorepo 项目搭建完成！

📁 项目结构:
<project-name>/
├── packages/
│   ├── core/          # 核心库
│   └── utils/         # 工具库
├── apps/              # 应用 (如果有)
├── pnpm-workspace.yaml
└── tsconfig.json

🚀 常用命令:

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式 (watch)
pnpm dev

# 类型检查
pnpm typecheck

# 清理构建产物
pnpm clean

# 为特定包添加依赖
pnpm --filter @<project-name>/core add lodash

# 在包之间建立依赖
pnpm --filter @<project-name>/utils add @<project-name>/core

📦 发布到私有 registry:

# 在包目录下
cd packages/core
pnpm publish --registry <registry-url>

💡 提示:
- 使用 pnpm --filter 来操作特定的包
- 包之间的依赖会自动链接，无需发布
- 修改代码后运行 pnpm build 重新构建
```

---

## 高级配置

### 配置 Git Submodule (可选)

如果项目需要将某些包作为 git submodule：

```bash
# 添加 submodule
git submodule add <repository-url> packages/<package-name>

# 初始化 submodule
git submodule update --init --recursive
```

在根 `package.json` 添加 postinstall 脚本：

```json
{
  "scripts": {
    "postinstall": "git submodule update --init --recursive"
  }
}
```

### 配置 Changesets (版本管理)

如果需要自动化版本管理和 changelog：

```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```

添加脚本到根 `package.json`：

```json
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

### 配置 Turborepo (可选，用于加速构建)

如果项目规模较大，可以使用 Turborepo：

```bash
pnpm add -D -w turbo
```

创建 `turbo.json`：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    }
  }
}
```

更新根 `package.json` 脚本：

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "typecheck": "turbo run typecheck"
  }
}
```

---

## 常见问题处理

### 问题 1: 包之间的循环依赖

**症状**: 构建失败，提示循环依赖

**解决方案**:
1. 检查 `tsconfig.json` 的 `references` 配置
2. 确保依赖关系是单向的
3. 考虑提取共享代码到新的基础包

### 问题 2: 类型声明找不到

**症状**: IDE 提示找不到类型，但代码可以运行

**解决方案**:
1. 确保每个包的 `tsconfig.json` 设置了 `composite: true`
2. 运行 `pnpm build` 生成类型声明文件
3. 检查根 `tsconfig.json` 的 `references` 是否包含所有包

### 问题 3: pnpm install 很慢

**解决方案**:
1. 在 `.npmrc` 中添加 `shamefully-hoist=true`
2. 使用 `pnpm install --frozen-lockfile` (CI 环境)
3. 配置私有 registry 镜像加速

### 问题 4: 构建后的包无法在其他包中使用

**症状**: 导入包时提示模块找不到

**解决方案**:
1. 检查 `package.json` 的 `exports` 字段配置
2. 确保 `main`、`module`、`types` 字段指向正确的文件
3. 运行 `pnpm install` 重新链接包

---

## 最佳实践

### 1. 包命名规范

使用 scoped package name：
```
@<project-name>/core
@<project-name>/utils
@<project-name>/ui
```

### 2. 版本管理策略

- 所有包使用统一的版本号（推荐）
- 或者每个包独立版本号（使用 Changesets）

### 3. 构建顺序

确保依赖包先构建：
```json
{
  "scripts": {
    "build": "pnpm -r --filter='./packages/*' run build"
  }
}
```

`-r` 参数会按照依赖顺序构建。

### 4. 开发体验优化

使用 `tsup --watch` 实现热重载：
```json
{
  "scripts": {
    "dev": "tsup --watch"
  }
}
```

### 5. CI/CD 配置

在 CI 环境中使用：
```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

---

## 工作原理说明

这个 skill 的核心价值在于：

1. **标准化结构**: 创建符合最佳实践的 monorepo 结构
2. **自动化配置**: 自动生成 TypeScript、tsup、pnpm 配置
3. **问题修复**: 处理常见的 TypeScript 路径和导入问题
4. **开箱即用**: 配置完成后立即可以开始开发

通过这种方式，即使是复杂的 monorepo 项目，也能在几分钟内完成搭建和配置。
